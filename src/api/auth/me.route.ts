import type { FastifyInstance } from "fastify"

export const registerLoginRoute = (fastify: FastifyInstance) => {
  fastify.get('/me', {
    onRequest: [fastify.authenticate]
  },
  async (request) => {
      return { user: request.user };
  })
}
