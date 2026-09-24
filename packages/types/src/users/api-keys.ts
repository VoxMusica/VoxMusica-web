import { z } from "zod"

export const createApiKeySchema = z.object({
  label: z.string().min(3, 'Username must be at least 3 characters'),
  expiresAt: z.date().optional()
})

export type CreateApiKey =  z.infer<typeof createApiKeySchema>
