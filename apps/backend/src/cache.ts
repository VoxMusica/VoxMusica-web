import { GET_ARTIST_CACHE_KEY } from '#api/open-subsonic/browsing/get-artist.handler'
import { GET_ARTISTS_CACHE_KEY } from '#api/open-subsonic/browsing/get-artists.handler'
import { GET_INDEXES_CACHE_KEY } from '#api/open-subsonic/browsing/get-indexes.handler'
import { redis } from '#redis'

export const cache = {
  get: async <T>(key: string): Promise<T | null> => {
    const value = await redis.get(key)
    return value ? (JSON.parse(value) as T) : null
  },

  set: async (key: string, value: unknown, ttlSeconds?: number) => {
    const serialized = JSON.stringify(value)
    if (ttlSeconds) {
      await redis.set(key, serialized, 'EX', ttlSeconds)
    } else {
      await redis.set(key, serialized)
    }
  },

  del: async (key: string) => {
    await redis.del(key)
  },

  deleteByPattern: async (pattern: string) => {
    const keys: string[] = []
    let cursor = '0'
    do {
      const [nextCursor, foundKeys] = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100)
      cursor = nextCursor
      keys.push(...foundKeys)
    } while (cursor !== '0')

    if (keys.length === 0) return 0
    return redis.del(...keys)
  },
}

export const invalidateLibraryCache = async () => Promise.all([
  cache.deleteByPattern(GET_INDEXES_CACHE_KEY),
  cache.deleteByPattern('subsonic:getIndex:*'),
  cache.deleteByPattern(GET_ARTISTS_CACHE_KEY),
  cache.deleteByPattern(`${GET_ARTIST_CACHE_KEY}*`),
])
