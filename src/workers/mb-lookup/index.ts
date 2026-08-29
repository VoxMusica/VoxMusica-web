import { Worker, type WorkerOptions } from "bullmq"

import { MUSICBRAINZ_LOOKUP_QUEUE } from "#workers/queues"
import { lookArtistCover } from "./artist-cover.ts"

import type { Logger } from "pino"


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
    logger.info(`Job ${job.id} completed`)
  });

  worker.on('failed', (job, err) => {
    logger.error({ err }, `Job ${job?.id} failed`)
  })
}