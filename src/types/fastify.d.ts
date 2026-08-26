import 'fastify'
import { User } from '#services/users/users.service'

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { sub: string; username: string; roles: string[] }
    user: { sub: string; username: string; roles: string[] }
  }
}

declare module 'fastify' {
  interface FastifyRequest {
    subsonicUser?: User
  }
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
    isAdmin: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
    isAdminOrBootstrap: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
  }
}
