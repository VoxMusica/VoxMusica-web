import { X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'

import PlayerControls from './controls'
import Disc from './disc'
import EqualizerBars from './equalizer-bars'
import PlayerProgress from './progress'
import { TrackInfo } from './track-info'

import { getAnalyser } from '@/lib/audio'
import { getCoverArtUrl } from '@/lib/subsonic-client'
import { usePlayerStore } from '@/store/player.store'

const NOW_PLAYING = {
  hue: '#C99A5B'
}

const SPRING = { type: 'spring', stiffness: 300, damping: 32 } as const

export const Player = () => {
  const {
    expanded, playing,
    togglePlay, setExpanded, currentTime,
    duration, currentSong, next, previous,
    volume, setVolume, seek
  } = usePlayerStore()

  if (!currentSong) return null

  const analyser = getAnalyser()

  return (
    <motion.div
      layout
      transition={SPRING}
      className={`
        fixed z-30 shadow-2xl backdrop-blur-md border
        flex
        ${
        expanded
          ? 'inset-0 rounded-none bg-background border-transparent flex flex-col items-center justify-center gap-6 p-8 pb-0 h-full'
          : 'bottom-5 right-5 w-[460px] h-20 rounded-full bg-popover/90 border-border flex flex-col justify-center gap-1 px-5'
      }`}
      role={expanded ? undefined : 'button'}
      tabIndex={expanded ? undefined : 0}
      aria-expanded={expanded}
      aria-label={expanded ? 'Player expanded' : 'Open player'}
      onClick={() => !expanded && setExpanded(true)}
      onKeyDown={(event) => {
        if (expanded) return
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          setExpanded(true)
        }
      }}
    >
      {expanded && (
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="absolute top-6 right-6 w-9 h-9 rounded-full flex items-center justify-center bg-secondary text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Minimize player"
        >
          <X size={16} />
        </button>
      )}
      <div className={expanded ? 'flex flex-col items-center justify-center flex-1 gap-6 w-full' : 'flex flex-col items-center gap-1'}>
        <div className={expanded ? 'flex flex-col items-center gap-6  w-full' : 'flex flex-row  justify-center items-center gap-3 w-full'}>
          <motion.div layout layoutId="disc" className={expanded ? 'w-80 h-80' : 'w-10 h-10 shrink-0'}>
            {currentSong?.coverArt ? (
              <img
                src={getCoverArtUrl(currentSong.coverArt)}
                alt={currentSong.album}
                className={`w-full h-full object-cover pointer-events-none rounded-full ${playing ? 'disc-spin' : 'disc-paused'}`}
              />
            ) : (
              <Disc playing={playing} expanded={expanded} hue={NOW_PLAYING.hue} />
            )}
          </motion.div>

          <motion.div layout layoutId="track-info" className={expanded ? 'text-center' : 'min-w-0 flex-1'}>
            <TrackInfo
              title={currentSong.title}
              artist={currentSong.artist}
              album={currentSong.album}
              expanded={expanded}
            />
          </motion.div>
          
          <motion.div layout layoutId="controls" className="shrink-0 w-fit">
            <PlayerControls
              playing={playing}
              expanded={expanded}
              volume={volume}
              onTogglePlay={() => togglePlay()}
              onPrevious={() => previous()}
              onNext={() => next()}
              onVolumeChange={(val) => setVolume(val)}
            />
          </motion.div>
          
        </div>
        <motion.div layout layoutId="progress" className={expanded ? 'w-full max-w-md' : 'w-full mt-2'}>
          <PlayerProgress
            elapsed={currentTime}
            duration={duration}
            showLabels={expanded}
            onSeek={seek}
          />
        </motion.div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            key="equalizer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full h-20 mt-auto"
          >
            <EqualizerBars playing={playing} analyser={analyser} barCount={164} baseScale={0} className="w-screen h-full" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default Player
