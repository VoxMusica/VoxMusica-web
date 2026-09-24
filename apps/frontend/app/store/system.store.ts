import { createStore } from '.'

import type { Theme } from '@/types/theme'

const THEME_COOKIE = 'theme'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365 // 1 year, seconds
const DARK_MEDIA_QUERY = '(prefers-color-scheme: dark)'
 
const setThemeCookie = (theme: Theme) => {
  document.cookie = `${THEME_COOKIE}=${theme}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`
}
 
const resolveSystemTheme = (): 'light' | 'dark' =>
  window.matchMedia(DARK_MEDIA_QUERY).matches ? 'dark' : 'light'
 
const applyToDom = (resolved: 'light' | 'dark') => {
  document.documentElement.classList.toggle('dark', resolved === 'dark')
}

export interface SystemStore {
  initialized?: boolean,
  setTnitialized: (val: boolean) => void
  theme: {
    selected: Theme,
    resolved: 'light' | 'dark',
    initialized: boolean,
    initTheme: (initial: Theme) => void
    setTheme: (next: Theme) => void
  }
}

export const useSystemStore = createStore<SystemStore>((set, get) => ({
  initialized: undefined,
  theme: {
    selected: 'system',
    resolved: 'dark',
    initialized: false,
    initTheme: (initial) => {
      if (get().theme.initialized) return // guards against StrictMode double-invoke / remounts
  
      const applyForTheme = (theme: Theme) => {
        const resolved = theme === 'system' ? resolveSystemTheme() : theme
        applyToDom(resolved)
        set({ theme: {...get().theme, resolved: resolved } })
      }
  
      applyForTheme(initial)
      set({ theme: {...get().theme, selected: initial, initialized: true } })
  
      // Live sync while 'system' is selected — this is what makes an OS-level
      // day/night switch update the UI without a reload.
      const mq = window.matchMedia(DARK_MEDIA_QUERY)
      const onChange = () => {
        if (get().theme.selected === 'system') applyForTheme('system')
      }
      mq.addEventListener('change', onChange)
      // Intentionally no cleanup returned here — this store instance lives for
      // the app's lifetime, so the listener should too.
    },
  
    setTheme: (next) => {
      setThemeCookie(next)
      const resolved = next === 'system' ? resolveSystemTheme() : next
      applyToDom(resolved)
      set({ theme: {...get().theme, selected: next, resolved: resolved } })
    }

  },
  setTnitialized: initialized => set({ initialized })
}))

