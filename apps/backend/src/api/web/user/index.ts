import { apiKeysRoutes } from '#api/web/user/api-keys.routes'
import { createUserRoute } from '#api/web/user/create.routes'

import type { FastifyInstance, FastifyPluginAsync } from 'fastify'

export const userRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.register(createUserRoute)
  app.register(apiKeysRoutes)
}

export default userRoutes
