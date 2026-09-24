import { Worker, type WorkerOptions } from "bullmq"

import { startScan } from "#workers/long-operations/scan/index"
import { LONG_OPERATION_QUEUE } from "#workers/queues"

import type { Logger } from "pino"


export const spawnLongOperationWorker = (logger: Logger, baseOptions: WorkerOptions) => {
  const worker = new Worker(
    LONG_OPERATION_QUEUE,
    async job => {
      logger.info(`Starting job ${job.id}`);

      switch (job.name) {
        case 'startScan':
          return startScan(job, logger)
        default:
          throw new Error(`Unknown job type: ${job.name}`)
      }
    },
    {
      ...baseOptions,
      concurrency: 5,
    }
  )

  worker.on('completed', job => {
    logger.info(`Job ${job.id} completed`)
  });

  worker.on('failed', (job, err) => {
    logger.error({ err }, `Job ${job?.id} failed`)
  })
}