import z from "zod"

import { artistID3Schema } from "./oss-artist.ts"
import { itemDateSchema, itemGenreSchema } from "./oss-common.ts"

export const discTitleSchema = z.object({
  disc: z.number().int(),
  title: z.string(),
})

export const recordLabelSchema = z.object({
  name: z.string(),
})

export const releaseTypeSchema = z.string()

export const albumID3Schema = z.object({
  // required
  id: z.string(),
  name: z.string(),
  songCount: z.number().int(),
  duration: z.number().int(),
  created: z.string(),

  // base optional fields
  artist: z.string().optional(),
  artistId: z.string().optional(),
  coverArt: z.string().optional(),
  playCount: z.number().optional(),
  year: z.number().int().optional(),
  genre: z.string().optional(),
  starred: z.string().optional(),
  userRating: z.number().int().min(1).max(5).optional(),
  averageRating: z.number().min(1).max(5).optional(),

  // OpenSubsonic additions
  musicBrainzId: z.string().optional(),
  genres: z.array(itemGenreSchema).optional(),
  artists: z.array(artistID3Schema).optional(),
  displayArtist: z.string().optional(),
  releaseTypes: z.array(releaseTypeSchema).optional(),
  moods: z.array(z.string()).optional(),
  sortName: z.string().optional(),
  originalReleaseDate: itemDateSchema.optional(),
  releaseDate: itemDateSchema.optional(),
  isCompilation: z.boolean().optional(),
  recordLabels: z.array(recordLabelSchema).optional(),
  discTitles: z.array(discTitleSchema).optional(),
  explicitStatus: z.enum(['explicit', 'clean', '']).optional(),
})

export type AlbumID3 = z.infer<typeof albumID3Schema>
export type DiscTitle = z.infer<typeof discTitleSchema>
export type RecordLabel = z.infer<typeof recordLabelSchema>
