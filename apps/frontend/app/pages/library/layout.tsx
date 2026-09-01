import { Disc3, Flame, Headphones, ListMusic, Mic, Sparkle, Sparkles, Tags } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Outlet, useNavigate } from 'react-router'

import type { SidebarItem } from '@/components/sidebar/item'

import { Sidebar } from '@/components/sidebar/sidebar'
import { cn } from '@/lib/utils'


const NewReleaseIcon = ({ className }: { className?: string }) => (
  <div className={cn('relative inline-flex', className)}>
    <Disc3 className='size-full' />
    <Sparkle className='absolute -top-0.5 -right-0.5 size-[45%] fill-current' />
  </div>
)

const PlayerLayout = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  // const navigate = useNavigate()
  const NAV_ITEMS: SidebarItem[] = [
    {
      icon: Mic, label: t('library.sidebar.artists'),
      onclick: () => navigate('/artists'),
      submenu: [
        { icon: Sparkles, label: t('library.sidebar.artists-recent')},
        { icon: Flame, label: t('library.sidebar.artists-popular')},
        { icon: Headphones, label: t('library.sidebar.artists-most-listened')},
        { icon: NewReleaseIcon, label: t('library.sidebar.artists-with-new-release')},
      ]
    },
    { icon: Disc3, label: t('library.sidebar.albums') },
    { icon: Disc3, label: t('library.sidebar.tracks') },
    { icon: Tags, label: t('library.sidebar.genres') },
    { icon: ListMusic, label: t('library.sidebar.playlists') }
  ]
  const title = t('library.sidebar.title')

  return <>
    <Sidebar items={NAV_ITEMS} title={title} />
    <main class="w-full h-full overflow-y-auto">
      <Outlet />
    </main>
  </>
}

export default PlayerLayout
