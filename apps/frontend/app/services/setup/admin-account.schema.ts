import { countMatchingCategories, createAdminAccountBodySchema, type CreateAdminBody } from '@voxmusica/types'
import { z } from 'zod'


export type PasswordStrength = 'empty' | 'weak' | 'fair' | 'good' | 'strong'

export const getPasswordStrength = (password: string): { score: number; label: PasswordStrength } => {
  if (password.length === 0) return { score: 0, label: 'empty' }

  const categories = countMatchingCategories(password)
  const isLongEnough = password.length >= 16

  if (categories === 4 && isLongEnough) return { score: 100, label: 'strong' }
  if (categories >= 3) return { score: 66, label: 'good' }
  if (categories === 2) return { score: 33, label: 'fair' }
  return { score: 15, label: 'weak' }
}

export const createAdminAccountSchema = createAdminAccountBodySchema
  .extend({
    confirmPassword: z.string().min(1, { error: 'validation.required' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: 'validation.passwords_dont_match',
    path: ['confirmPassword'],
  })

export interface AdminAccountFormValues extends CreateAdminBody{
  confirmPassword: string
}
