import { Pause, Play, SkipBack, SkipForward } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { type MouseEventHandler } from 'react'

import VolumePicker from './volume-picker'

const SPRING = { type: 'spring', stiffness: 300, damping: 32 } as const

interface PlayerControlsParams {
  playing: boolean
  expanded: boolean
  volume: number
  onTogglePlay: () => void
  onPrevious?: () => void
  onNext?: () => void
  onVolumeChange?: (volume: number) => void
}

export const PlayerControls = ({
  playing, expanded, volume, onTogglePlay,
  onPrevious, onNext, onVolumeChange
}: PlayerControlsParams) => {
  const onPlay: MouseEventHandler = (event) => {
    event.stopPropagation()
    onTogglePlay()
  }

  return (
    <motion.div
      layout
      transition={SPRING}
      className={`flex items-center justify-between w-fit gap-${expanded ? '5' : '2'}`}
    >
      
      <div className="w-[200px]" />
      
      <div className={`flex items-center justify-between w-fit gap-${expanded ? '5' : '2'}`}>
        <motion.button
          layout
          layoutId="btn-previous"
          type="button"
          transition={SPRING}
          className="text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full cursor-pointer"
          aria-label="Previous"
          onClick={(e) => { e.stopPropagation(); onPrevious?.() }}
        >
          <SkipBack size={expanded ? 20 : 14} fill="currentColor" />
        </motion.button>

        <motion.button
          layout
          layoutId="btn-play"
          type="button"
          onClick={onPlay}
          transition={SPRING}
          className="rounded-full flex items-center justify-center bg-primary text-primary-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
          style={{ width: expanded ? 56 : 36, height: expanded ? 56 : 36 }}
          aria-label={playing ? 'Pause' : 'Play'}
        >
          {playing ? <Pause size={expanded ? 22 : 16} fill="currentColor" /> : <Play size={expanded ? 22 : 16} fill="currentColor" />}
        </motion.button>

        <motion.button
          layout
          layoutId="btn-next"
          type="button"
          transition={SPRING}
          className="text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full cursor-pointer"
          aria-label="Next"
          onClick={(e) => { e.stopPropagation(); onNext?.() }}
        >
          <SkipForward size={expanded ? 20 : 14} fill="currentColor" />
        </motion.button>
      </div>
      <AnimatePresence>
        {expanded && <motion.div
          layout
          layoutId="volume-picker"
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: 200 }}
          transition={SPRING}
          className="flex justify-start text-muted-foreground overflow-visible"
        >
          <VolumePicker volume={volume} onVolumeChange={(val) => onVolumeChange?.(val)} />
        </motion.div>
        }
      </AnimatePresence>
    </motion.div>
  )
}

export default PlayerControls
