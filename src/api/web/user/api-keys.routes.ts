import z from "zod"

import { createApiKey, getActiveKeysForUser, removeApiKey } from "#services/api-keys/api-keys.service"

import type { FastifyInstance, FastifyPluginAsync } from "fastify"

const createApiKeySchema = z.object({
  label: z.string().min(3, 'Username must be at least 3 characters'),
  expiresAt: z.date().optional()
})

export const apiKeysRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.addHook('onRequest', app.authenticate)

  app.get('/api-keys', async (request, reply) => {
    const { sub: userId } = request.user as { sub: string }

    const keys = await getActiveKeysForUser(userId)

    return reply.send({ keys })
  })

  // Create
  app.post('/api-keys', {
    onRequest: [app.authenticate],
    schema: { body: createApiKeySchema }
  }, async (request, reply) => {
    const { sub: userId } = request.user as { sub: string }
    const { label, expiresAt } = request.body as { label?: string, expiresAt?: Date }

    const response = await createApiKey({
      userId,
      isSystem: true,
      ...(label ? { label } : {}),
      ...(expiresAt ? { expiresAt } : {}),
    })
    return reply.code(201).send(response)
  })


  // Revoke
  app.delete('/api-keys/:id', async (request, reply) => {
    const { sub: userId } = request.user as { sub: string }
    const { id } = request.params as { id: string }

    const result = await removeApiKey({
      id, userId, isSystem: false
    })

    if (result.length === 0) {
      return reply.code(404).send({ error: 'Key not found' })
    }

    return reply.send({ ok: true })
  })

}