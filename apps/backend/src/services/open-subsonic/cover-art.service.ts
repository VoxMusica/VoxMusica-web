export type CoverArtEntityType = 'album' | 'artist'

const PREFIXES: Record<CoverArtEntityType, string> = {
  album: 'al-',
  artist: 'ar-',
}

export const toCoverArtId = (type: CoverArtEntityType, entityId: string): string =>
  `${PREFIXES[type]}${entityId}`

export const parseCoverArtId = (coverArtId: string): { type: CoverArtEntityType; entityId: string } | null => {
  for (const [type, prefix] of Object.entries(PREFIXES) as [CoverArtEntityType, string][]) {
    if (coverArtId.startsWith(prefix)) {
      return { type, entityId: coverArtId.slice(prefix.length) }
    }
  }
  return null
}
