import type { Role, User } from '@/types/user'

export interface JwtPayload {
  sub: string
  username: string,
  roles: Role[]
  exp: number
}

export interface LoginResponse {
  user: User
  apiKey: string
}
