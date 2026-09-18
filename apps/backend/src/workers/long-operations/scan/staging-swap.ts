import { sql } from 'drizzle-orm'

import { db } from '#db/index'
import {
  albums, albumsStaging,
  artists, artistsStaging,
  trackDuplicates, trackDuplicatesStaging,
  tracks, tracksStaging,
} from '#db/schema'

import type { Logger } from "pino"


// order matters for cleanStagingTables only in that it doesn't — it truncates
// per-table with no FK checks. promoteStagingToMain below has its own
// explicit FK-safe ordering for the main tables.
const TABLES = ['tracks', 'albums', 'artists', 'trackDuplicates'] as const


export const cleanStagingTables = async () => {
  await db.transaction(async (tx) => {
    for (const table of TABLES) {
      await tx.run(sql.raw(`DELETE FROM ${table}Staging`))
    }
  })
}

export interface PromoteStagingResult {
  artistCount: number
  albumCount: number
  trackCount: number
  duplicateCount: number
  artistIdsWithNewContent: string[]
  albumIdsWithNewContent: string[]
}

export const promoteStagingToMain = async (logger: Logger): Promise<PromoteStagingResult> => {
  return db.transaction(async (tx) => {
    // capture what already existed
    const [existingArtistIds, existingAlbumIds, existingTrackIds] = await Promise.all([
      tx.select({ id: artists.id }).from(artists).then((rows) => new Set(rows.map((r) => r.id))),
      tx.select({ id: albums.id }).from(albums).then((rows) => new Set(rows.map((r) => r.id))),
      tx.select({ id: tracks.id }).from(tracks).then((rows) => new Set(rows.map((r) => r.id))),
    ])

    const [stagedArtists, stagedAlbums, stagedTracks, stagedDuplicates] = await Promise.all([
      tx.select().from(artistsStaging),
      tx.select().from(albumsStaging),
      tx.select().from(tracksStaging),
      tx.select().from(trackDuplicatesStaging),
    ])

    // wipe main tables in FK-safe order (children before parents)
    await tx.delete(trackDuplicates)
    await tx.delete(tracks)
    await tx.delete(albums)
    await tx.delete(artists)

    // repopulate from staging, parents before children
    if (stagedArtists.length > 0) await tx.insert(artists).values(stagedArtists)
    if (stagedAlbums.length > 0) await tx.insert(albums).values(stagedAlbums)
    if (stagedTracks.length > 0) await tx.insert(tracks).values(stagedTracks)
    if (stagedDuplicates.length > 0) await tx.insert(trackDuplicates).values(stagedDuplicates)

    // clear staging so the next scan starts from empty
    await tx.delete(trackDuplicatesStaging)
    await tx.delete(tracksStaging)
    await tx.delete(albumsStaging)
    await tx.delete(artistsStaging)

    const newArtistIds = stagedArtists.filter((a) => !existingArtistIds.has(a.id)).map((a) => a.id)
    const newAlbums = stagedAlbums.filter((a) => !existingAlbumIds.has(a.id))
    const newTracks = stagedTracks.filter((t) => !existingTrackIds.has(t.id))

    const artistIdsWithNewContent = new Set<string>([
      ...newArtistIds,
      ...newAlbums.map((a) => a.artistId),
      ...newTracks.map((t) => t.artistId),
    ])

     const albumIdsWithNewContent = new Set<string>([
      ...newAlbums.map((a) => a.id),
      ...newTracks.map((t) => t.albumId),
    ])

    logger.info(
      `Promoted staging to main: ${stagedArtists.length} artists, ${stagedAlbums.length} albums, ${stagedTracks.length} tracks, ${stagedDuplicates.length} duplicates skipped (${artistIdsWithNewContent.size} artists with new content)`
    )

    return {
      artistCount: stagedArtists.length,
      albumCount: stagedAlbums.length,
      trackCount: stagedTracks.length,
      duplicateCount: stagedDuplicates.length,
      artistIdsWithNewContent: [...artistIdsWithNewContent],
      albumIdsWithNewContent: [...albumIdsWithNewContent],
    }
  })
}
