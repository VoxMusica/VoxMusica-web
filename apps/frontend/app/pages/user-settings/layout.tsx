import { User, KeyRound  } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Outlet, useNavigate } from 'react-router'

import { Sidebar } from '@/components/sidebar/sidebar'


const URL_ROOT = '/user-settings'

export const UserSettingsLayout = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const NAV_ITEMS = [
    { icon: User, label: t('user-settings.sidebar.user'), onclick: async () => navigate(URL_ROOT)},
    { icon: KeyRound, label: t('user-settings.sidebar.security'), onclick: async () => navigate(URL_ROOT + '/security')},
  ]
  const title = t('user-settings.sidebar.title')
  return <>
    <Sidebar items={NAV_ITEMS} title={title} />
    <main className="w-6xl">
      <Outlet />
    </main>
  </>
}

export default UserSettingsLayout
