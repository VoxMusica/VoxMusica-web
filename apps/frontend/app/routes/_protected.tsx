import { redirect, Outlet } from 'react-router'

import { getUserFromSession } from '@/_bff/auth.server'

import type { Route } from './+types/_protected'


 
export const loader = async({ request }: Route.LoaderArgs) => {
  const user = await getUserFromSession(request.headers.get('cookie'))
  if (!user) {
    const url = new URL(request.url)
    throw redirect(`/login?from=${encodeURIComponent(url.pathname)}`)
  }

  return { user }
}

const ProtectedLayout = () => {
  return <Outlet />
}
export default ProtectedLayout
