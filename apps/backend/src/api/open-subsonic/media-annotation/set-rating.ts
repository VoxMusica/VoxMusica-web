


import { setRatingSchema, type OpenSubsonicRequest, type OpensubsonicResponse, type SetRatingQueryParams } from "@voxmusica/types"

import { GET_ALBUM_CACHE_KEY } from "#api/open-subsonic/browsing/get-album.handler"
import { GET_ARTIST_CACHE_KEY } from "#api/open-subsonic/browsing/get-artist.handler"
import { GET_TOP_SONG_CACHE_KEY } from "#api/open-subsonic/browsing/get-top-songs.handler"
import { subsonicOk } from "#api/open-subsonic/responses/subsonic.response"
import { setRating } from "#services/open-subsonic/media-annotation.service"

import type { FastifyInstance, FastifyPluginAsync } from "fastify"

type SetRatingParams = OpenSubsonicRequest & {
  Querystring: SetRatingQueryParams,
  Reply: OpensubsonicResponse
}

export const setRatingRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.get<SetRatingParams>(
    '/setRating',
    { schema: { querystring: setRatingSchema } },
    async (request, reply) => {
      const { id, rating } = request.query

      await setRating(id, request.subsonicUser.id, rating)
  
      await Promise.all([
        app.cache.delete(`${GET_ARTIST_CACHE_KEY}:${id}:user:${request.subsonicUser.id}`),
        app.cache.delete(`${GET_ALBUM_CACHE_KEY}:${id}:user:${request.subsonicUser.id}`),
        app.cache.delete(`${GET_TOP_SONG_CACHE_KEY}:${id}:user:${request.subsonicUser.id}`),
      ])

      return subsonicOk(request.query, reply, {})
    }
  )
}
