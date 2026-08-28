import { subsonicError, type SubsonicRequest } from '#api/open-subsonic/responses/subsonic.response'
import { verifySubsonicCredentials } from '#services/subsonic/subsonic-auth.service'

import type { FastifyRequest, FastifyReply } from 'fastify'

export const subsonicAuthHook = async (request: FastifyRequest<SubsonicRequest>, reply: FastifyReply) => {
  const query = request.query as Record<string, string>
  request.log.info('Securing /rest endpoint')
  const user = await verifySubsonicCredentials(query, request.log)

  if (!user) {
    return subsonicError(request.query, reply, 40, 'Wrong username or password');
  }

  request.subsonicUser = user;
}
