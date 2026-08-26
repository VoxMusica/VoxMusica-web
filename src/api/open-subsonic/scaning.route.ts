import type { FastifyInstance, FastifyPluginAsync } from "fastify"
import { subsonicOk } from './responses/subsonic.response.ts'
import { longOperationQueue } from "#queue"
import { createScan, getCurrentScan } from "#services/scans/scans.service"

export const scanRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.get('/startScan', async (_, reply) => {
    const scan = await createScan()
    longOperationQueue.add('startScan', {})
    return subsonicOk(reply, {
      scanStatus: {
        scanning: scan != null,
        count: scan?.processedFiles ?? 0
      }
    })
  })

  app.get('/getScanStatus', async (_, reply) => {
    const scan = await getCurrentScan()
    return subsonicOk(reply, {
      scanStatus: {
        scanning: scan != null,
        count: scan?.processedFiles ?? 0
      }
    })
  })
}

export default scanRoutes
