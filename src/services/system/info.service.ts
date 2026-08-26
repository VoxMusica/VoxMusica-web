import { CACHE_KEYS } from "#cache"
import { getUserCount } from "#services/users/users.service"
import type { FastifyInstance } from "fastify"

type infoParam = { app: FastifyInstance }
export const info = async ({ app }: infoParam) => {
  app.log.debug('Getting system info')
  // If there are no user in the db that means that the app is not initialized
  let userCount = (await app.cache.get<number>(CACHE_KEYS.SYSTEM.USER_COUNT))?.item ?? 0
  if((userCount ?? 0) == 0){
    userCount = await getUserCount()
    app.cache.set(CACHE_KEYS.SYSTEM.USER_COUNT, userCount, 3600)
  }

  return { initialized : userCount > 0 }
}
