import { Worker, type WorkerOptions } from "bullmq"

import { processArtistTransliteration } from "#services/transliteration/process-artist-transliteration.service"
import { MUSICBRAINZ_LOOKUP_QUEUE } from "#workers/queues"
import { lookAlbumCover } from "./album-cover/album-cover.ts"
import { lookArtistCover } from "./artist-cover/artist-cover.ts"

import type { Logger } from "pino"


export const spawnMusicbrainLookupWorker = (logger: Logger, baseOptions: WorkerOptions) => {
  const worker = new Worker(
    MUSICBRAINZ_LOOKUP_QUEUE,
    async job => {
      logger.info(`Starting job ${job.id}`);

      switch (job.name) {
        case 'artist-cover':
          return lookArtistCover(job.data.artistId, logger)
        case 'album-cover':
          return lookAlbumCover(job.data.albumId, logger)
        case 'transliterate-artist':
          return processArtistTransliteration(job.data.artistId, logger)
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