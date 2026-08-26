import { BatchInserter } from "#db/batch-inserter"
import { db } from "#db/index"
import { albumsStaging, artistsStaging, tracksStaging } from "#db/schema"
import { getCurrentScan } from "#services/scans/scans.service"
import type { Job } from "bullmq"
import type { Logger } from "pino"
import { parseTrackFile } from "./scan/parse-track.ts"
import { ScanContext } from "./scan/scan-context.ts"
import { walkLibrary } from "./scan/walker.ts"
import { swapStagingIntoMain } from "./scan/staging-swap.ts"

export const startScan = async (job: Job, logger: Logger) => {
  const scan = await getCurrentScan()
  if(scan != null && scan.status != 'queued') {
    logger.warn("There is already a scan running")
  }

  console.log('lets go')

  const ctx = new ScanContext()
  const trackInserter = new BatchInserter<typeof tracksStaging.$inferInsert>(500, async (rows) => {
    console.log('tracks', rows) 
    await db.insert(tracksStaging).values(rows)
  })
  const albumInserter = new BatchInserter<typeof albumsStaging.$inferInsert>(100, async (rows) => { await db.insert(albumsStaging).values(rows) })
  const artistInserter = new BatchInserter<typeof artistsStaging.$inferInsert>(100, async (rows) => { await db.insert(artistsStaging).values(rows) })


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
}
