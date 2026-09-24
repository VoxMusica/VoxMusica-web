import { jwtDecode } from 'jwt-decode'

import type { JwtPayload } from '@/queries/auth/auth.types'
import type { User } from '@/types/user'

export const decodeToken = (token: string): User | null => {
  try {
    const payload = jwtDecode<JwtPayload>(token)

    if (payload.exp * 1000 < Date.now()) {
      return null
    }

    return {
      id: payload.sub,
      username: payload.username,
      roles: payload.roles
    }
  } catch {
    return null
  }
}
