import { Music2 } from 'lucide-react'
import { Link } from 'react-router'

import SideMenuItem, { type SidebarItem } from '@/components/sidebar/item'
import { ThemeToggle } from '@/components/theme-toggle'

export interface SidebarParams {
  title: string
  items: SidebarItem[]
}

export const Sidebar = ({ items, title}: SidebarParams) => {
  return <aside
    className="fixed top-0 left-0 h-full w-60 flex flex-col px-5 py-6 z-20 bg-card border-solid border-1px "
  >
    <Link to="/" className="flex items-center gap-2 mb-10 px-1">
      <Music2 size={20} className="text-primary" />
      <span
        className="text-lg tracking-tight"
        style={{ fontFamily: '\'Space Grotesk\', sans-serif', fontWeight: 600 }}
      >
        Vox Musica
      </span>
    </Link>

    <div
      className="text-xs uppercase mb-3 px-3 text-muted-foreground"
      style={{ letterSpacing: '0.12em', fontFamily: '\'JetBrains Mono\', monospace' }}
    >
      { title }
    </div>

    <nav className="flex flex-col gap-1">
      {items.map(item => <SideMenuItem {...item} key={item.label} />)}
    </nav>

    <div className="mt-auto px-3">
      <div className="flex items-center justify-center">
        <ThemeToggle />
        </div>
      <div className="h-px mb-4 bg-border mt-4" />
      <div className="text-xs text-muted-foreground " style={{ fontFamily: '\'JetBrains Mono\', monospace' }}>
        2,481 albums · 341 GB
      </div>
    </div>
  </aside>
}

export default Sidebar
