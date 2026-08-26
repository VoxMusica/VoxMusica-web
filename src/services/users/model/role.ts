export type Role = 'admin' | 'user'

export function parseRoles(raw: string): Role[] {
  try {
    return JSON.parse(raw)
  } catch {
    return []
  }
}
