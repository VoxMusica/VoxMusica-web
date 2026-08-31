import { useQuery } from '@tanstack/react-query'

const fetchSystemInfo = async () => {
  const res = await fetch('/api/system/info')
  if (!res.ok) throw new Error('Failed to fetch system info')
  return res.json()
}

export const useSystemInfo = () => useQuery({
  queryKey: ['system', 'info'],
  queryFn: fetchSystemInfo,
  staleTime: (query) => (query.state.data?.initialized ? Infinity : 0)
})
