import { createReadStream } from "node:fs"



import { coverArtSchema, type CoverArtQueryParams, type OpenSubsonicRequest } from "@voxmusica/types"

import { subsonicError } from "#api/open-subsonic/responses/subsonic.response"
import { findAlbumImage, findArtistImage, MIME_TYPES } from "#services/images/data-images.service"
import { parseCoverArtId } from "#services/open-subsonic/cover-art.service"

import type { FastifyInstance, FastifyPluginAsync } from "fastify"

type GetCoverArtParams = OpenSubsonicRequest & {
  Querystring: CoverArtQueryParams
}


export const coverArtRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.get<GetCoverArtParams>(
    '/getCoverArt',
    { schema: { querystring: coverArtSchema } },
    async (request, reply) => {
      const { id } = request.query

      const parsed = parseCoverArtId(id)
      if (parsed == null) {
        return subsonicError(request.query, reply, 70, 'Invalid cover art id')
      }

      const image = await (parsed.type === 'album' ? findAlbumImage(parsed.entityId) : findArtistImage(parsed.entityId))

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
    }
  )
}
