import { join } from 'node:path'

import config from '#config'

import type { Logger } from 'pino'
 
 
type AcoustIdResponse = {
  status: string
  results?: { recordings?: { id: string }[] }[]
}
 
export const lookupAcoustId = async (
  fingerprint: string,
  duration: number,
  logger: Logger
): Promise<string | null> => {
  const apiKey = config.get('acoustid.apiKey')
  if ((apiKey ?? '').trim().length == 0) return null
 
  const params = new URLSearchParams({
    client: apiKey,
    meta: 'recordings',
    duration: String(Math.round(duration)),
    fingerprint,
  })
 
  try {
    const res = await fetch(join(config.get('acoustid.endpoint'), params.toString()))
    if (!res.ok) {
      logger.warn(`AcoustID lookup failed with status ${res.status}`)
      return null
    }
    const data = await res.json() as AcoustIdResponse
    return data.results?.[0]?.recordings?.[0]?.id ?? null
  } catch (err) {
    logger.warn(err, 'AcoustID lookup errored')
    return null
  }
}
 