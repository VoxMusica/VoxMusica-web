import { useShallow } from 'zustand/shallow'

import { usePlayerStore } from '@/store/player.store'

export const usePlayerActions = () =>
  usePlayerStore(
    useShallow((state) => ({
      setExpanded: state.setExpanded,
      setPlaying: state.setPlaying,
      playTracks: state.playTracks,
      playAlbum: state.playAlbum,
      togglePlay: state.togglePlay,
      next: state.next,
      previous: state.previous,
      toggleShuffle: state.toggleShuffle,
      setRepeat: state.setRepeat,
      setVolume: state.setVolume,
      enqueue: state.enqueue,
    }))
  )
