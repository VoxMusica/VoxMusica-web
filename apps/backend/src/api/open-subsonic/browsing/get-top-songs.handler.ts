import { getTopSongsSchema, type GetTopSongsQueryParams, type GetTopSongsReply } from "@voxmusica/types"
import ms from "ms"

import { subsonicOk, type SubsonicRequest } from "#api/open-subsonic/responses/subsonic.response"
import { getArtistTopSongs } from "#services/open-subsonic/browsing.service"

import type { FastifyPluginAsync } from "fastify"

export const GET_TOP_SONG_CACHE_KEY = `subsonic:getTopSongs:`

type GetTopSongsParams = SubsonicRequest & {
  Querystring: GetTopSongsQueryParams,
  Reply: GetTopSongsReply
}
export const getTopSongsHandler: FastifyPluginAsync = async (app) => {
  app.get<GetTopSongsParams>(
    '/getTopSongs', {
      schema: { querystring: getTopSongsSchema },
    },
    async (request, reply) => {
    const { id, artist: artistName } = request.query
    
    const cacheKey = `${GET_TOP_SONG_CACHE_KEY}:${id ?? artistName}:user:${request.subsonicUser.id}`

    // const cached = await app.cache.get(cacheKey)
    // if (cached?.item) {
    //   return subsonicOk(request.query, reply, cached.item)
    // }
    const songs = await getArtistTopSongs({
      ...(id != null ? { type: 'id', id: id!} : { type: 'name', id: artistName!}),
      userId: request.subsonicUser.id,
      count: request.query.count,
    })

    app.cache.set(cacheKey, songs, ms('1h'))
    return subsonicOk(request.query, reply, { topSongs: { song: songs} })
  })
}
