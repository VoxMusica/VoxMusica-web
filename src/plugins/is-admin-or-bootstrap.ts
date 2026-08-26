import fp from 'fastify-plugin'
import type { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify'
import { info } from '#services/system/info.service'

const isAdminOrBootstrapPlugin: FastifyPluginAsync = async (app) => {
  app.decorate('isAdminOrBootstrap', async (request: FastifyRequest, reply: FastifyReply) => {
    const infoData = await info({ app } )

    if (!infoData.initialized) {
      return // bootstrap case — no users exist yet, allow unauthenticated creation
    }

    try {
      await request.jwtVerify()
    } catch {
      return reply.code(401).send({ error: 'Unauthorized' })
    }

    if (!request.user.roles.includes('admin')) {
      return reply.code(403).send({ error: 'Forbidden — admin role required' })
    }
  })
}

export default fp(isAdminOrBootstrapPlugin)