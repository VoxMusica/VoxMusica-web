import { createScan, getCurrentScan } from "#services/scans/scans.service"
import { longOperationQueue } from "#workers/queues"
import { subsonicOk, type SubsonicRequest } from './responses/subsonic.response.ts'

import type { FastifyInstance, FastifyPluginAsync } from "fastify"

export const scanRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.get<SubsonicRequest>('/startScan', async (request, reply) => {
    const scan = await createScan()
    longOperationQueue.add('startScan', {})
    return subsonicOk(request.query, reply, {
      scanStatus: {
        scanning: scan != null,
        count: scan?.processedFiles ?? 0
      }
    })
  })

  app.get<SubsonicRequest>('/getScanStatus', async (request, reply) => {
    const scan = await getCurrentScan()
    return subsonicOk(request.query, reply, {
      scanStatus: {
        scanning: scan != null,
        count: scan?.processedFiles ?? 0
      }
    })
  })
}

export default scanRoutes
