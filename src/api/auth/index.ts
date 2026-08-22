import type { FastifyInstance, FastifyPluginAsync } from 'fastify'
import { registerLoginRoute } from '#api/auth/login'

export const authRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  registerLoginRoute(fastify)
}
