import { Pause, Play } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import Rating from './rating'

import type { Child } from '@voxmusica/types'

import EqualizerBars from '@/components/player/equalizer-bars'
import { Button } from '@/components/ui/button'
import { getAnalyser } from '@/lib/audio'
import { formatDuration } from '@/lib/format-duration'


 interface TrackListProps {
  tracks: Child[]
  showAlbum?: boolean
  showIndex?: boolean
  maxHeight?: number
  currentSongId?: string
  isPlaying: boolean
  onPlayTrack: (track: Child, index: number) => void
  onPauseTrack: () => void
  onTrackRatingChange: (track: Child, rating: number) => void
}

const TrackList = ({
  tracks,
  showAlbum = false,
  showIndex = true,
  maxHeight = 10,
  currentSongId,
  isPlaying,
  onPlayTrack,
  onPauseTrack,
  onTrackRatingChange
}: TrackListProps) => {
  const { t } = useTranslation()
  
  const handlePlayTrack = (track: Child, index: number) => () => {
    if (currentSongId === track.id) {
      onPauseTrack()
    } else {
      onPlayTrack(track, index)
    }
  }

  const handleRatingChange = (track: Child) => (rating: number) => {
    onTrackRatingChange(track, rating)
  }

  const analyser = getAnalyser()

  return (
    <ol className="flex flex-col divide-y">
      {tracks.slice(0, maxHeight).map((track, index) => {
        const isCurrent = currentSongId === track.id

        return (
          <li
            key={track.id}
            className={`group flex items-center gap-4 py-2 px-2 rounded-md transition-colors ${
              isCurrent ? 'bg-accent' : 'hover:bg-accent/50'
            }`}
          >
            {showIndex && (
              <span className="text-muted-foreground w-6 text-sm flex items-center justify-center">
                {isCurrent && isPlaying ? (
                  <EqualizerBars playing={isPlaying} analyser={analyser} className="w-3 h-3" barCount={4} />
                ) : (
                  <span>{index + 1}</span>
                )}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className={`truncate font-medium ${isCurrent ? 'text-primary' : ''}`}>
                {track.title}
              </p>
              {showAlbum && track.album != null && (
                <Link to={`/albums/${track.albumId}`} className="text-muted-foreground truncate text-sm">
                  {track.album}
                </Link>
              )}
            </div>
            {track.duration != null && (
              <span className="text-muted-foreground text-sm tabular-nums">
                {formatDuration(track.duration)}
              </span>
            )}
            <div className="flex-0">
              <Rating value={track.userRating ?? 0} onChange={handleRatingChange(track)} />
            </div>
            <Button
              size="icon"
              variant="ghost"
              className={`transition-opacity group-hover:text-primary group-hover:fill-primary cursor-pointer ${
                isCurrent ? 'text-primary fill-primary opacity-100' : 'opacity-0 group-hover:opacity-100'
              }`}
              onClick={handlePlayTrack(track, index)}
              aria-label={t('common.playTrack', { title: track.title })}
            >
              {isCurrent && isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
          </li>
        )
      })}
    </ol>
  )
}

export default TrackList
