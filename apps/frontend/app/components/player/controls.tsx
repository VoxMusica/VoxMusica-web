import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react'
import React, { type MouseEventHandler } from 'react'

const MORPH = 'all 480ms cubic-bezier(0.32, 0.72, 0, 1)'

interface PlayerControlsParams {
  playing: boolean
  expanded: boolean
  onTogglePlay: () => void,
  onPrevious?: () => void,
  onNext?: () => void,
  onVolumeChange?: (volume: number) => void
}

export const PlayerControls = ({
  playing, expanded, onTogglePlay,
  onPrevious, onNext, onVolumeChange
}: PlayerControlsParams) => {
  const onPlay: MouseEventHandler = (event) => {
    event.stopPropagation()
    onTogglePlay()
  }
  return (
    <div style={{
        position: 'absolute',
        transition: MORPH,
        display: 'flex',
        alignItems: 'center',
        zIndex: 10,
        ...(expanded
          ? { top: '86%', left: '50%', transform: 'translate(-50%, -50%)', gap: 24 }
          : { top: 35, right: 14, gap: 6, transform: 'translateY(-50%)' })
      }}>
      <button type="button" className="text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full cursor-pointer" style={{ transition: MORPH }} aria-label="Previous"
        onClick={(e) => { e.stopPropagation(); onPrevious?.() }}>
        <SkipBack size={expanded ? 20 : 14} fill="currentColor" />
      </button>

      <button
        type="button"
        onClick={onPlay}
        className="rounded-full flex items-center justify-center bg-primary text-primary-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all cursor-pointer"
        style={{ transitionDuration: '480ms', width: expanded ? 56 : 36, height: expanded ? 56 : 36 }}
        aria-label={playing ? 'Pause' : 'Play'}
      >
        {playing ? <Pause size={expanded ? 22 : 16} fill="currentColor" /> : <Play size={expanded ? 22 : 16} fill="currentColor" />}
      </button>

      <button type="button" className="text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full cursor-pointer" style={{ transition: MORPH }} aria-label="Next"
        onClick={(e) => { e.stopPropagation(); onNext?.() }}>
        <SkipForward size={expanded ? 20 : 14} fill="currentColor" />
      </button>

      <div className="flex items-center text-muted-foreground overflow-hidden" style={{ transition: MORPH, width: expanded ? 24 : 0, marginLeft: expanded ? 8 : 0, opacity: expanded ? 1 : 0 }}>
        <Volume2 size={16} />
      </div>
    </div>
  )
}

export default PlayerControls
