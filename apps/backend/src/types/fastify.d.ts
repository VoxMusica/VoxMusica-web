import 'fastify'
import { User } from '#services/users/users.service'

declare module '@fastify/jwt' {
  interface FastifyJWT {
    user: { sub: string; username: string; roles: string[], apiKeyId: string }
  }
}

declare module '@fastify/caching' {
  interface AbstractCacheCompliantObject {
    delete(key: string | { id: string; segment: string }): Promise<void>
    delete(
      key: string | { id: string; segment: string },
      callback: (error: unknown) => void
    ): void
  }
}

declare module 'fastify' {
  interface FastifyRequest {
    subsonicUser?: User,
  }
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
    isAdmin: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
    isAdminOrBootstrap: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
  }
}
