import authRoutes from "#api/web/auth/index"
import systemRoutes from "#api/web/system/index"
import userRoutes from "#api/web/user/index"
import albumsRoutes from "./album/index.ts"
import artistsRoutes from "./artists/index.ts"

import type { FastifyInstance, FastifyPluginAsync } from "fastify"

/**
 * Encapsulates the routes
 * @param {FastifyInstance} app  Encapsulated Fastify Instance
 */
export const webRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.register(albumsRoutes, { prefix: '/albums' })
  app.register(artistsRoutes, { prefix: '/artists' })
  app.register(authRoutes, { prefix: '/auth' })
  app.register(systemRoutes, { prefix: '/system' })
  app.register(userRoutes, { prefix: '/user' })
}

export default webRoutes
