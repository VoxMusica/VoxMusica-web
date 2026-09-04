// apps/frontend/app/store/player.store.ts
import { createComputed } from 'zustand-computed'

import { createStore } from '.'

import type { Child } from '@voxmusica/types'

import { getAudio } from '@/lib/audio'
import { apiClient } from '@/lib/open-subsonic.api-client'
import { getStreamUrl } from '@/lib/subsonic-client'

export type RepeatMode = 'off' | 'all' | 'one'

interface PlayerStoreBase {
  expanded: boolean
  playing: boolean
  queue: Child[]
  currentIndex: number
  shuffle: boolean
  repeat: RepeatMode
  volume: number,
  currentTime: number
  duration: number,

  setExpanded: (value: boolean) => void
  setPlaying: (value: boolean) => void

  playTracks: (tracks: Child[], options?: { shuffle?: boolean; startIndex?: number }) => void
  playAlbum: (albumId: string, tracks: Child[]) => void
  togglePlay: () => void
  next: () => void
  previous: () => void
  toggleShuffle: () => void
  setRepeat: (mode: RepeatMode) => void
  setVolume: (volume: number) => void
  seek: (time: number) => void
  enqueue: (tracks: Child[]) => void,
}

interface PlayerStoreComputed {
  progress: number
  currentSong: Child| null
  hasNext: boolean
}

export type PlayerStore = PlayerStoreBase & PlayerStoreComputed

const secureRandomInt = (max: number): number => {
  if (typeof globalThis.crypto !== 'undefined' && 'getRandomValues' in globalThis.crypto) {
    const values = new Uint32Array(1)
    globalThis.crypto.getRandomValues(values)
    return values[0] % max
  }

  return Math.floor(Math.random() * max)
}

const shuffleArray = <T,>(items: T[]): T[] => {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = secureRandomInt(i + 1)
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

// module-level singleton — one real <audio> element for the app's lifetime
const isClient = typeof window !== 'undefined'
const audio = getAudio()

let scrobbledTrackId: string | null = null

const loadTrack = (track: Child) => {
  if(isClient){
    audio.src = getStreamUrl(track.id)
  }
  scrobbledTrackId = null
}

const computed = createComputed<PlayerStoreBase, PlayerStoreComputed>((state) => ({
  progress: state.duration > 0 ? (state.currentTime / state.duration) * 100 : 0,
  currentSong: state.queue?.[state.currentIndex ?? 0] ?? null,
  hasNext: state.queue && state.currentIndex < state.queue.length - 1,
}))

export const usePlayerStore = createStore(computed((set, get) => {
  if(isClient){
    audio.addEventListener('ended', () => {
      get().next()
    })

    audio.addEventListener('timeupdate', () => {
      set({ currentTime: audio.currentTime })
      const { queue, currentIndex } = get()
      const track = queue[currentIndex]
      if (track == null || audio.duration <= 0 || scrobbledTrackId === track.id) return

      if ((audio.currentTime / audio.duration) * 100 >= 50) {
        scrobbledTrackId = track.id
        apiClient.scrobble({ id: track.id, submission: true }).catch(() => {})
      }
    })

    audio.addEventListener('loadedmetadata', () => {
      set({ duration: audio.duration })
    })
  }

  return {
    expanded: false,
    playing: false,
    queue: [],
    currentIndex: -1,
    shuffle: false,
    repeat: 'off',
    volume: 1,
    currentTime: -1,
    duration: -1,

    setExpanded: (value) => set({ expanded: value }),
    setPlaying: (value: boolean) => set({ playing: value }),

    playTracks: (tracks, options) => {
      const ordered = options?.shuffle === true ? shuffleArray(tracks) : tracks
      const startIndex = options?.startIndex ?? 0
      loadTrack(ordered[startIndex])
      if(isClient) { audio.play().catch(() => {}) }
      set({
        queue: ordered,
        currentIndex: startIndex,
        playing: true,
        shuffle: options?.shuffle ?? false,
        currentTime: 0,
        duration: 0,
      })
    },

    playAlbum: (_albumId, tracks) => {
      get().playTracks(tracks)
    },

    togglePlay: () => {
      const playing = !get().playing
      if(isClient){
        if (playing) audio.play().catch(() => {})
        else audio.pause()
      }
      set({ playing })
    },

    next: () => {
      const { queue, currentIndex, repeat } = get()
      if (queue.length === 0) return

      const isLast = currentIndex >= queue.length - 1
      if (isLast && repeat === 'off') {
        if(isClient) audio.pause()
        set({ playing: false })
        return
      }

      const nextIndex = isLast ? 0 : currentIndex + 1
      loadTrack(queue[nextIndex])
      if(isClient) audio.play().catch(() => {})
      set({
          currentIndex: nextIndex,
          playing: true,
      })
    },

    previous: () => {
      const { queue, currentIndex } = get()
      if (queue.length === 0) return
      const prevIndex = currentIndex <= 0 ? queue.length - 1 : currentIndex - 1
      loadTrack(queue[prevIndex])
      if(isClient) audio.play().catch(() => {})
      set({
        currentIndex: prevIndex,
        playing: true,
      })
    },

    toggleShuffle: () =>
      set((state) => {
        if (state.shuffle) return { shuffle: false }
        const current = state.queue[state.currentIndex]
        const rest = shuffleArray(state.queue.filter((_, i) => i !== state.currentIndex))
        const currentIndex = current != null ? 0 : state.currentIndex
        const queue = current != null ? [current, ...rest] : rest
        return {
          shuffle: true,
          queue,
          currentIndex,
          currentSong: queue.at(currentIndex),
        }
      }),

    setRepeat: (mode) => set({ repeat: mode }),

    setVolume: (volume) => {
      const clamped = Math.min(1, Math.max(0, volume))
      if(isClient) audio.volume = clamped
      set({ volume: clamped })
    },

     seek: (time: number) => {
      if(audio){
        audio.currentTime = time
        set({ currentTime: time })
      }
    },

    enqueue: (tracks) => set((state) => ({ queue: [...state.queue, ...tracks] })),
  }
}))
