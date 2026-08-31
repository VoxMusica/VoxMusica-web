import { useQuery } from '@tanstack/react-query'

import type { Child, GetTopSongsReply } from '@voxmusica/types'

import { subsonicFetch } from '@/lib/subsonic-client'

const TOP_SONG_CACHE_KEY = 'top-songs-'

export const useTopSongs = (artistId: string) =>
  useQuery<unknown, Error, Child[]>({
    queryKey: [TOP_SONG_CACHE_KEY, artistId],
    queryFn: () => subsonicFetch<GetTopSongsReply>('getTopSongs', { id: artistId })
      .then(v => v.topSongs?.song),
    enabled: !!artistId
  })

// export const scibl