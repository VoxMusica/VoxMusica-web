import type { FastifyInstance, FastifyPluginAsync } from 'fastify'
import infoRoute from './info.route.ts'

export const systemRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.register(infoRoute)
}

export default systemRoutes
