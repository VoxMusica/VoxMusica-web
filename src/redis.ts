import IORedis from 'ioredis'

import config from '#config'

export const redis = new IORedis({
  host: config.get('cache.redis.host'),
  port: config.get('cache.redis.port'),
  maxRetriesPerRequest: null,
})
