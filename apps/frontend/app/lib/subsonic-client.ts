const CLIENT_NAME = 'VoxMusica'
const API_VERSION = '1.16.1'

export const buildSubsonicUrl = (path: string, params: Record<string, string | number | boolean> = {}): string => {
  const searchParams = new URLSearchParams({
    v: API_VERSION,
    c: CLIENT_NAME,
    ...Object.fromEntries(Object.entries(params).map(([key, value]) => [key, String(value)])),
  })

  return `/rest/${path}?${searchParams.toString()}`
}

export const subsonicFetch = async <T>(path: string, params?: Record<string, string | number | boolean>): Promise<T> => {
  const response = await fetch(buildSubsonicUrl(path, params))

  if (!response.ok) {
    throw new Error(`Subsonic request failed: ${path} (${response.status})`)
  }

  const data = await response.json()
  return data as T
}

export const getStreamUrl = (trackId: string, options?: { maxBitRate?: number; format?: string }): string => {
  const params = new URLSearchParams({
    id: trackId,
    v: API_VERSION,
    c: CLIENT_NAME,
  })

  if (options?.maxBitRate != null) params.set('maxBitRate', String(options.maxBitRate))
  if (options?.format != null) params.set('format', options.format)

  return `/rest/stream?${params.toString()}`
}

export const getCoverArtUrl = (coverArtId: string): string => {
  const params = new URLSearchParams({
    id: coverArtId,
    v: API_VERSION,
    c: CLIENT_NAME,
  })

  return `/rest/getCoverArt?${params.toString()}`
}
