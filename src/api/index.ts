import type { FastifyInstance, FastifyPluginAsync } from 'fastify'

import webRoutes from '#api/web/index'
import openSubsonicRoutes from '#api/open-subsonic/index'

export const apiRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.register(webRoutes, { prefix: '/api' })
  app.register(openSubsonicRoutes, { prefix: '/rest' })
}
