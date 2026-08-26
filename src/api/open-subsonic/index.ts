import type { FastifyInstance, FastifyPluginAsync } from 'fastify'
import { subsonicAuthHook } from './hooks/auth.ts'
import systemRoutes from '#api/open-subsonic/system.route'
import browsingRoutes from './browsing.route.ts'
import scanRoutes from './scaning.route.ts'

export const openSubsonicRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.addHook('preHandler', subsonicAuthHook)
  app.register(systemRoutes)
  app.register(browsingRoutes)
  app.register(scanRoutes)
}

export default openSubsonicRoutes
