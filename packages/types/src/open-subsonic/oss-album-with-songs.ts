import { z } from 'zod'

import { albumID3Schema } from './oss-album.ts'
import { childSchema } from './oss-child.ts'

import type { OpensubsonicResponse } from './oss-common.ts'


export const albumID3WithSongsSchema = albumID3Schema.extend({
  song: z.array(childSchema),
})

export type AlbumID3WithSongs = z.infer<typeof albumID3WithSongsSchema>

export interface GetAlbumReply extends OpensubsonicResponse {
  album: AlbumID3WithSongs
}
