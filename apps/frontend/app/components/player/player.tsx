import { X } from 'lucide-react'

import PlayerControls from './controls'
import Disc from './disc'
import PlayerProgress from './progress'
import { TrackInfo } from './track-info'

import { usePlayerStore } from '@/store/player.store'
import { MORPH } from '@/style/transitions'


const NOW_PLAYING = {
  title: 'unravel',
  artist: 'Ado',
  album: 'Ado Nationwide Tour 2023 Mars (Live At Nippon Budokan, 2023)',
  duration: 244,
  elapsed: 161,
  hue: '#C99A5B'
}

export const Player = () => {  
  const { expanded, playing, togglePlay, setExpanded, currentTime, duration, currentSong } = usePlayerStore()

return currentSong ? <div
    className={`fixed z-30 overflow-hidden shadow-2xl backdrop-blur-md border ${
      expanded ? 'bg-background border-transparent' : 'bg-popover/90 border-border'
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
    style={{
      transition: MORPH,
      ...(expanded
        ? { right: 0, bottom: 0, borderRadius: 0, width: '100%', height: '100%' }
        : { bottom: 20, right: 20, width: 460, height: 80, borderRadius: 999 })
    }}

  >
    {expanded && <button type="button"
      onClick={() => setExpanded(false)}
      className="absolute top-6 right-6 w-9 h-9 rounded-full flex items-center justify-center bg-secondary text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label="Minimize player"
    >
      <X size={16} />
    </button>}
      <div className={`absolute pointer-events-none ${
        expanded ? ' w-full max-w-md left-1/2' : ' left-5 right-5 bottom-2.5'
        }`}
        style={expanded ? { top: '76%', transform: 'translate(-50%, -50%)'} : {}}
      >
        <PlayerProgress elapsed={currentTime} duration={duration} showLabels={expanded}/>
      </div>

      <Disc playing={playing} expanded={expanded} hue={NOW_PLAYING.hue} />
      <TrackInfo title={currentSong.title} artist={currentSong.artist} album={currentSong.album} expanded={expanded} />
      <PlayerControls playing={playing} expanded={expanded} onTogglePlay={() => togglePlay()} />
  </div> : <></>
}

export default Player
