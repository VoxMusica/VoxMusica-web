import { verifySubsonicCredentials } from '#services/subsonic/subsonic-auth.service'
import type { FastifyRequest, FastifyReply } from 'fastify'
import { subsonicError } from '../responses/subsonic.response.ts'

export async function subsonicAuthHook(request: FastifyRequest, reply: FastifyReply) {
  const query = request.query as Record<string, string>;
  const user = await verifySubsonicCredentials(query);

  if (!user) {
    return subsonicError(reply, 40, 'Wrong username or password');
  }

  request.subsonicUser = user;
}
