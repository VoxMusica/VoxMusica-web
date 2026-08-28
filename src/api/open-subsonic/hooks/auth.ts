import { subsonicError, type SubsonicRequest } from '#api/open-subsonic/responses/subsonic.response'
import { verifySubsonicCredentials } from '#services/subsonic/subsonic-auth.service'

import type { FastifyRequest, FastifyReply } from 'fastify'

export const subsonicAuthHook = async (request: FastifyRequest<SubsonicRequest>, reply: FastifyReply) => {
  const query = request.query as Record<string, string>;
  const user = await verifySubsonicCredentials(query);

  if (!user) {
    return subsonicError(request.query, reply, 40, 'Wrong username or password');
  }

  request.subsonicUser = user;
}
