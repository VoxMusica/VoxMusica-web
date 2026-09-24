import z from "zod"

import { subsonicAuthParamsSchema, type OpensubsonicResponse } from "./oss-common.ts"

import type { ArtistWithAlbumsID3 } from "./oss-artist-with-albums.ts"
import type { Child } from "./oss-child.ts"


export interface IndexArtist {
  id: string
  name: string
  coverArt?: string
  artistImageUrl?: string
}


export interface GenericIndex<T> {
  name: string
  artist: Array<T>
}

export type Index = GenericIndex<IndexArtist>
export type IndexID3 = GenericIndex<ArtistID3>

export interface GetArtistsResponseData {
  artists: {
    index: IndexID3[],
    ignoredArticles: string,
  }
}
export type GetArtistsResponse = OpensubsonicResponse & GetArtistsResponseData

export type GetArtistResponse = OpensubsonicResponse & {
  artist: ArtistWithAlbumsID3
}

export const getArtistSchema = subsonicAuthParamsSchema.extend({
  id: z.string()
})
export type GetArtistQueryParams = z.infer<typeof getArtistSchema>

export const getTopSongsSchema = subsonicAuthParamsSchema.extend({
    artist: z.string().min(1).optional(),
    id: z.string().min(1).optional(),
    count: z.coerce.number().int().positive().default(50),
  })
  .refine((data) => data.artist != null || data.id != null, {
    error: 'library.getTopSongs.validation.artistOrIdRequired',
    path: ['artist'],
  })

export type GetTopSongsQueryParams = z.infer<typeof getTopSongsSchema>



export const artistRoleSchema = z.enum([
  'artist',
  'albumartist',
  'composer',
  'engineer',
  'lyricist',
  'mixer',
  'performer',
  'producer',
  'remixer',
])

export const artistID3Schema = z.object({
  // required
  id: z.string(),
  name: z.string(),

  // base optional fields
  coverArt: z.string().optional(),
  artistImageUrl: z.string().optional(),
  albumCount: z.number().int().optional(),
  starred: z.string().optional(),
  userRating: z.number().int().min(1).max(5).optional(),
  averageRating: z.number().min(1).max(5).optional(),

  // OpenSubsonic additions
  musicBrainzId: z.string().optional(),
  sortName: z.string().optional(),
  disambiguation: z.string().optional(),
  roles: z.array(artistRoleSchema).optional(),
})

export type ArtistID3 = z.infer<typeof artistID3Schema>
export type ArtistRole = z.infer<typeof artistRoleSchema>

export type TopSongs = { song: Array<Child> }
export interface GetTopSongsReply extends OpensubsonicResponse {
  topSongs: TopSongs
}
