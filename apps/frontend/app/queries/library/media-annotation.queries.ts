import { useMutation, useQueryClient } from '@tanstack/react-query'

import { albumKeys } from './albums.queries'
import { artistKeys } from './artists.queries'
import { trackKeys } from './track.queries'

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
