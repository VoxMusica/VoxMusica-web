import { Worker, type WorkerOptions } from "bullmq"

import { armDailySweep, runSweep } from "./musicbrainz.ts"

import type { Logger } from "pino"

export const SCHEDULER_QUEUE = 'scheduler'

export const spawnSchedulerWorker = (logger: Logger, baseOptions: WorkerOptions) => {
  const worker = new Worker(
    SCHEDULER_QUEUE,
    async job => {
      logger.info(`Starting job ${job.id}`);

      await runSweep()
      await armDailySweep()
    },
    baseOptions
  )

  worker.on('completed', job => {
    logger.info(`Job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    logger.error(`Job ${job?.id} failed`, err);
  })
}
