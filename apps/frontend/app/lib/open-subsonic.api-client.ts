import { subsonicFetch } from './subsonic-client'

import type { AlbumID3WithSongs, GetAlbumReply, GetArtistResponse, GetTopSongsReply, SetRatingParams, StarParams } from '@voxmusica/types'

export const apiClient = {
  getArtist: (id: string) => subsonicFetch<GetArtistResponse>('getArtist', { id }),
  getTopSongs: (params: { id: string; count?: number }) => subsonicFetch<GetTopSongsReply>('getTopSongs', params),
  getAlbum: async (id: string): Promise<AlbumID3WithSongs> => {
    const response = await subsonicFetch<GetAlbumReply>('getAlbum', { id })
    return response.album
  },
  scrobble: (params: { id: string; submission?: boolean }) => subsonicFetch<void>('scrobble', params),
  setRating: (params: SetRatingParams) => subsonicFetch<void>('setRating', params),
  setFav: (params: StarParams) => subsonicFetch<void>('star', params),
  unFav: (params: StarParams) => subsonicFetch<void>('unstar', params),
}
