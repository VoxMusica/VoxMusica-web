import z from "zod"

import { subsonicAuthParamsSchema } from "./oss-common.ts"

export const setRatingSchema = subsonicAuthParamsSchema.extend({
  id: z.string().min(1),
  rating: z.coerce.number().int().min(0).max(5),
})
export type SetRatingQueryParams = z.infer<typeof setRatingSchema>
