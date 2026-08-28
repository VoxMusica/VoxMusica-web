import { join } from 'node:path'

import { type WorkerOptions } from 'bullmq'
import pino from 'pino'

import config from '#config'
import logger from '#logger'
import { redis } from '#redis'
import { spawnCoverArtWorker } from '#workers/cover-art/index'
import { spawnLongOperationWorker } from '#workers/long-operations/index'
import { spawnMusicbrainLookupWorker } from '#workers/mb-lookup/index'


export const workerLogger = logger({
  level: config.get('logging.level')
})
pino.destination(join(config.get('logging.dir'), 'worker.log'))

const baseOptions: WorkerOptions = { 
    connection: redis,
    concurrency: 1
}

spawnLongOperationWorker(workerLogger, baseOptions)
spawnMusicbrainLookupWorker(workerLogger, baseOptions)
spawnCoverArtWorker(workerLogger, baseOptions)
