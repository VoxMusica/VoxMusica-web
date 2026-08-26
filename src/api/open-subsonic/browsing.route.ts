import type { FastifyInstance, FastifyPluginAsync } from "fastify"
import { subsonicOk } from "./responses/subsonic.response.ts"
import config from "#config"
import { getIndexesHandler } from "./browsing/get-indexes.handler.ts"


export const browsingRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
   app.get('/getMusicFolders', async (_, reply) => {
    const folders =  Object.entries(config.get('library.music') ?? {})
    return subsonicOk(reply, {
      musicFolders: {
        musicFolder: folders.map(([name], id) => ({id, name}))
      }
    })
  })
  app.register(getIndexesHandler)
}

export default browsingRoutes
