import { Pause, Play } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import Rating from './rating'

import type { Child } from '@voxmusica/types'

import { Button } from '@/components/ui/button'
import { formatDuration } from '@/lib/format-duration'


 interface TrackListProps {
  tracks: Child[]
  onPlayTrack: (track: Child, index: number) => void
  onPauseTrack: () => void
  showAlbum?: boolean
  showIndex?: boolean
  maxHeight?: number,
  currentSongId?: string
}

const TrackList = ({
  tracks,
  onPlayTrack,
  onPauseTrack,
  showAlbum = false,
  showIndex = true,
  maxHeight = 10,
  currentSongId,
}: TrackListProps) => {
  const { t } = useTranslation()

  const handlePlayTrack = (track: Child, index: number) => () => {
    if (currentSongId === track.id) {
      onPauseTrack()
    } else {
      onPlayTrack(track, index)
    }
  }

  return (
    <ol className="flex flex-col divide-y">
      {tracks.slice(0, maxHeight).map((track, index) => (
        <li key={track.id} className="group flex items-center gap-4 py-2">
          {showIndex && (
            <span className="text-muted-foreground w-6 text-sm">
              {index + 1}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{track.title}</p>
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
          {currentSongId === track.id && (
            <div className="flex-0">
              <Rating value={track.userRating ?? 0} onChange={() => {}} />
            </div>
          )}
          <Button
            size="icon"
            variant="ghost"
            className="transition-opacity group-hover:text-primary group-hover:fill-primary cursor-pointer"
            onClick={handlePlayTrack(track, index)}
            aria-label={t('common.playTrack', { title: track.title })}
          >
            { currentSongId === track.id ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
        </li>
      ))}
    </ol>
  )
}

export default TrackList
