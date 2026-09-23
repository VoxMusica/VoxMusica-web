import { Redis } from 'ioredis'

import config from '#config'

export const redis = config.get('cache.enabled')
  ? new Redis({
  host: config.get('cache.redis.host'),
  port: config.get('cache.redis.port'),
  maxRetriesPerRequest: null,
  })
  : {
    get: () => null,
    set: () => {},
    del: () => {},
    scan: () => [null, []],
  }
