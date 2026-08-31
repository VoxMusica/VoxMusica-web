export const ARTIST_FALLBACK_COLORS = [
  'bg-series-1 text-series-1-foreground',
  'bg-series-2 text-series-2-foreground',
  'bg-series-3 text-artist-3-foreground',
  'bg-series-4 text-series-4-foreground',
  'bg-series-5 text-series-5-foreground',
  'bg-series-6 text-series-6-foreground',
] as const

export const getRandomSerieColor = (id: string) => {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % ARTIST_FALLBACK_COLORS.length
  return ARTIST_FALLBACK_COLORS[index]
}
