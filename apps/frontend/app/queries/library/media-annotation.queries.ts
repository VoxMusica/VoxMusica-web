import { useMutation, useQueryClient } from '@tanstack/react-query'

import { albumKeys } from './albums.queries'
import { artistKeys } from './artists.queries'
import { trackKeys } from './track.queries'

import type { Child } from '@voxmusica/types'

import { apiClient } from '@/lib/open-subsonic.api-client'


export const useSetRatingMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: apiClient.setRating,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: artistKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: albumKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: trackKeys.detail(variables.id) })
    },
  })
}

export const useInvalidateTopSongsForTrack = () => {
  const queryClient = useQueryClient()
  
  return (track: Child) => {
    if(track.artistId) queryClient.invalidateQueries({ queryKey: trackKeys.topSongs(track.artistId) })
    if(track.albumId) queryClient.invalidateQueries({ queryKey: albumKeys.detail(track.albumId) })
  }
}

export const useSetFavMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: apiClient.setFav,
    onSuccess: (_data, variables) => {
      const id = variables.id ?? variables.albumId ?? variables.artistId
      if(!id){
        return
      }
      queryClient.invalidateQueries({ queryKey: artistKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: albumKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: trackKeys.detail(id) })
    },
  })
}

export const useUnFavMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: apiClient.unFav,
    onSuccess: (_data, variables) => {
      const id = variables.id ?? variables.albumId ?? variables.artistId
      if(!id){
        return
      }
      queryClient.invalidateQueries({ queryKey: artistKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: albumKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: trackKeys.detail(id) })
    },
  })
}
