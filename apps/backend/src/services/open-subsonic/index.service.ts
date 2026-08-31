import { getAllArtistsWithAlbumCount } from "#db/dao/artist.dao"
import { ignoredArticles } from "./config.ts"

import type { Artist, ArtistWithExtraData } from "#db/schema"

export const getIndexLetter = (title: string): string => {
  const pattern = new RegExp(String.raw`^(${ignoredArticles.join('|')})\\s+`, 'i')
  const firstChar = title.trim().replace(pattern, '').charAt(0)
  if (!firstChar) return '#'

  const stripped = firstChar.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  return /[a-z]/i.test(stripped) ? stripped.toUpperCase() : '#'
}


export const getAllArtistsByLetter: () => Promise<Map<string, ArtistWithExtraData[]>> = async ()  => {
  const artists = await getAllArtistsWithAlbumCount()
  return artists
    .map(artist => ({
      ...artist,
      userRating: null,
      starred: null,
    }))
    .reduce((acc, artist) => {
      const id = getIndexLetter(artist.name)
      if(!acc.has(id)){
        acc.set(id, [])
      }
      acc.get(id)!.push(artist)
      return acc
    }, new Map<string, ArtistWithExtraData[]>())
}
