import ms from "ms"

import { subsonicOk, type SubsonicRequest } from "#api/open-subsonic/responses/subsonic.response"
// import { getArtistID3 } from "#services/open-subsonic/browsing.service"
import { ignoredArticles } from "#services/open-subsonic/config"

import type { FastifyPluginAsync } from "fastify"

export const GET_ARTIST_CACHE_KEY = `subsonic:getArtist:`

type GetArtistParams = SubsonicRequest & { Querystring: { id?: string} }
export const getArtistHandler: FastifyPluginAsync = async (app) => {
  app.get<GetArtistParams>('/getArtist', async (request, reply) => {
    // const id = request.query.id
    // const cacheKey = `subsonic:getArtist:${id}`

    // const cached = await app.cache.get(cacheKey)
    // if (cached?.item) {
    //   return subsonicOk(request.query, reply, cached.item)
    // }
    // const index = await getArtistID3()

    // const result = {
    //   artists: {
    //     index: [...index.values()],
    //     ignoredArticles: ignoredArticles.join(' ')
    //   }
    // }
    // await app.cache.set(cacheKey, result, ms('1h'))
    // return subsonicOk(request.query, reply, result)
    return '{}'
  })
}
