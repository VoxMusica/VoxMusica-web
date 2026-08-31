import { Queue } from "bullmq"

import { BASE_QUEUE_OPTION, MUSICBRAINZ_LOOKUP_QUEUE } from "#workers/queues"

export const mbLookupQueue = new Queue(MUSICBRAINZ_LOOKUP_QUEUE, BASE_QUEUE_OPTION)
