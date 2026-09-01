import z from "zod"

import { subsonicAuthParamsSchema } from "./oss-common.ts"


export const coverArtSchema = subsonicAuthParamsSchema.extend({
  id: z.string().min(1),
  size: z.coerce.number().int().positive().optional(),
})

export type CoverArtQueryParams = z.infer<typeof coverArtSchema>
