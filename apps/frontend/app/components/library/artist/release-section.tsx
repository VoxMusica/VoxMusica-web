import { useQueryClient } from '@tanstack/react-query'
import { Play } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { AlbumID3, Child } from '@voxmusica/types'

import { Button } from '@/components/ui/button'
import { apiClient } from '@/lib/open-subsonic.api-client'


const ReleaseSection = ({
  title,
  releases,
  onPlay,
}: {
  title: string
  releases: AlbumID3[]
  onPlay: (albumId: string, tracks: Child[]) => void
}) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [loadingAlbumId, setLoadingAlbumId] = useState<string | null>(null)

  const handlePlay = async (albumId: string) => {
    setLoadingAlbumId(albumId)
    try {
      const album = await queryClient.fetchQuery({
        queryKey: ['album', albumId],
        queryFn: () => apiClient.getAlbum(albumId),
      })
      onPlay(albumId, album.song)
    } finally {
      setLoadingAlbumId(null)
    }
  }

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {releases.map((release) => (
          <div key={release.id} className="group relative flex flex-col gap-2">
            <div className="relative aspect-square overflow-hidden rounded-md bg-muted">
              {release.coverArt != null && (
                <img
                  src={`/api/cover/${release.coverArt}`}
                  alt={release.name}
                  className="h-full w-full object-cover"
                />
              )}
              <Button
                size="icon"
                className="absolute right-2 bottom-2 opacity-0 shadow-md transition-opacity group-hover:opacity-100"
                onClick={() => handlePlay(release.id)}
                disabled={loadingAlbumId === release.id}
                aria-label={t('artist.playAlbum', { title: release.name })}
              >
                <Play className="h-4 w-4" />
              </Button>
            </div>
            <div>
              <p className="truncate text-sm font-medium">{release.name}</p>
              <p className="text-muted-foreground text-xs">{release.year ?? ''}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default ReleaseSection
