import { Play, Shuffle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'

import type { Child } from '@voxmusica/types'

import ReleaseSection from '@/components/library/artist/release-section'
import Loading from '@/components/loading'
import Rating from '@/components/rating'
import TrackList from '@/components/track-list'
import { Button } from '@/components/ui/button'
import { groupAlbumsByReleaseType } from '@/lib/release-type'
import { useArtist } from '@/queries/library/artists.queries'
import { useSetRatingMutation } from '@/queries/library/media-annotation.queries'
import { useTopSongs } from '@/queries/library/track.queries'
import { usePlayerStore } from '@/store/player.store'

export const ArtistPage = () => {
  const { t } = useTranslation()
  const { artistId } = useParams<{ artistId: string }>()
  const { data: artist, isLoading, isError } = useArtist(artistId ?? '')
  const { data: topSongs } = useTopSongs(artistId ?? '')
  const { playTracks, playAlbum, togglePlay, currentSong } = usePlayerStore()
  const { mutateAsync: setRating } = useSetRatingMutation()

  if (isLoading) {
    return <Loading />
  }
  if (artist == null || isError) {
    return <div>{t('artist.error')}</div>
  }

  const albums = artist.album ?? []
  const { album: fullAlbums, ep: eps, single: singles } = groupAlbumsByReleaseType(albums)

  const playAllPopular = () => {
    if ((topSongs?.length ?? 0 ) > 0) {
      playTracks(topSongs!)
    }
  }

  const playAllShuffled = () => {
    // playTracks(albums.flatMap((a) => a.songCount != null ? [a] : []), { shuffle: true })
    // if your player takes track IDs rather than albums, fetch/flatten tracks here instead
  }

  const handlePlayTrack = (tracks: Child[]) => (_track: Child, index: number) => {
    playTracks(tracks, { startIndex: index })
  }

  const handleRateArtist = async (rating: number) => {
    if (artistId) {
      await setRating({ id: artistId, rating })
    }
  }

  return (
    <div className="flex flex-col gap-8 p-6 w-full">
      <header className="flex flex-row gap-6">
        {artist.artistImageUrl != null && (
          <img
            src={artist.artistImageUrl}
            alt={artist.name}
            className="h-60 w-60 rounded object-cover"
          />
        )}
        <div className="flex flex-col justify-center gap-2">
          <h1 className="text-3xl font-bold">{artist.name}</h1>
          <p className="text-muted-foreground text-sm">
            {t('artist.albumCount', { count: artist.albumCount })}
          </p>
          <div>
            <Rating value={artist.userRating ?? 0} onChange={handleRateArtist} />
          </div>
          <div className="mt-2 flex gap-2">
            <Button onClick={playAllPopular}>
              <Play className="mr-2 h-4 w-4" />
              {t('artist.playPopular')}
            </Button>
            <Button variant="secondary" onClick={playAllShuffled}>
              <Shuffle className="mr-2 h-4 w-4" />
              {t('artist.shuffleAll')}
            </Button>
          </div>
        </div>
      </header>

      {(topSongs?.length ?? 0) > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-semibold">{t('artist.topSongs')}</h2>
          <TrackList
            tracks={topSongs ?? []}
            onPlayTrack={handlePlayTrack(topSongs ?? [])}
            onPauseTrack={() => togglePlay()}
            currentSongId={currentSong?.id}
            maxHeight={5}
            showAlbum={true} />
        </section>
      )}

      {fullAlbums.length > 0 && (
        <ReleaseSection
          title={t('artist.albums')}
          releases={fullAlbums}
          onPlay={playAlbum}
        />
      )}

      {eps.length > 0 && (
        <ReleaseSection title={t('artist.eps')} releases={eps} onPlay={playAlbum} />
      )}

      {singles.length > 0 && (
        <ReleaseSection
          title={t('artist.singles')}
          releases={singles}
          onPlay={playAlbum}
        />
      )}
    </div>
  )
}


export default ArtistPage
