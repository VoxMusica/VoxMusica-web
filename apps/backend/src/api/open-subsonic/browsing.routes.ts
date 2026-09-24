import config from "#config"
import { getAlbumHandler } from "./browsing/get-album.handler.ts"
import { getArtistHandler } from "./browsing/get-artist.handler.ts"
import { getArtistsHandler } from "./browsing/get-artists.handler.ts"
import { getIndexesHandler } from "./browsing/get-indexes.handler.ts"
import { getTopSongsHandler } from "./browsing/get-top-songs.handler.ts"
import { subsonicOk } from "./responses/subsonic.response.ts"

import type { OpenSubsonicRequest } from "@voxmusica/types"
import type { FastifyInstance, FastifyPluginAsync } from "fastify"


export const browsingRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
   app.get<OpenSubsonicRequest>('/getMusicFolders', async (request, reply) => {
    const folders =  Object.entries(config.get('library.music') ?? {})
    return subsonicOk(request.query, reply, {
      musicFolders: {
        musicFolder: folders.map(([name], id) => ({id, name}))
      }
    })
  })
  app.register(getAlbumHandler)
  app.register(getArtistHandler)
  app.register(getArtistsHandler)
  app.register(getIndexesHandler)
  app.register(getTopSongsHandler)
}


export default browsingRoutes
