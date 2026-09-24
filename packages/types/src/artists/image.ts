import { z } from "zod"

export const getImageSchema = z.object({
  id: z.uuid(),
})
export type GetImageParams = z.infer<typeof getImageSchema>
