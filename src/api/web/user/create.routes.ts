import { z } from 'zod'

import { apiOk } from "#api/web/responses/api.response"
import { createUser } from "#services/users/users.service"

import type { FastifyInstance, FastifyPluginAsync, FastifyReply } from "fastify"

const countMatchingCategories = (value: string) => {
  const categories = [/[a-z]/, /[A-Z]/, /[0-9]/, /[^a-zA-Z0-9]/]
  return categories.filter((regex) => regex.test(value)).length
}

const createAdminAccountBodySchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z
    .string()
    .min(12, 'Password must be at least 12 characters')
    .refine((value) => countMatchingCategories(value) >= 3, {
      message: 'Password must include at least 3 of: lowercase, uppercase, number, special character'
    })
})

interface CreateAdminAccountBody {
  username: string
  password: string
}



export const createUserRoute: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.post<{ Body: CreateAdminAccountBody}>('', {
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
