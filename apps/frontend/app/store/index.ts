import { create, type StateCreator, type StoreMutatorIdentifier } from 'zustand'
import { devtools } from 'zustand/middleware'

const isDev = import.meta.env?.MODE === 'development'

export const createStore = <T,Mos extends [StoreMutatorIdentifier, unknown][] = [], U = T>(
  initializer: StateCreator<T, [], Mos, U>,
) => {
  if (isDev) {
    return create<U>()(devtools(initializer as unknown as StateCreator<U, [], Mos>))
  }

  return create<U>()(initializer as unknown as StateCreator<U, [], Mos>)
}
