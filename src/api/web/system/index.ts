import infoRoute from './info.route.ts'

import type { FastifyInstance, FastifyPluginAsync } from 'fastify'

export const systemRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.register(infoRoute)
}

export default systemRoutes
