import { createScan, getCurrentScan } from "#services/scans/scans.service"
import { longOperationQueue } from "#workers/long-operations/queue"
import { subsonicOk } from './responses/subsonic.response.ts'

import type { OpenSubsonicRequest } from "@voxmusica/types"
import type { FastifyInstance, FastifyPluginAsync } from "fastify"

export const scanRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.get<OpenSubsonicRequest>('/startScan', async (request, reply) => {
    const { scan, existing } = await createScan()
    if(existing){
      request.log.info('Scan already running')
    }
    else{
      await longOperationQueue.add('startScan', {}, { removeOnComplete: 5, removeOnFail: 5})
    }
    return subsonicOk(request.query, reply, {
      scanStatus: {
        scanning: scan != null,
        count: scan?.processedFiles ?? 0
      }
    })
  })

  app.get<OpenSubsonicRequest>('/getScanStatus', async (request, reply) => {
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
