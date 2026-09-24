import { subsonicOk } from "./responses/subsonic.response.ts"

import type { OpenSubsonicRequest } from "@voxmusica/types"
import type { FastifyInstance, FastifyPluginAsync } from "fastify"


export const systemRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
   app.get<OpenSubsonicRequest>('/ping', async (request, reply) => {
    return subsonicOk(request.query, reply)
  });

  app.get<OpenSubsonicRequest>('/getLicense', async (request, reply) => {
    return subsonicOk(request.query, reply, {
      license: {
        valid: true,
        email: 'admin@yourdomain.com',
        licenseExpires: '2099-01-01T00:00:00.000Z',
      },
    })
  })

  app.get<OpenSubsonicRequest>('/getOpenSubsonicExtensions', async (request, reply) => {
    return subsonicOk(request.query, reply, {
      openSubsonicExtensions: [
        { "name": "topSongsByArtistId", "versions": [1] },
        { "name": "transliteratedFields", "versions": [1] },
      ],
    })
  })
}

export default systemRoutes
