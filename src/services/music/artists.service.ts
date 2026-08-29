import { count, eq, getTableColumns } from "drizzle-orm"

import { db } from "#db/index"
import { albums, artistMusicbrainz, artists } from "#db/schema"

type Artist = typeof artists.$inferSelect
type ArtistMusicbrainz = typeof artistMusicbrainz.$inferSelect

type ArtistWithMBStatus = {
  artists: Artist
  artist_musicbrainz: ArtistMusicbrainz | null
}


export const getAllArtists = async () =>
  db.select().from(artists)
export const getAllArtistsWithAlbumCount = async () =>
  db.select({
    ...getTableColumns(artists),
    albumCount: count(albums.id),
  })
  .from(artists)
  .leftJoin(albums, eq(albums.artistId, artists.id))
  .groupBy(artists.id)

type GetArtist = {
  (id: string, withMBStatus: true): Promise<ArtistWithMBStatus | undefined>
  (id: string, withMBStatus?: false): Promise<Artist | undefined>
}
export const getArtist: GetArtist = (async (id: string, withMBStatus: boolean = false) => {
  const query = db.select().from(artists).where(eq(artists.id, id))
  if(withMBStatus){
    return query.leftJoin(
      artistMusicbrainz,
      eq(artists.id, artistMusicbrainz.artistId)
    ).then(r => r.at(0))
  }
  return query.then(r => r.at(0))
})  as GetArtist


export const updateArtistMusicbrainzLastFetched = (artistId: string, saved: boolean, source: string) =>
  db.insert(artistMusicbrainz)
    .values({ artistId, lastFetchedAt: new Date(), lastAttemptAt: new Date(), status: saved ? 'matched' : 'not_found' })
    .onConflictDoUpdate({
      target: artistMusicbrainz.artistId,
      set: { lastFetchedAt: new Date(), lastAttemptAt: new Date(), status: saved ? 'matched' : 'not_found' },
    })

export const updateArtistMusicbrainzLastFailedAttempt = (artistId: string) =>
  db.insert(artistMusicbrainz)
    .values({ artistId, lastAttemptAt: new Date(), status: 'error' })
    .onConflictDoUpdate({
      target: artistMusicbrainz.artistId,
      set: { lastAttemptAt: new Date(), status: 'error' },
    })
