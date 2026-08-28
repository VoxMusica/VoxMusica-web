import { Worker, type WorkerOptions } from "bullmq"

import { startScan } from "#workers/long-operations/scan/index"

import type { Logger } from "pino"

export const LONG_OPERATION_QUEUE = 'long-operations'

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
    console.log(`Job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} failed`, err);
  })
}