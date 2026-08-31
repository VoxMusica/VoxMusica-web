import { useMutation } from '@tanstack/react-query'

import type { AdminAccountFormValues } from '@/services/setup/admin-account.schema'

const createAdminAccount = async (values: AdminAccountFormValues) => {
  const res = await fetch('/api/user', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: values.username, password: values.password })
  })

  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.message ?? 'Failed to create admin account')
  }

  return res.json()
}

export const useCreateAdminAccount = () => {
  return useMutation({ mutationFn: createAdminAccount })
}
