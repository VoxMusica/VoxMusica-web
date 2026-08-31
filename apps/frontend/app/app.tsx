import { useEffect } from 'react'
import { Navigate, Outlet, useLoaderData, useLocation, useRouteLoaderData } from 'react-router'

import i18n from '@/i18n'
import { Bootstrap } from '@/pages/bootstrap.page'
import { ErrorScreen } from '@/pages/error.page'
import { useSystemInfo } from '@/queries/system.queries'
import { useSystemStore } from '@/store/system.store'

import type { loader as rootLoader } from '@/root'

const App = () => {
  const { data, isLoading, error } = useSystemInfo()
  const { lang } = useLoaderData()
  const location = useLocation()

  const rootData = useRouteLoaderData<typeof rootLoader>('root')
  const initTheme = useSystemStore((s) => s.theme.initTheme)

  if (i18n.language !== lang) {
    i18n.changeLanguage(lang) // sync on server render too, via i18next's init or here
  }

  useEffect(() => {
    initTheme(rootData?.theme ?? 'system')
  }, [initTheme, rootData?.theme])

  if (isLoading) return <Bootstrap />
  if (error) return <ErrorScreen />

  const needsSetup = !(data?.initialized ?? false)
  const isOnSetupPage = location.pathname.startsWith('/setup')

  if (needsSetup && !isOnSetupPage) {
    return <Navigate to="/setup" replace />
  }
  else if(!needsSetup && isOnSetupPage){
    return <Navigate to="/" replace />
  }
  return <Outlet />
}
export default App
