export type Role = 'admin' | 'user'

export interface User {
  id: string
  username: string
  roles: Role[]
  apiKey : string
}
