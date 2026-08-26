import type { FastifyInstance, FastifyPluginAsync } from 'fastify'
import { createUserAction } from '#api/web/user/create.route'

export const userRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.register(createUserAction)
}

export default userRoutes
