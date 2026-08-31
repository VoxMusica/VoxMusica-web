import { Queue } from "bullmq"

import { BASE_QUEUE_OPTION, LONG_OPERATION_QUEUE } from "#workers/queues"

export const longOperationQueue = new Queue(LONG_OPERATION_QUEUE, BASE_QUEUE_OPTION)
