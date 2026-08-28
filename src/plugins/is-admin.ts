import fp from 'fastify-plugin'

import { info } from '#services/system/info.service'

import type { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify'

const isAdminPlugin: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.decorate('isAdmin', async (request: FastifyRequest, reply: FastifyReply) => {
    const { initialized } = await info({ app })

    if (!initialized) {
      return
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

export default fp(isAdminPlugin)
