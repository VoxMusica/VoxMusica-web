// packages/types/src/child.ts
import { z } from 'zod'

import { artistID3Schema } from './oss-artist.ts' // assumes you already have this from getArtist/ArtistID3
import { itemGenreSchema } from './oss-common.ts'

export const contributorSchema = z.object({
  role: z.string(),
  subRole: z.string().optional(),
  artist: artistID3Schema,
})

export const replayGainSchema = z.object({
  trackGain: z.number().optional(),
  albumGain: z.number().optional(),
  trackPeak: z.number().optional(),
  albumPeak: z.number().optional(),
  baseGain: z.number().optional(),
})

export const workSchema = z.object({
  name: z.string(),
  musicBrainzId: z.string().optional(),
})

export const movementSchema = z.object({
  name: z.string(),
  number: z.number().int().optional(),
  count: z.number().int().optional(),
})

export const explicitStatusSchema = z.enum(['explicit', 'clean', ''])

export const mediaTypeSchema = z.enum(['song', 'album', 'artist'])

export const mediaGenericTypeSchema = z.enum(['music', 'podcast', 'audiobook', 'video'])

export const childSchema = z.object({
  // required
  id: z.string(),
  isDir: z.boolean(),
  title: z.string(),

  // base optional fields
  parent: z.string().optional(),
  album: z.string().optional(),
  artist: z.string().optional(),
  track: z.number().int().optional(),
  year: z.number().int().optional(),
  genre: z.string().optional(),
  coverArt: z.string().optional(),
  size: z.number().optional(),
  contentType: z.string().optional(),
  suffix: z.string().optional(),
  transcodedContentType: z.string().optional(),
  transcodedSuffix: z.string().optional(),
  duration: z.number().int().optional(),
  bitRate: z.number().int().optional(),
  bitDepth: z.number().int().optional(),
  samplingRate: z.number().int().optional(),
  channelCount: z.number().int().optional(),
  path: z.string().optional(),
  isVideo: z.boolean().optional(),
  userRating: z.number().int().min(1).max(5).optional(),
  averageRating: z.number().min(1).max(5).optional(),
  playCount: z.number().optional(),
  discNumber: z.number().int().optional(),
  created: z.string().optional(),
  starred: z.string().optional(),
  albumId: z.string().optional(),
  artistId: z.string().optional(),
  type: mediaGenericTypeSchema.optional(),
  mediaType: mediaTypeSchema.optional(),
  bookmarkPosition: z.number().optional(),
  originalWidth: z.number().int().optional(),
  originalHeight: z.number().int().optional(),

  // OpenSubsonic additions
  played: z.string().optional(),
  bpm: z.number().int().optional(),
  comment: z.string().optional(),
  sortName: z.string().optional(),
  musicBrainzId: z.string().optional(),
  isrc: z.array(z.string()).optional(),
  genres: z.array(itemGenreSchema).optional(),
  artists: z.array(artistID3Schema).optional(),
  displayArtist: z.string().optional(),
  albumArtists: z.array(artistID3Schema).optional(),
  displayAlbumArtist: z.string().optional(),
  contributors: z.array(contributorSchema).optional(),
  displayComposer: z.string().optional(),
  moods: z.array(z.string()).optional(),
  replayGain: replayGainSchema.optional(),
  explicitStatus: explicitStatusSchema.optional(),
  works: z.array(workSchema).optional(),
  movements: z.array(movementSchema).optional(),
  groupings: z.array(z.string()).optional(),
})

export type Child = z.infer<typeof childSchema>
export type Contributor = z.infer<typeof contributorSchema>
export type ReplayGain = z.infer<typeof replayGainSchema>
export type Work = z.infer<typeof workSchema>
export type Movement = z.infer<typeof movementSchema>
