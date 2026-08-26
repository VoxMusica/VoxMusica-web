import type { FastifyPluginAsync } from "fastify"
import { subsonicError } from "../responses/subsonic.response.ts"

export const getIndexesHandler: FastifyPluginAsync = async (app) => {
  app.get<{ Params: { musicFolderId?: number, ifModifiedSince?: number } }>('/getIndexes', async (_, reply) => {
    return subsonicError(reply, 0, 'Not yet implemented')
  })
}
