import { createReadStream, statSync } from "node:fs"


import { streamSchema, type OpenSubsonicRequest, type StreamQueryParams } from "@voxmusica/types"

import { subsonicError } from "#api/open-subsonic/responses/subsonic.response"
import { toRealPath } from "#services/open-subsonic/formating.service"
import { getContentType, getTrackForStream } from "#services/open-subsonic/media-retrieval.service"

import type { FastifyInstance, FastifyPluginAsync } from "fastify"

type StreamParams = OpenSubsonicRequest & {
  Querystring: StreamQueryParams
}


export const streamRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.get<StreamParams>(
    '/stream',
    { schema: { querystring: streamSchema } },
    async (request, reply) => {
      const { id, format } = request.query

      if (format != null && format !== 'raw') {
        request.log.warn({ format }, 'Transcoding requested but not yet supported')
      }

      const track = await getTrackForStream(id)
      if (track == null) {
        return subsonicError(request.query, reply, 70, 'Track not found')
      }

      const trackFilePath = toRealPath(track.filePath)
      console.log(trackFilePath)
      let stat
      try {
        stat = statSync(trackFilePath)
      } catch {
        request.log.error({ trackId: id, filePath: trackFilePath }, 'Track file missing on disk')
        return subsonicError(request.query, reply, 70, 'Track file not found')
      }

      const contentType = getContentType(track.codec)
      const range = request.headers.range

      reply.header('Accept-Ranges', 'bytes')
      reply.header('Content-Type', contentType)

      if (range != null) {
        const match = /bytes=(\d*)-(\d*)/.exec(range)
        const start = match?.[1] !== '' ? Number(match?.[1]) : 0
        const end = match?.[2] !== '' ? Number(match?.[2]) : stat.size - 1

        if (Number.isNaN(start) || Number.isNaN(end) || start > end || end >= stat.size) {
          reply.header('Content-Range', `bytes */${stat.size}`)
          return reply.code(416).send()
        }

        reply.code(206)
        reply.header('Content-Range', `bytes ${start}-${end}/${stat.size}`)
        reply.header('Content-Length', end - start + 1)

        return reply.send(createReadStream(trackFilePath, { start, end }))
      }

      reply.header('Content-Length', stat.size)
      return reply.send(createReadStream(trackFilePath))
    }
  )
}
