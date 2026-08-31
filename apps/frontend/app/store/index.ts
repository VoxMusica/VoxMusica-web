import { create, type StateCreator } from 'zustand'
import { devtools } from 'zustand/middleware'

const isDev = import.meta.env?.MODE === 'development'
export const createStore = <T>(
  initializer: StateCreator<T>,
) => {
  if (isDev) {
    return create<T>()(devtools(initializer))
  }

  return create<T>()(initializer)
}
