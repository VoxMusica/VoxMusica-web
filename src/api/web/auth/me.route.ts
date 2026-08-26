import type { FastifyInstance, FastifyPluginAsync } from "fastify"

export const meRoute: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.get('/me', {
    onRequest: [app.authenticate]
  },
  async (request) => {
      return { user: request.user };
  })
}

export default meRoute

