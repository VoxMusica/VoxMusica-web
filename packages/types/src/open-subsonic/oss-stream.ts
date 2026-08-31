import z from "zod"

import { subsonicAuthParamsSchema } from "./oss-common.ts"


export const streamSchema = subsonicAuthParamsSchema.extend({
  id: z.string().min(1),
  maxBitRate: z.coerce.number().int().positive().optional(),
  format: z.string().optional(),
  timeOffset: z.coerce.number().optional(),
  estimateContentLength: z.coerce.boolean().optional().default(false),
})

export type StreamQueryParams = z.infer<typeof streamSchema>
