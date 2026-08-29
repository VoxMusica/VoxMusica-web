import { Worker, type WorkerOptions } from "bullmq"

import { SCHEDULER_QUEUE } from "#workers/queues"
import { armDailySweep, runSweep } from "./musicbrainz.ts"

import type { Logger } from "pino"


export const spawnSchedulerWorker = (logger: Logger, baseOptions: WorkerOptions) => {
  const worker = new Worker(
    SCHEDULER_QUEUE,
    async job => {
      logger.info(`Starting job ${job.id}`);

      await runSweep({force: job.data?.force})
      await armDailySweep()
    },
    baseOptions
  )

  worker.on('completed', job => {
    logger.info(`Job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    logger.error({err}, `Job ${job?.id} failed`)
  })
}
