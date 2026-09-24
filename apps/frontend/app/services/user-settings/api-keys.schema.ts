import { z } from 'zod'

export const createNewApiKeySchema = () =>
  z.object({
    label: z.string().min(3, 'Key label must be at least 3 characters'),
    expiresAt: z.date().optional()
  })

export type CreateNewApiKeyValue = z.infer<ReturnType<typeof createNewApiKeySchema>>
