import z from "zod"

export const countMatchingCategories = (value: string) => {
  const categories = [/[a-z]/, /[A-Z]/, /[0-9]/, /[^a-zA-Z0-9]/]
  return categories.filter((regex) => regex.test(value)).length
}


export const createAdminAccountBodySchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z
    .string()
    .min(12, 'Password must be at least 12 characters')
    .refine((value) => countMatchingCategories(value) >= 3, {
      message: 'setup.adminAccount.errors.passwordComplexity'
    })
})

export type CreateAdminBody =  z.infer<typeof createAdminAccountBodySchema>
