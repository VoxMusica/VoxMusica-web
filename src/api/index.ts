import openSubsonicRoutes from '#api/open-subsonic/index'
import webRoutes from '#api/web/index'

import type { FastifyInstance, FastifyPluginAsync } from 'fastify'


export const apiRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.addHook('onSend', (_, reply, __, done) => {
    reply.header("X-Clacks-Overhead", "GNU Terry Pratchett")
    done()
  })
  app.register(webRoutes, { prefix: '/api' })
  app.register(openSubsonicRoutes, { prefix: '/rest' })
}
