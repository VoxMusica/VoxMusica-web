/**
 * usage: `yarn trigger <queue-name> <job-name> <json payload>`
 */

import { longOperationQueue } from "#workers/long-operations/queue"
import { mbLookupQueue } from "#workers/mb-lookup/queue"
import { LONG_OPERATION_QUEUE, MUSICBRAINZ_LOOKUP_QUEUE, SCHEDULER_QUEUE } from "#workers/queues"
import { schedulerQueue } from "#workers/scheduler/queue"

const QUEUES = {
  [MUSICBRAINZ_LOOKUP_QUEUE]: mbLookupQueue,
  [SCHEDULER_QUEUE]: schedulerQueue,
  [LONG_OPERATION_QUEUE]: longOperationQueue,
} as const

const [, , queueName, jobName, dataArg] = process.argv

const queue = QUEUES[queueName as keyof typeof QUEUES]
if (!queue) {
  console.error(`unknown queue "${queueName}". options: ${Object.keys(QUEUES).join(', ')}`)
  process.exit(1)
}

if(jobName == null){
  console.error(`unknown job ${jobName} for queue "${queueName}". options: ${Object.keys(QUEUES).join(', ')}`)
  process.exit(1)
}
const data = dataArg ? JSON.parse(dataArg) : {}

const job = await queue.add(jobName, data)
console.log(`enqueued ${queueName}/${jobName} → job ${job.id}`)
process.exit(0)
