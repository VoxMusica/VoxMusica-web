import { createAdminAccountBodySchema, type CreateAdminBody } from '@voxmusica/types'

import { apiOk } from "#api/web/responses/api.response"
import { createUser } from "#services/users/users.service"

import type { FastifyInstance, FastifyPluginAsync, FastifyReply } from "fastify"


export const createUserRoute: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.post<{ Body: CreateAdminBody}>('', {
    onRequest: [app.isAdminOrBootstrap],
    schema: { body: createAdminAccountBodySchema }
  }, async (request, reply: FastifyReply) => {
    await createUser({
      username: request.body.username,
      password: request.body.password,
      roles: [ 'admin' ]
    })

    return apiOk(reply, {})
  })
}

export default createUserRoute
