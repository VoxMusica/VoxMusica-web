import { sql } from 'drizzle-orm'

import { invalidateLibraryCache } from '#cache'
import { BatchInserter } from "#db/batch-inserter"
import { db } from "#db/index"
import { albumsStaging, artistsStaging, tracksStaging } from "#db/schema"
import { getCurrentScan, setScanStatus } from "#services/scans/scans.service"
import { parseTrackFile } from "./parse-track.ts"
import { ScanContext } from "./scan-context.ts"
import { cleanStagingTables, swapStagingIntoMain } from "./staging-swap.ts"
import { walkLibrary } from "./walker.ts"

import type { Job } from "bullmq"
import type { Logger } from "pino"

export const startScan = async (job: Job, logger: Logger) => {
  const scan = await getCurrentScan()
  if(scan == null){
    logger.warn('no active scan')
    return
  }
  if(scan.status != 'queued') {
    logger.warn("There is already a scan running")
  }
  await setScanStatus(scan?.id, 'running')

  await cleanStagingTables()

  try{
    const ctx = new ScanContext()
    const artistInserter = new BatchInserter<typeof artistsStaging.$inferInsert>(100, async (rows) => { 
      await db
        .insert(artistsStaging)
        .values(rows)
        .onConflictDoNothing({
          target: artistsStaging.id,
        })
    })
    const albumInserter = new BatchInserter<typeof albumsStaging.$inferInsert>(100, async (rows) => {
      await db
        .insert(albumsStaging)
        .values(rows)
        .onConflictDoNothing({
          target: albumsStaging.id,
        })
    })
    const trackInserter = new BatchInserter<typeof tracksStaging.$inferInsert>(10, async (rows) => {
      await db
        .insert(tracksStaging)
        .values(rows)
        .onConflictDoNothing({
          target: tracksStaging.id,
        })
    })

    await db.run(sql`PRAGMA foreign_keys = OFF`);
    await walkLibrary(async (filePath) => {
      const result = await parseTrackFile(filePath, ctx)
        if (!result) return
        if (result.newArtist) await artistInserter.add(result.newArtist)
        if (result.newAlbum) await albumInserter.add(result.newAlbum)
        await trackInserter.add(result.track)
      },
      (counters) => job.updateProgress(counters)
    )

    await artistInserter.drain()
    await albumInserter.drain()
    await trackInserter.drain()

    await swapStagingIntoMain()
    await invalidateLibraryCache()
    await setScanStatus(scan?.id, 'completed')
  }
  catch(err) {
    logger.error('####################################')
    logger.error(err, 'Scanning error')
    await setScanStatus(scan?.id, 'failed')
  }
  finally {
    await cleanStagingTables()
    await db.run(sql`PRAGMA foreign_keys = ON`)
  }
}
