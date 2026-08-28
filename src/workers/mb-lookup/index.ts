import { Worker, type WorkerOptions } from "bullmq"

import { lookArtistCover } from "./artist-cover.ts"

import type { Logger } from "pino"

export const MUSICBRAINZ_LOOKUP_QUEUE = 'mb-lookup'

export const spawnMusicbrainLookupWorker = (logger: Logger, baseOptions: WorkerOptions) => {
  const worker = new Worker(
    MUSICBRAINZ_LOOKUP_QUEUE,
    async job => {
      logger.info(`Starting job ${job.id}`);

      switch (job.name) {
        case 'artist-cover':
          return lookArtistCover(job.data.artistId, logger)
        default:
          throw new Error(`Unknown job type: ${job.name}`)
      }
    },
    {
      ...baseOptions,
      limiter: { max: 1, duration: 1000 },
    }
  )

  worker.on('completed', job => {
    logger.info(`Job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    logger.error(`Job ${job?.id} failed`, err);
  })
}