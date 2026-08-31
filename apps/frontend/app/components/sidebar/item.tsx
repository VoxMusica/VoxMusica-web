import { AnimatePresence, motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'

import type { LucideProps } from 'lucide-react'

type LucideIcon = React.FC<LucideProps>;

export type SidebarItem = {
  label: string
  icon: LucideIcon
  level?: number
  submenu?: SidebarItem[]

  onclick?: () => Promise<void> | void
}

type SubMenuParams = {
  items: SidebarItem[]
  level: number
}

const SubMenu = ({ items, level }: SubMenuParams) => {
  return (
    <div className="flex flex-col gap-0.5">
      { items.map(item => <SideMenuItem {...item} level={level + 1} />) }
    </div>
  )
}

export const SideMenuItem = ({ label, icon: ItemIcon, level, submenu, onclick }: SidebarItem) => {
  const [submenuOpen, setSubmenuOpen] = useState(false)

  const toggleSubMenu = () => {
    setSubmenuOpen(!submenuOpen)
  }
  const handleClick = async () => {
    onclick?.()
  }
  return <>
    <div
        className={'flex items-center gap-3 rounded-lg text-sm transition-colors focus:outline-none focus-visible:ring-2 text-muted-foreground bg-transparent hover:bg-muted' }
      >
      <Button
        className={'flex items-center  cursor-pointer  justify-start px-3 py-2 ml-4 flex-1 text-sm transition-colors focus:outline-none focus-visible:ring-2 text-muted-foreground bg-transparent hover:bg-muted' }
        onClick={handleClick}
      >
        <ItemIcon size={17} strokeWidth={1.8} />
        {label}
      </Button>
      { submenu && <motion.span
          className="mr-2  cursor-pointer"
          animate={{ rotate: submenuOpen ? 90 : 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          onClick={toggleSubMenu}
        >
          <ChevronRight size={16} />
        </motion.span>
      }
    </div>
    <AnimatePresence initial={false}>
      { submenu && submenuOpen &&  (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className="overflow-hidden pl-4"
        >
          <SubMenu items={submenu} level={(level ?? 0) + 1} />
        </motion.div>
      )}
    </AnimatePresence>
  </>
}

export default SideMenuItem