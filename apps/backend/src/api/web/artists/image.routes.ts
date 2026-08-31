import { createReadStream } from "node:fs"

import { getImageSchema, type GetImageParams } from "@voxmusica/types"

import { findArtistImage, MIME_TYPES } from "#services/images/data-images.service"

import type { FastifyInstance, FastifyPluginAsync, FastifyRequest } from "fastify"


export const artistsImageRoute: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.get('/:id/image', {
    schema: {params: getImageSchema}
  }, async (request: FastifyRequest<{Params: GetImageParams}>, reply) => {
    const { id } = request.params

    const image = await findArtistImage(id)

    if (!image) {
      return reply.code(404).send({ error: 'Image not found' })
    }
    const mimeType = MIME_TYPES[image.extension]
    if(!mimeType){
      return reply.code(404).send({ error: 'Image not found' })
    }

    reply.type(mimeType)
    reply.header('Cache-Control', 'public, max-age=86400')

    return reply.send(createReadStream(image.filePath))
  })
}

export default artistsImageRoute
