export type Role = 'admin' | 'user'

export const parseRoles = (raw: string): Role[] => {
  try {
    return JSON.parse(raw)
  } catch {
    return []
  }
}
