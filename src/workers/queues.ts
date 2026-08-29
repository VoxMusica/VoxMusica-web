import { type QueueOptions } from 'bullmq'

import { redis } from '#redis'

export const BASE_QUEUE_OPTION: QueueOptions = { 
    connection: redis,
}


export const SCHEDULER_QUEUE = 'scheduler'
export const MUSICBRAINZ_LOOKUP_QUEUE = 'mb-lookup'
export const LONG_OPERATION_QUEUE = 'long-operations'
export const COVER_ART_QUEUE = 'cover-art'
