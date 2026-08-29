import { findArtistImage } from "#services/images/data-images.service"
import { getAllArtistsByLetter } from "./index.service.ts"

import type { Artist, ArtistWithAlbumCount } from "#db/schema"
import type { ArtistID3, IndexArtist } from "./browser.types.ts"


interface GenericIndex<T> {
  name: string
  artist: Array<T>
}

export type Index = GenericIndex<IndexArtist>
export type IndexID3 = GenericIndex<ArtistID3>


const indexArtistMapper = async (artist: Artist): Promise<IndexArtist> =>  {
  const imagePath = await findArtistImage(artist.id)
  return {
    id: artist.id,
    name: artist.name,
    ...(imagePath ? {
      artistImageUrl: `api/artists/${artist.id}/image`
    }: {})
  }
}

const indexID3ArtistMapper = (artist: ArtistWithAlbumCount): Promise<IndexArtist> =>  indexArtistMapper(artist).then( base => ({
    ...base,
    albumCount: artist.albumCount
}))

const getIndexForMapper = async <T extends IndexArtist>(mapper: (a: ArtistWithAlbumCount) => Promise<T>): Promise<Map<string, GenericIndex<T>>> => {
  const allArtistsByLetter = await getAllArtistsByLetter()
  const result = new Map<string, GenericIndex<T>>()
  for(const [letter, artists] of allArtistsByLetter){
    const artist = await Promise.all(artists.map(mapper))
    result.set(letter, {
      name: letter,
      artist
    })
  }
   return result
}

export const getIndex = async (): Promise<Map<string, Index>> => getIndexForMapper(indexArtistMapper)

export const getIndexID3 = async (): Promise<Map<string, IndexID3>> => getIndexForMapper(indexID3ArtistMapper)

// export const getArtistID3 = async (): Promise<ArtistID3