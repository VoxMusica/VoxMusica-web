// apps/backend/src/services/open-subsonic/media-retrieval.service.ts
import { eq } from 'drizzle-orm'

import { db } from '#db/index'
import { tracks } from '#db/schema'


const MIME_TYPES: Record<string, string> = {
  mp3: 'audio/mpeg',
  flac: 'audio/flac',
  ogg: 'audio/ogg',
  opus: 'audio/opus',
  m4a: 'audio/mp4',
  wav: 'audio/wav',
}

export const getContentType = (codec: string | null): string =>
  MIME_TYPES[codec?.toLowerCase() ?? ''] ?? 'application/octet-stream'

export const getTrackForStream = async (id: string) => {
  const [track] = await db.select().from(tracks).where(eq(tracks.id, id)).limit(1)
  return track ?? null
}
