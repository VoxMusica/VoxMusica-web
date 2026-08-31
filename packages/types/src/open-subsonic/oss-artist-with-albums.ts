import z from "zod"

import { albumID3Schema } from "./oss-album.ts"
import { artistID3Schema } from "./oss-artist.ts"

export const artistWithAlbumsID3Schema = artistID3Schema.extend({
  album: z.array(albumID3Schema),
})

export type ArtistWithAlbumsID3 = z.infer<typeof artistWithAlbumsID3Schema>

