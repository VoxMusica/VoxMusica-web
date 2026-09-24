import { sql } from 'drizzle-orm'

import { invalidateLibraryCache } from '#cache'
import { BatchInserter } from "#db/batch-inserter"
import { db } from "#db/index"
import { albumsStaging, artistsStaging, trackDuplicatesStaging, tracksStaging } from "#db/schema"
import { getCurrentScan, setScanStatus } from "#services/scans/scans.service"
import { enqueueTransliteration } from '#services/transliteration/enqueue-transliteration.service'
import { mbLookupQueue } from '#workers/mb-lookup/queue'
import { parseTrackFile } from "./parse-track.ts"
import { ScanContext } from "./scan-context.ts"
import { cleanStagingTables, promoteStagingToMain } from "./staging-swap.ts"
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
    const duplicateInserter = new BatchInserter<typeof trackDuplicatesStaging.$inferInsert>(50, async (rows) => {
      await db.insert(trackDuplicatesStaging).values(rows)
    })

    await db.run(sql`PRAGMA foreign_keys = OFF`)
    await walkLibrary(
      (filePath) => parseTrackFile(filePath, ctx, logger),
      (counters) => job.updateProgress(counters)
    )

    // artists/albums/tracks are all flushed only now, once every file has
    // been seen. A later file can still retroactively promote an artist's
    // canonical name (script variant arriving after a romanized one), or
    // turn out to be a better-quality copy of a track already kept — those
    // mutations need to land before anything is inserted
    for (const artist of ctx.getAllArtists()) await artistInserter.add(artist)
    for (const album of ctx.getAllAlbums()) await albumInserter.add(album)
    for (const track of ctx.getAllTracks()) await trackInserter.add(track)
    for (const duplicate of ctx.getAllDuplicates()) await duplicateInserter.add(duplicate)

    await artistInserter.drain()
    await albumInserter.drain()
    await trackInserter.drain()
    await duplicateInserter.drain()

    const { artistIdsWithNewContent, albumIdsWithNewContent  } = await promoteStagingToMain(logger)

    for (const artistId of artistIdsWithNewContent) {
      await enqueueTransliteration(artistId)
      await mbLookupQueue.add('artist-cover', { artistId },{jobId: `artist-cover-${artistId}`})
    }
    for(const albumId of albumIdsWithNewContent){
      await mbLookupQueue.add('album-cover', { albumId },{jobId: `album-cover-${albumId}`})
    }
    await invalidateLibraryCache()
    
    await setScanStatus(scan?.id, 'completed')
  }
  catch(err) {
    logger.error(err, 'Scanning error')
    await setScanStatus(scan?.id, 'failed')
  }
  finally {
    await cleanStagingTables()
    await db.run(sql`PRAGMA foreign_keys = ON`)
  }
}
