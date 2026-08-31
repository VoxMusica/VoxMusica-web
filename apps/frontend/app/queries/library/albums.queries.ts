import { useQuery, useQueryClient } from '@tanstack/react-query'

import { apiClient } from '@/lib/open-subsonic.api-client'

export const albumKeys = {
  all: ['albums'] as const,
  detail: (albumId: string) => ['albums', albumId] as const,
}

export const useAlbum = (albumId: string) =>
  useQuery({
    queryKey: albumKeys.detail(albumId),
    queryFn: () => apiClient.getAlbum(albumId),
    enabled: albumId.length > 0,
  })

export const useFetchAlbum = () => {
  const queryClient = useQueryClient()

  return (albumId: string) =>
    queryClient.query({
      queryKey: albumKeys.detail(albumId),
      queryFn: () => apiClient.getAlbum(albumId),
    })
}
