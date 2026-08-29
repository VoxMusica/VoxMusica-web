import ms from "ms"

import { subsonicOk, type SubsonicRequest } from "#api/open-subsonic/responses/subsonic.response"
import { getIndex } from "#services/open-subsonic/browsing.service"
import { ignoredArticles } from "#services/open-subsonic/config"

import type { IndexArtist } from "#services/open-subsonic/browser.types"
import type { FastifyPluginAsync } from "fastify"


interface Index {
  name: string
  artist: Array<IndexArtist>
}

export const GET_INDEXES_CACHE_KEY = `subsonic:getIndexes`

export const getIndexesHandler: FastifyPluginAsync = async (app) => {
  type GetIndexesType = SubsonicRequest & { Querystring: { musicFolderId?: string, ifModifiedSince?: number } }
  app.get<GetIndexesType>('/getIndexes', async (request, reply) => {

    const cached = await app.cache.get<Index>(GET_INDEXES_CACHE_KEY)
    if (cached) {
      return subsonicOk(request.query, reply, cached.item)
    }
  
    const index = await getIndex()

    const result = {
      indexes: {
        index: [...index.values()],
        ignoredArticles: ignoredArticles.join(' ')
      }
    }
    await app.cache.set(GET_INDEXES_CACHE_KEY, result, ms('1h'))
    return subsonicOk(request.query, reply, result)
  })
}
