import { Play, Shuffle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'

import ReleaseSection from '@/components/library/artist/release-section'
import Loading from '@/components/loading'
import { Button } from '@/components/ui/button'
import { usePlayerActions } from '@/hooks/use-player-actions'
import { groupAlbumsByReleaseType } from '@/lib/release-type'
import { useArtist } from '@/queries/library/artists.queries'
import { useTopSongs } from '@/queries/library/track.queries'

export const ArtistPage = () => {
  const { t } = useTranslation()
  const { artistId } = useParams<{ artistId: string }>()
  const { data: artist, isLoading, isError } = useArtist(artistId ?? '')
  const { data: topSongs } = useTopSongs(artistId ?? '')
  const { playTracks, playAlbum } = usePlayerActions()

  if (isLoading) {
    return <Loading />
  }
  if (artist == null || isError) {
    return <div>{t('artist.error')}</div>
  }

  const albums = artist.album ?? []
  const { album: fullAlbums, ep: eps, single: singles } = groupAlbumsByReleaseType(albums)

  const playAllPopular = () => {
      console.log('start playing', topSongs)
    if ((topSongs?.length ?? 0 ) > 0) {
      playTracks(topSongs!)
    }
  }

  const playAllShuffled = () => {
    // playTracks(albums.flatMap((a) => a.songCount != null ? [a] : []), { shuffle: true })
    // if your player takes track IDs rather than albums, fetch/flatten tracks here instead
  }

  return (
    <div className="flex flex-col gap-8 p-6">
      <header className="flex gap-6">
        {artist.artistImageUrl != null && (
          <img
            src={artist.artistImageUrl}
            alt={artist.name}
            className="h-40 w-40 rounded-full object-cover"
          />
        )}
        <div className="flex flex-col justify-end gap-2">
          <h1 className="text-3xl font-bold">{artist.name}</h1>
          <p className="text-muted-foreground text-sm">
            {t('artist.albumCount', { count: artist.albumCount })}
          </p>
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
          <ol className="flex flex-col divide-y">
            {topSongs?.slice(0, 5).map((song, index) => (
              <li key={song.id} className="flex items-center gap-4 py-2">
                <span className="text-muted-foreground w-6 text-sm">{index + 1}</span>
                <div className="flex-1">
                  <p className="font-medium">{song.title}</p>
                  <p className="text-muted-foreground text-sm">{song.album}</p>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => playTracks([song])}
                  aria-label={t('artist.playSong', { title: song.title })}
                >
                  <Play className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ol>
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
