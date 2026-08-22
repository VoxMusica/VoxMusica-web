import type { FastifyInstance } from "fastify"
import { authRoutes } from "./auth/index.ts"

/**
 * Encapsulates the routes
 * @param {FastifyInstance} fastify  Encapsulated Fastify Instance
 */
export async function routes (fastify: FastifyInstance) {
  fastify.register(authRoutes, { prefix: '/auth' });
}
