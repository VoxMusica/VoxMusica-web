import systemRoutes from '#api/open-subsonic/system.route'
import browsingRoutes from './browsing.route.ts'
import { subsonicAuthHook } from './hooks/auth.ts'
import scanRoutes from './scaning.route.ts'

import type { FastifyInstance, FastifyPluginAsync } from 'fastify'

export const openSubsonicRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.addHook('preHandler', subsonicAuthHook)
  app.register(systemRoutes)
  app.register(browsingRoutes)
  app.register(scanRoutes)
}

export default openSubsonicRoutes
