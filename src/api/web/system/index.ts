import infoRoute from './info.routes.ts'

import type { FastifyInstance, FastifyPluginAsync } from 'fastify'

export const systemRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.register(infoRoute)
}

export default systemRoutes
