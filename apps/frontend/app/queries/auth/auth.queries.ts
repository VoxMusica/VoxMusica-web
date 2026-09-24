import { useMutation } from '@tanstack/react-query'

import { postMutationFn } from '@/queries/utils'

import type { LoginResponse } from '@/queries/auth/auth.types'
import type { LoginFormValue } from '@/services/auth/login.schema'

export const useLogin = () => {
  return useMutation<LoginResponse, Error, LoginFormValue>({
    mutationFn: postMutationFn<LoginFormValue>(
      '/api/auth/login',
      (values: LoginFormValue | null) => {
        if (!values) {
          throw new Error('Login values are required')
        }
        return JSON.stringify({ username: values.username, password: values.password })
      }
    )
  })
}
