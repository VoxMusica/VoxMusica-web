import { setRatingRoutes } from "./media-annotation/set-rating.handler.ts"
import { starRoutes } from "./media-annotation/star.handler.ts"

import type { FastifyInstance, FastifyPluginAsync } from "fastify"

export const mediaAnnotationRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.register(setRatingRoutes)
  app.register(starRoutes)
}

export default mediaAnnotationRoutes
