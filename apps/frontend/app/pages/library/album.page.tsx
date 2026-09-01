import { Play, Shuffle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router'

import type { Child } from '@voxmusica/types'

import Loading from '@/components/loading'
import TrackList from '@/components/track-list'
import { Button } from '@/components/ui/button'
import { formatDuration } from '@/lib/format-duration'
import { getCoverArtUrl } from '@/lib/subsonic-client'
import { useAlbum } from '@/queries/library/albums.queries'
import { usePlayerStore } from '@/store/player.store'


export const AlbumPage = () => {
  const { t } = useTranslation()
  const { albumId } = useParams<{ albumId: string }>()
  const { data: album, isLoading, isError } = useAlbum(albumId ?? '')
  const { playTracks, togglePlay, currentSong } = usePlayerStore()

  if (isLoading) {
    return <Loading />
  }
  if (album == null || isError) {
    return <div>{t('album.error')}</div>
  }

  const handlePlayTrack = (_track: Child, index: number) => {
    playTracks(album.song, { startIndex: index })
  }

  const playAll = () => {
    playTracks(album.song)
  }

  const shuffleAll = () => {
    playTracks(album.song, { shuffle: true })
  }

  return (
    <div className="flex flex-col gap-8 p-6 w-full">
      <header className="flex gap-6">
        {album.coverArt != null && (
          <img
            src={getCoverArtUrl(album.coverArt)}
            alt={album.name}
            className="h-60 w-60 rounded object-cover"
          />
        )}
        <div className="flex flex-col justify-end gap-2">
          <h1 className="text-3xl font-bold">{album.name}</h1>
          <Link to={`/artists/${album.artistId}`} className="text-muted-foreground hover:underline">
            {album.artist}
          </Link>
          <p className="text-muted-foreground text-sm">
            {album.year != null ? `${album.year} · ` : ''}
            {t('album.songCount', { count: album.songCount })}
            {' · '}
            {formatDuration(album.duration)}
          </p>
          <div className="mt-2 flex gap-2">
            <Button onClick={playAll} className="cursor-pointer">
              <Play className="mr-2 h-4 w-4" />
              {t('album.play')}
            </Button>
            <Button variant="secondary" onClick={shuffleAll} className="cursor-pointer">
              <Shuffle className="mr-2 h-4 w-4" />
              {t('album.shuffle')}
            </Button>
          </div>
        </div>
      </header>

      <TrackList
        tracks={album.song}
        onPlayTrack={handlePlayTrack}
        onPauseTrack={() => togglePlay()}
        currentSongId={currentSong?.id}
        showIndex={true}
        />
    </div>
  )
}

export default AlbumPage
