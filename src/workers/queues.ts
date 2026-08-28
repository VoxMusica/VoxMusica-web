import { Queue, type QueueOptions } from 'bullmq'

import { redis } from '#redis'
import { COVER_ART_QUEUE } from './cover-art/index.ts'
import { LONG_OPERATION_QUEUE } from './long-operations/index.ts'
import { MUSICBRAINZ_LOOKUP_QUEUE } from './mb-lookup/index.ts'
import { SCHEDULER_QUEUE } from './scheduler/index.ts'

const baseOptions: QueueOptions = { 
    connection: redis,
}

export const schedulerQueue = new Queue(SCHEDULER_QUEUE, baseOptions)
export const mbLookupQueue = new Queue(MUSICBRAINZ_LOOKUP_QUEUE, baseOptions)
export const coverArtQueue = new Queue(COVER_ART_QUEUE, baseOptions)
export const longOperationQueue = new Queue(LONG_OPERATION_QUEUE, baseOptions)
