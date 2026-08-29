import ms from "ms"

import { subsonicOk, type SubsonicRequest } from "#api/open-subsonic/responses/subsonic.response"
import { getIndexID3 } from "#services/open-subsonic/browsing.service"
import { ignoredArticles } from "#services/open-subsonic/config"

import type { FastifyPluginAsync } from "fastify"

export const GET_ARTISTS_CACHE_KEY = `subsonic:getArtists`

export const getArtistsHandler: FastifyPluginAsync = async (app) => {
  type GetArtistsType = SubsonicRequest & { Querystring: { musicFolderId?: string} }
  app.get<GetArtistsType>('/getArtists', async (request, reply) => {
    

    const cached = await app.cache.get(GET_ARTISTS_CACHE_KEY)
    if (cached?.item) {
      return subsonicOk(request.query, reply, cached.item)
    }
    const index = await getIndexID3()

    const result = {
      artists: {
        index: [...index.values()],
        ignoredArticles: ignoredArticles.join(' ')
      }
    }
    await app.cache.set(GET_ARTISTS_CACHE_KEY, result, ms('1h'))
    return subsonicOk(request.query, reply, result)
  })
}
