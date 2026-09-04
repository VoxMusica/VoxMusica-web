import z from "zod"

import { subsonicAuthParamsSchema } from "./oss-common.ts"

export const setRatingSchema = subsonicAuthParamsSchema.extend({
  id: z.string().min(1),
  rating: z.coerce.number().int().min(0).max(5),
})
export type SetRatingQueryParams = z.infer<typeof setRatingSchema>
export type SetRatingParams = Pick<SetRatingQueryParams, "id" | "rating">

export const starSchema = subsonicAuthParamsSchema.extend({
  id: z.string().min(1).optional(),
  albumId: z.string().min(1).optional(),
  artistId: z.string().min(1).optional(),
}).refine(data => {
  return (data.id != null) || (data.albumId != null) || (data.artistId != null)
}, {
  message: "star.error",
})
export type StarQueryParams = z.infer<typeof starSchema>
export type StarParams = Pick<StarQueryParams, "id" | "albumId" | "artistId">
