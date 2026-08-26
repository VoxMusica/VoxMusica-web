import type { FastifyInstance, FastifyPluginAsync } from "fastify"
import { subsonicOk } from "./responses/subsonic.response.ts"


export const systemRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
   app.get('/ping', async (_, reply) => {
    return subsonicOk(reply)
  });

  app.get('/getLicense', async (_, reply) => {
    return subsonicOk(reply, {
      license: {
        valid: true,
        email: 'admin@yourdomain.com',
        licenseExpires: '2099-01-01T00:00:00.000Z',
      },
    })
  })
}

export default systemRoutes
