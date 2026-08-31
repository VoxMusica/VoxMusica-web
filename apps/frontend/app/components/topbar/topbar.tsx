import { AnimatePresence, motion  } from 'framer-motion'
import { Cog, LogOut, ShieldCheck, User } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import SearchBar from './search'
import { Button } from '@/components/ui/button'

export const TopBar = () => {
  const menuRef = useRef(null)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const isAdmin = true
  const navigate = useNavigate()
  const { t } = useTranslation()

  const goToUserSettings = async () => {
    navigate('/user-settings', { replace: true })
    setUserMenuOpen(false)
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    navigate('/', { replace: true })
  }


  useEffect(() => {
    if (!userMenuOpen) return

    const handleClick = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [userMenuOpen])

  const handlePillClick = () => setUserMenuOpen(!userMenuOpen)

  const items = [
    ...(isAdmin ? [{
      id: 'admin',
      type: 'link',
      icon: ShieldCheck,
      iconColor: 'text-sage',
      label: t('topmenu.admin')
    }] : []),
    {
      id: 'settings',
      type: 'link',
      icon: Cog,
      label: t('topmenu.params'),
      onclick: goToUserSettings
    },
    { 
      id: 'separator',
      type: 'bar'
    },
    {
      id: 'logout',
      type: 'link',
      icon: LogOut,
      label: t('topmenu.logout'),
      color: 'text-destructive',
      onclick: handleLogout
    },
  ]

  return <header className="fixed top-0 left-60 right-0 h-16 flex items-center justify-between px-8 z-20 pointer-events-none">
    <div /> {/* left spacer so search stays visually centered */}

    <div className="pointer-events-auto w-full max-w-md">
      <SearchBar />
    </div>

    <div className="pointer-events-auto relative" ref={menuRef}>
      <Button
        onClick={handlePillClick}
        className="w-9 h-9 rounded-full flex items-center justify-center focus:outline-none focus-visible:ring-2 bg-secondary border-1px border-solid cursor-pointer"
        aria-label="Account menu"
      >
        <User size={16} className="text-foreground" />
      </Button>
      <AnimatePresence>
        {userMenuOpen && (
          <motion.div
            ref={userMenuRef}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 mt-2 w-52 rounded-xl overflow-hidden shadow-2xl bg-card border-1px border-solid origin-top-right"
          >
            <div className="py-1">
            {items.map((item) => {
              if (item.type === 'bar') {
                return <div key={item.id} className="h-px my-1 bg-border" />
              }

              const Icon = item.icon
              return (
                <Button
                  key={item.id}
                  {...(item.onclick && { onClick: item.onclick })}
                  className={[
                    'w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left text-muted-foreground bg-transparent hover:bg-muted  cursor-pointer ',
                    item.color ?? '',
                  ].filter(Boolean).join(' ')}
                >
                  <Icon size={15} className={item.iconColor ?? ''} />
                  {item.label}
                </Button>
              )
            })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  </header>
}

export default TopBar