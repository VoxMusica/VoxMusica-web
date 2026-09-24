import { apiOk } from "#api/web/responses/api.response"
import { info } from "#services/system/info.service"

import type { FastifyInstance, FastifyPluginAsync } from "fastify"

export const infoRoute: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.get('/info', async (_, reply) => {
    const data = await info({ app } )
    apiOk(reply, data)
  })
}

export default infoRoute
