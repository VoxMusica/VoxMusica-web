import { randomInt } from "node:crypto"

import { isNull, lt, or } from "drizzle-orm"

import { db } from "#db/index"
import { albumMusicbrainz, artistMusicbrainz } from "#db/schema"
import { coverArtQueue, mbLookupQueue, schedulerQueue } from "#workers/queues"

const WINDOW_START_HOUR = 8
const WINDOW_END_HOUR = 22
const DAILY_JOB_ID = 'mb-daily-sweep'
const STALE_AFTER_MS = 30 * 24 * 60 * 60 * 1000 // 30 days, tune as needed

const delayUntilNextWindow = () => {
  const now = new Date()
  const target = new Date(now)
  const randomMinute = randomInt(WINDOW_START_HOUR * 60, WINDOW_END_HOUR * 60)
  target.setHours(Math.floor(randomMinute / 60), randomMinute % 60, 0, 0)

  if (target <= now) target.setDate(target.getDate() + 1)

  return target.getTime() - now.getTime()
}

export const armDailySweep = async () => {
  await schedulerQueue.add('sweep', {}, {
    jobId: DAILY_JOB_ID,
    delay: delayUntilNextWindow(),
    removeOnComplete: true,
    removeOnFail: true,
  })
}

export const staleFilterArtist = (col: typeof artistMusicbrainz.lastFetchedAt) =>
  or(isNull(col), lt(col, new Date(Date.now() - STALE_AFTER_MS)))
export const staleFilterAlbum = (col: typeof albumMusicbrainz.lastFetchedAt) =>
  or(isNull(col), lt(col, new Date(Date.now() - STALE_AFTER_MS)))

export const runSweep = async () => {
  const staleArtists = await db.select().from(artistMusicbrainz).where(staleFilterArtist(artistMusicbrainz.lastFetchedAt))
  const staleAlbums = await db.select().from(albumMusicbrainz).where(staleFilterAlbum(albumMusicbrainz.lastFetchedAt))

  for (const row of staleArtists) {
    await mbLookupQueue.add('artist', { artistId: row.artistId })
    await mbLookupQueue.add('artist-cover', { artistId: row.artistId })
  }

  for (const row of staleAlbums) {
    await mbLookupQueue.add('album', { albumId: row.albumId })
    await coverArtQueue.add('album', { albumId: row.albumId })
  }
}
