import z from "zod"

export const loginBodySchema = z.object({
  username: z.string(),
  password: z.string(),
})

export type LoginBody =  z.infer<typeof loginBodySchema>
