// apps/backend/src/workers/long-operations/transliteration/index.ts
import { Worker } from 'bullmq'

import { redis } from '#redis'
import { processArtistTransliteration } from '#services/transliteration/process-artist-transliteration.service'

import type { Job } from 'bullmq'

interface TransliterationJobData {
  artistId: string
}

export const transliterationWorker = new Worker<TransliterationJobData>(
  'transliteration',
  async (job: Job<TransliterationJobData>) => {
    await processArtistTransliteration(job.data.artistId, job.log.bind(job) as never)
  },
  {
    connection: redis,
    concurrency: 1, // one artist at a time — avoids parallel MB calls piling up behind the library's internal queue
    limiter: {
      max: 1,
      duration: 1100, // extra safety margin on top of musicbrainz-api's own 1 req/sec throttle
    },
  }
)
