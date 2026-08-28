import config from "#config"
import { getArtistsHandler } from "./browsing/get-artists.handler.ts"
import { getIndexesHandler } from "./browsing/get-indexes.handler.ts"
import { subsonicOk, type SubsonicRequest } from "./responses/subsonic.response.ts"

import type { FastifyInstance, FastifyPluginAsync } from "fastify"


export const browsingRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
   app.get<SubsonicRequest>('/getMusicFolders', async (request, reply) => {
    const folders =  Object.entries(config.get('library.music') ?? {})
    return subsonicOk(request.query, reply, {
      musicFolders: {
        musicFolder: folders.map(([name], id) => ({id, name}))
      }
    })
  })
  app.register(getIndexesHandler)
  app.register(getArtistsHandler)
}


export default browsingRoutes
