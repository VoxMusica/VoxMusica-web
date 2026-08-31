import { Navigate, Outlet, useLocation } from 'react-router'

import { useAuthStore } from '@/store/auth.store'
import { useSystemStore } from '@/store/system.store'

export const ProtectedRoute = () => {
  const { user } = useAuthStore()
  const { initialized } = useSystemStore()
  const location = useLocation()

  if (!initialized) {
    return <div>Loading...</div>
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <Outlet />
}
