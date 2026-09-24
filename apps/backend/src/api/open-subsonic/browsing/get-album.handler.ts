import { getArtistSchema, type GetAlbumReply, type GetArtistQueryParams, type OpenSubsonicRequest } from "@voxmusica/types"
import ms from "ms"

import { subsonicOk } from "#api/open-subsonic/responses/subsonic.response"
import { getAlbumID3 } from "#services/open-subsonic/browsing.service"

import type { FastifyPluginAsync } from "fastify"

export const GET_ALBUM_CACHE_KEY = `subsonic:getAlbum:`

type GetAlbumParams = OpenSubsonicRequest & {
  Querystring: GetArtistQueryParams,
  Reply: GetAlbumReply
}
export const getAlbumHandler: FastifyPluginAsync = async (app) => {
  app.get<GetAlbumParams>('/getAlbum', {
    schema: { querystring: getArtistSchema }
  }, async (request, reply) => {
    const id = request.query.id
    
    const cacheKey = `${GET_ALBUM_CACHE_KEY}:${id}:user:${request.subsonicUser.id}`

    const cached = await app.cache.get(cacheKey)
    if (cached?.item) {
      return subsonicOk(request.query, reply, cached.item)
    }
    const album = await getAlbumID3(id, request.subsonicUser.id)

    app.cache.set(cacheKey, album, ms('1h'))
    return subsonicOk(request.query, reply, { album })
  })
}
