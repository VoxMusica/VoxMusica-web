import ms from "ms"

import { getUserCount } from "#services/users/users.service"

import type { FastifyInstance } from "fastify"

type infoParam = { app: FastifyInstance }
export const info = async ({ app }: infoParam) => {
  const cacheKey = 'subsonic:info:user-count'
  app.log.debug('Getting system info')
  // If there are no user in the db that means that the app is not initialized
  let userCount = (await app.cache.get<number>(cacheKey))?.item ?? 0
  if((userCount ?? 0) == 0){
    userCount = await getUserCount()
    app.cache.set(cacheKey, userCount, ms('1h'))
  }

  return { initialized : userCount > 0 }
}
