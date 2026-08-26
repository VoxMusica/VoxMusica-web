import { redis } from '#redis'
import { Queue } from 'bullmq';

export const longOperationQueue = new Queue('long-operations', {
  connection: redis,
})
