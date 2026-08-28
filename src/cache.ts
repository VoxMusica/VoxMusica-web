// `abstract-cache` does not ship TypeScript declarations.
// @ts-expect-error The package is untyped; its runtime API is used below.
import abstractCache from 'abstract-cache'

import { redis } from "#redis"

export const cache = abstractCache({
  useAwait: true,
  driver: {
    name: 'abstract-cache-redis',
    options: { client: redis },
  },
})

export const invalidateLibraryCache = async () => {
  const keys = await cache.keys('subsonic:getIndex:*') as string[]
  await Promise.all(keys.map((key) => cache.delete(key)))
}
