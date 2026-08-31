import { Queue } from "bullmq"

import { BASE_QUEUE_OPTION, COVER_ART_QUEUE } from "#workers/queues"

export const coverArtQueue = new Queue(COVER_ART_QUEUE, BASE_QUEUE_OPTION)
