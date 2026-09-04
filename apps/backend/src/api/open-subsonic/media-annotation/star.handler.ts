


import { setRatingSchema, starSchema, type OpenSubsonicRequest, type OpensubsonicResponse, type StarQueryParams } from "@voxmusica/types"

import { GET_ALBUM_CACHE_KEY } from "#api/open-subsonic/browsing/get-album.handler"
import { GET_ARTIST_CACHE_KEY } from "#api/open-subsonic/browsing/get-artist.handler"
import { GET_TOP_SONG_CACHE_KEY } from "#api/open-subsonic/browsing/get-top-songs.handler"
import { subsonicError, subsonicOk } from "#api/open-subsonic/responses/subsonic.response"
import { addStar, removeStar } from "#services/open-subsonic/media-annotation.service"

import type { FastifyInstance, FastifyPluginAsync } from "fastify"

type StarParams = OpenSubsonicRequest & {
  Querystring: StarQueryParams,
  Reply: OpensubsonicResponse
}

export const starRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.get<StarParams>(
    '/star',
    { schema: { querystring: starSchema } },
    async (request, reply) => {
      const { id, albumId, artistId } = request.query
      const idToUse = id ?? albumId ?? artistId
      if(idToUse == null) {
        return subsonicError(request.query, reply, 400, "star.error")
      }
      await addStar(idToUse, request.subsonicUser.id)
  
      await Promise.all([
        app.cache.delete(`${GET_ARTIST_CACHE_KEY}:${idToUse}:user:${request.subsonicUser.id}`),
        app.cache.delete(`${GET_ALBUM_CACHE_KEY}:${idToUse}:user:${request.subsonicUser.id}`),
        app.cache.delete(`${GET_TOP_SONG_CACHE_KEY}:${idToUse}:user:${request.subsonicUser.id}`),
      ])

      return subsonicOk(request.query, reply, {})
    }
  )
  app.get<StarParams>(
    '/unstar',
    { schema: { querystring: setRatingSchema } },
    async (request, reply) => {
      const { id, albumId, artistId } = request.query
      const idToUse = id ?? albumId ?? artistId
      if(idToUse == null) {
        return subsonicError(request.query, reply, 400, "star.error")
      }
      await removeStar(idToUse, request.subsonicUser.id)
  
      await Promise.all([
        app.cache.delete(`${GET_ARTIST_CACHE_KEY}:${idToUse}:user:${request.subsonicUser.id}`),
        app.cache.delete(`${GET_ALBUM_CACHE_KEY}:${idToUse}:user:${request.subsonicUser.id}`),
        app.cache.delete(`${GET_TOP_SONG_CACHE_KEY}:${idToUse}:user:${request.subsonicUser.id}`),
      ])

      return subsonicOk(request.query, reply, {})
    }
  )
}
