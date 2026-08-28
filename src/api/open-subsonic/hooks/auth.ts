import { subsonicError, type SubsonicRequest } from '#api/open-subsonic/responses/subsonic.response'
import { verifySubsonicCredentials } from '#services/subsonic/subsonic-auth.service'
import { findUserById } from '#services/users/users.service'

import type { FastifyRequest, FastifyReply } from 'fastify'

export const subsonicAuthHook = async (request: FastifyRequest<SubsonicRequest>, reply: FastifyReply) => {
  const query = request.query as Record<string, string>
  try{
    const token = await request.jwtVerify() as {sub?: string}
    if(token.sub){
      const user = await findUserById(token.sub)
      request.subsonicUser = user
      return
    }
  }
  catch{
    //Nothing to do
  }
  
  const user = await verifySubsonicCredentials(query, request.log)
  if (!user) {
    return subsonicError(request.query, reply, 40, 'Wrong username or password')
  }

  request.subsonicUser = user
}
