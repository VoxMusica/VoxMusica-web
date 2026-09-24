import { createStore } from '.'

import type { User } from '@/types/user'

export interface AuthStore {
  user: User | null
  isInitialized: boolean
  setUser: (user: User | null) => void
  setInitialized: (value: boolean) => void
  login: (user: User) => void
  logout: () => void
}

export const useAuthStore = createStore<AuthStore>((set) => ({
  user: null,
  isInitialized: false,
  setUser: (user) => set({ user }),
  setInitialized: (value) => set({ isInitialized: value }),
  login: (user) => {
    set({ user, isInitialized: true })
  },
  logout: () => {
    localStorage.removeItem('token')
    set({ user: null })
  }
}))
