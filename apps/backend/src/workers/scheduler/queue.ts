import { Queue } from "bullmq"

import { BASE_QUEUE_OPTION, SCHEDULER_QUEUE } from "#workers/queues"

export const schedulerQueue = new Queue(SCHEDULER_QUEUE, BASE_QUEUE_OPTION)
