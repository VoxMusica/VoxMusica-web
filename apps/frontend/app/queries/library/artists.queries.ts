import { useQuery } from '@tanstack/react-query'

import type { ArtistWithAlbumsID3, GetArtistResponse, GetArtistsResponse, IndexArtist } from '@voxmusica/types'

import { subsonicFetch } from '@/lib/subsonic-client'

const GET_ALL_CACHE_KEY = 'get-artists'
const GET_ONE_CACHE_KEY = 'get-artist'

interface WithName{
  name: string
}
const sortName = (a: WithName, b :WithName) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })

export const useAllArtists = () => useQuery<unknown, Error, IndexArtist[]>({
  queryKey: [GET_ALL_CACHE_KEY],
  queryFn: () => subsonicFetch<GetArtistsResponse>('getArtists')
    .then(v => v.artists?.index)
    .then(v => v
        ?.toSorted(sortName)
        ?.map(({name, artist}) => ({
          name,
          artist: artist?.toSorted(sortName)
        }))
    )
})

export const useArtist = (artistId?: string) =>
  useQuery<unknown, Error, ArtistWithAlbumsID3>({
    queryKey: [GET_ONE_CACHE_KEY, artistId],
    queryFn: () => subsonicFetch<GetArtistResponse>('getArtist', { id: artistId! })
      .then(v => v.artist),
    enabled: !!artistId
  })
