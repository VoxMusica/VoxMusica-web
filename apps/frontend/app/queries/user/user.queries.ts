import { useMutation, useQuery, useQueryClient  } from '@tanstack/react-query'

import { deleteMutation, getQueryFn, postMutationFn } from '@/queries/utils'

import type { CreateApiKeyQuery, GetApiKeysResponse } from './user.types'



const GET_CACHE_KEY = 'get-api-keys'

export const useApiKeys = () => useQuery<unknown, Error, GetApiKeysResponse[]>({
  queryKey: [GET_CACHE_KEY],
  queryFn: () => getQueryFn<{keys: GetApiKeysResponse[]}>('/api/user/api-keys').then(v => v.keys)
})

export const useCreateApiKey = () => {
  const queryClient = useQueryClient()
  return useMutation<GetApiKeysResponse, Error, CreateApiKeyQuery>({
    mutationFn: postMutationFn('/api/user/api-keys'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [GET_CACHE_KEY] }),
  })
}

export const useDeleteApiKey = () =>{
  const queryClient = useQueryClient()
  return useMutation<unknown, Error, string>({
    mutationFn: deleteMutation('/api/user/api-keys', v => v),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [GET_CACHE_KEY] }),
  })
}
