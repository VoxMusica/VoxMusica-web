import { getArtistSchema, type GetArtistQueryParams, type GetArtistResponse, type OpenSubsonicRequest } from "@voxmusica/types"
import ms from "ms"

import { subsonicOk } from "#api/open-subsonic/responses/subsonic.response"
import { getArtistID3 } from "#services/open-subsonic/browsing.service"

import type { FastifyPluginAsync } from "fastify"

export const GET_ARTIST_CACHE_KEY = `subsonic:getArtist:`

type GetArtistParams = OpenSubsonicRequest & {
  Querystring: GetArtistQueryParams,
  Reply: GetArtistResponse
}
export const getArtistHandler: FastifyPluginAsync = async (app) => {
  app.get<GetArtistParams>('/getArtist', {
    schema: { querystring: getArtistSchema }
  }, async (request, reply) => {
    const id = request.query.id
    
    const cacheKey = `${GET_ARTIST_CACHE_KEY}:${id}:user:${request.subsonicUser.id}`

    const cached = await app.cache.get(cacheKey)
    if (cached?.item) {
      return subsonicOk(request.query, reply, cached.item)
    }
    const artist = await getArtistID3(id, request.subsonicUser.id)

    app.cache.set(cacheKey, artist, ms('1h'))
    return subsonicOk(request.query, reply, { artist })
  })
}
