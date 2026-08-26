import config from '#config'
import { redis } from '#redis'
import { startScan } from '#workers/start-scan'
import { Worker } from 'bullmq'
import { join } from 'node:path'

import pino from 'pino'

export const logger = pino({
  level: config.get('logging.level')
})
pino.destination(join(config.get('logging.dir'), 'worker.log'))

const worker = new Worker(
  'long-operations',
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
    connection: redis,
    concurrency: 5,
  }
);

worker.on('completed', job => {
  console.log(`Job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed`, err);
})