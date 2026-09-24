import type { Role } from '@/types/user'

interface SessionUser {
  sub: string,
  username: string,
  roles: Role[],
}

export const getUserFromSession = async (cookieHeader: string | null): Promise<SessionUser | null> => {
  if (!cookieHeader) return null

  try {
    const res = await fetch(`${process.env.API_URL}/api/auth/me`, {
      headers: {
        cookie: cookieHeader
      }
    })

    if (!res.ok) return null

    const { user } = await res.json()
    return user
  } catch (err){
    console.error(err)
    return null
  }
}
