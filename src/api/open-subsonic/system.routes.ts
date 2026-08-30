import { subsonicOk, type SubsonicRequest } from "./responses/subsonic.response.ts"

import type { FastifyInstance, FastifyPluginAsync } from "fastify"


export const systemRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
   app.get<SubsonicRequest>('/ping', async (request, reply) => {
    return subsonicOk(request.query, reply)
  });

  app.get<SubsonicRequest>('/getLicense', async (request, reply) => {
    return subsonicOk(request.query, reply, {
      license: {
        valid: true,
        email: 'admin@yourdomain.com',
        licenseExpires: '2099-01-01T00:00:00.000Z',
      },
    })
  })
}

export default systemRoutes
