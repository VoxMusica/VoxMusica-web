import { useEffect, useRef } from 'react'

import { apiClient } from '@/lib/open-subsonic.api-client'
import { getStreamUrl } from '@/lib/subsonic-client'
import { usePlayerStore } from '@/store/player.store'

export const usePlayerEngine = () => {
  const audioRef = useRef<HTMLAudioElement>(new Audio())
  const queue = usePlayerStore((state) => state.queue)
  const currentIndex = usePlayerStore((state) => state.currentIndex)
  const playing = usePlayerStore((state) => state.playing)
  const volume = usePlayerStore((state) => state.volume)
  const next = usePlayerStore((state) => state.next)

  const currentTrack = queue[currentIndex]
  const scrobbledRef = useRef<string | null>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (currentTrack == null) return
    audio.src = getStreamUrl(currentTrack.id)
    scrobbledRef.current = null
    if (playing) audio.play().catch(() => {})
  }, [currentTrack, currentTrack.id, playing])

  useEffect(() => {
    const audio = audioRef.current
    if (playing) audio.play().catch(() => {})
    else audio.pause()
  }, [playing])

  useEffect(() => {
    audioRef.current.volume = volume
  }, [volume])

  useEffect(() => {
    const audio = audioRef.current

    const handleEnded = () => next()

    const handleTimeUpdate = () => {
      if (currentTrack == null || audio.duration <= 0) return
      if (scrobbledRef.current === currentTrack.id) return

      const percentPlayed = (audio.currentTime / audio.duration) * 100
      if (percentPlayed >= 50) {
        scrobbledRef.current = currentTrack.id
        apiClient.scrobble({ id: currentTrack.id, submission: true }).catch(() => {})
      }
    }

    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('timeupdate', handleTimeUpdate)
    return () => {
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
    }
  }, [next, currentTrack])

  return audioRef
}
