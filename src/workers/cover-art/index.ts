import { Worker, type WorkerOptions } from "bullmq"

import { lookAlbumCover } from "./album.ts"

import type { Logger } from "pino"

export const COVER_ART_QUEUE = 'cover-art'

export const spawnCoverArtWorker = (logger: Logger, baseOptions: WorkerOptions) => {
  const worker = new Worker(
    COVER_ART_QUEUE,
    async job => {
      logger.info(`Starting job ${job.id}`);

      switch (job.name) {
        case 'album':
          return lookAlbumCover(job.data.albumId, logger)
        default:
          throw new Error(`Unknown job type: ${job.name}`)
      }
    },
    {
      ...baseOptions,
      concurrency: 4,
    }
  )

  worker.on('completed', job => {
    logger.info(`Job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    logger.error(`Job ${job?.id} failed`, err);
  })
}