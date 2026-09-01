import { setRatingRoutes } from "./media-annotation/set-rating.ts"

import type { FastifyInstance, FastifyPluginAsync } from "fastify"

export const mediaAnnotationRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.register(setRatingRoutes)
}

export default mediaAnnotationRoutes
