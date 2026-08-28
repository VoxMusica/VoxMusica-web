import { getAllArtistsByLetter } from "./index.service.ts"

import type { Artist } from "#db/schema"

export interface IndexArtist {
  id: string
  name: string
  coverArt?: string
  artistImageUrl?: string
}
export interface ArtistID3 extends IndexArtist{
  albumCount?: number,
  starred?: string, // Date the artist was starred. [ISO 8601]
  musicBrainzId?: string,
  sortName?: string,
  disambiguation?: string,
  roles?: string[],
}

interface GenericIndex<T> {
  name: string
  artist: Array<T>
}

export type Index = GenericIndex<IndexArtist>
export type IndexID3 = GenericIndex<ArtistID3>


const indexArtistMapper = (artist: Artist): IndexArtist =>  ({
    id: artist.id,
    name: artist.name,
    ...(artist.musicbrainzArtistId ? {
      artistImageUrl: `https://music.kamule.me/share/img/${artist.musicbrainzArtistId}?size=600`
    }: {})
})
const indexID3ArtistMapper = (artist: Artist): IndexArtist =>  ({
    ...indexArtistMapper(artist)
    //TODO: map extra info when available
})

const getIndexForMapper = async <T extends IndexArtist>(mapper: (a: Artist) => T): Promise<Map<string, GenericIndex<T>>> => {
  const allArtistsByLetter = await getAllArtistsByLetter()
  return allArtistsByLetter.entries()
    .reduce((acc, [letter, artists]: [string, Artist[]]) => {
      acc.set(letter, {
        name: letter,
        artist: artists.map(mapper)
      })
      return acc
    }, new Map<string, GenericIndex<T>>())
}

export const getIndex = async (): Promise<Map<string, Index>> => getIndexForMapper(indexArtistMapper)

export const getIndexID3 = async (): Promise<Map<string, IndexID3>> => getIndexForMapper(indexID3ArtistMapper)