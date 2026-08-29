
import artistsImageRoute from './image.routes.ts'

import type { FastifyInstance, FastifyPluginAsync } from 'fastify'

export const artistsRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.register(artistsImageRoute)
}

export default artistsRoutes
