import { eq } from "drizzle-orm"

import { db } from "#db/index"
import { artistMusicbrainz, artists } from "#db/schema"

type Artist = typeof artists.$inferSelect
type ArtistMusicbrainz = typeof artistMusicbrainz.$inferSelect

type ArtistWithMBStatus = {
  artists: Artist
  artist_musicbrainz: ArtistMusicbrainz | null
}


export const getAllArtists = async () =>
  db.select().from(artists)

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
