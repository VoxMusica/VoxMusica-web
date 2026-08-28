import openSubsonicRoutes from '#api/open-subsonic/index'
import webRoutes from '#api/web/index'

import type { FastifyInstance, FastifyPluginAsync } from 'fastify'


export const apiRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.register(webRoutes, { prefix: '/api' })
  app.register(openSubsonicRoutes, { prefix: '/rest' })
}
