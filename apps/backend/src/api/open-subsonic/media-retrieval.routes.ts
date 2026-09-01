import { coverArtRoutes } from "./media-retrieval/get-cover-art.ts"
import { streamRoutes } from "./media-retrieval/stream.ts"

import type { FastifyInstance, FastifyPluginAsync } from "fastify"

export const mediaRetrievalRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.register(streamRoutes)
  app.register(coverArtRoutes)
}

export default mediaRetrievalRoutes
