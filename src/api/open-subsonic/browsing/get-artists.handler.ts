import ms from "ms"

import { subsonicOk, type SubsonicRequest } from "#api/open-subsonic/responses/subsonic.response"
import { getIndexID3 } from "#services/open-subsonic/browsing.service"
import { ignoredArticles } from "#services/open-subsonic/config"

import type { FastifyPluginAsync } from "fastify"



export const getArtistsHandler: FastifyPluginAsync = async (app) => {
  type GetArtistsType = SubsonicRequest & { Querystring: { musicFolderId?: string} }
  app.get<GetArtistsType>('/getArtists', async (request, reply) => {
    const cacheKey = `subsonic:getArtists`

    // const cached = await app.cache.get(cacheKey)
    // if (cached) {
    //   return subsonicOk(request.query, reply, cached.item)
    // }
    const index = await getIndexID3()

    const result = {
      artists: {
        index: [...index.values()],
        ignoredArticles: ignoredArticles.join(' ')
      }
    }
    await app.cache.set(cacheKey, result, ms('1h'))
    return subsonicOk(request.query, reply, result)
  })
}
