import type { AlbumID3 } from '@voxmusica/types'

export type ReleaseType = 'album' | 'ep' | 'single'

export const classifyRelease = (album: AlbumID3): ReleaseType => {
  if (album.songCount <= 1) return 'single'
  if (album.songCount <= 6) return 'ep'
  return 'album'
}

export const groupAlbumsByReleaseType = (albums: AlbumID3[]) => {
  const groups: Record<ReleaseType, AlbumID3[]> = { album: [], ep: [], single: [] }

  for (const album of albums) {
    groups[classifyRelease(album)].push(album)
  }

  for (const key of Object.keys(groups) as ReleaseType[]) {
    groups[key].sort((a, b) => (b.year ?? 0) - (a.year ?? 0))
  }

  return groups
}
