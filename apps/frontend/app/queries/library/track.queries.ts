import { useQuery } from '@tanstack/react-query'

import type { Child, GetTopSongsReply } from '@voxmusica/types'

import { subsonicFetch } from '@/lib/subsonic-client'


export const trackKeys = {
  all: ['tracks'] as const,
  topSongs: (artistId: string) => ['top-songs-', artistId] as const,
  detail: (trackId: string) => ['tracks', trackId] as const,
}

export const useTopSongs = (artistId: string) =>
  useQuery<unknown, Error, Child[]>({
    queryKey: trackKeys.topSongs(artistId),
    queryFn: () => subsonicFetch<GetTopSongsReply>('getTopSongs', { id: artistId })
      .then(v => v.topSongs?.song),
    enabled: !!artistId
  })

// export const scibl