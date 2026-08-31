import systemRoutes from '#api/open-subsonic/system.routes'
import browsingRoutes from './browsing.routes.ts'
import { subsonicAuthHook } from './hooks/auth.ts'
import { subsonicErrorHandler } from './hooks/subsonic-error-handler.ts'
import mediaRetrievalRoutes from './media-retrieval.routes.ts'
import scanRoutes from './scaning.routes.ts'

import type { FastifyInstance, FastifyPluginAsync } from 'fastify'


export const openSubsonicRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.addHook('preHandler', subsonicAuthHook)
  app.setErrorHandler(subsonicErrorHandler)
  
  app.register(browsingRoutes)
  app.register(mediaRetrievalRoutes)
  app.register(scanRoutes)
  app.register(systemRoutes)
}

export default openSubsonicRoutes
