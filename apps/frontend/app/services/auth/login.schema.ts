import { z } from 'zod'


export const loginSchema = () =>
  z.object({
    username: z.string(),
    password: z.string()
  })

export type LoginFormValue = z.infer<ReturnType<typeof loginSchema>>
