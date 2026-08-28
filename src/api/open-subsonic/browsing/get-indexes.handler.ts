import ms from "ms"

import { subsonicOk, type SubsonicRequest } from "#api/open-subsonic/responses/subsonic.response"
import { getAllArtists } from "#services/music/artists.service"
import { VMSet } from "#types/vm-set"

import type { FastifyPluginAsync } from "fastify"




const ignoredArticles =  new VMSet([
  'The',
  'El', 'La', 'Los', 'Las',
  'Le', 'Les',
  'Os', 'As', 'O', 'A',
  'Der', 'Die', 'Das', 'Den', 'Dem', 'Des', 'Ein', 'Eine', 'Einen', 'Einem', 'Einer', 'Eines',
  'Il', 'Lo', 'La', 'I', 'Gli', 'Le', 'Un', 'Uno', 'Una',
  'De', 'Het', 'Een',
  'Det', 'En', 'Ett',
])

const getIndexLetter = (title: string): string => {
  const pattern = new RegExp(String.raw`^(${ignoredArticles.join('|')})\\s+`, 'i')
  const firstChar = title.trim().replace(pattern, '').charAt(0)
  if (!firstChar) return '#'

  const stripped = firstChar.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  return /[a-z]/i.test(stripped) ? stripped.toUpperCase() : '#'
}

interface IndexArtist {
  id: string
  name: string
  coverArt?: string
  artistImageUrl?: string
}
interface Index {
      name: string
      artist: Array<IndexArtist>
}

export const getIndexesHandler: FastifyPluginAsync = async (app) => {
  type GetIndexesType = SubsonicRequest & { Querystring: { musicFolderId?: string, ifModifiedSince?: number } }
  app.get<GetIndexesType>('/getIndexes', async (request, reply) => {
    const { sub } = request.user
    const cacheKey = `subsonic:getIndex:${sub}`

    const cached = await app.cache.get(cacheKey)
    if (cached) {
      return subsonicOk(request.query, reply, cached)
    }

    const artists = await getAllArtists()
    const index = artists.reduce((acc, artist) => {
      const id = getIndexLetter(artist.name)
      if(!acc.has(id)){
        acc.set(id, {
          name: id,
          artist: []
        })
      }
      acc.get(id)!.artist.push({
        id: artist.id,
        name: artist.name,
        ...(artist.musicbrainzArtistId ? {
          artistImageUrl: `https://music.kamule.me/share/img/${artist.musicbrainzArtistId}?size=600`
        }: {})
      })
      return acc
    }, new Map<string, Index>())

    const result = {
      indexes: {
        index: [...index.values()],
        ignoredArticles: ignoredArticles.join(' ')
      }
    }
    await app.cache.set(cacheKey, result, ms('1h'))
    return subsonicOk(request.query, reply, result)
  })
}
