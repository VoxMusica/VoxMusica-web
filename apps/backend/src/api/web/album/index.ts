
import albumsImageRoute from './image.routes.ts'

import type { FastifyInstance, FastifyPluginAsync } from 'fastify'

export const albumsRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.register(albumsImageRoute)
}

export default albumsRoutes
