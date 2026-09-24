import { Sun, Moon, Monitor } from 'lucide-react'

import { useSystemStore } from '@/store/system.store'

const OPTIONS = [
  { value: 'light', icon: Sun, label: 'Light theme' },
  { value: 'dark', icon: Moon, label: 'Dark theme' },
  { value: 'system', icon: Monitor, label: 'Match system' }
] as const

export const ThemeToggle = () => {
  const theme = useSystemStore(s => s.theme.selected)
  const setTheme = useSystemStore(s => s.theme.setTheme)

  return <div className="w-fit flex items-center gap-0.5 rounded-full bg-secondary border border-border p-0.5 ">
    {OPTIONS.map(({ value, icon: Icon, label }) => (
      <button
        key={value}
        onClick={() => setTheme(value)}
        aria-label={label}
        aria-pressed={theme === value}
        className={
          `w-7 h-7 rounded-full flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring
          ${theme === value ? 'bg-background text-foreground' : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <Icon size={13} />
      </button>
    ))}
  </div>
}
