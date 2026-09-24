import { eq } from 'drizzle-orm'

import { upsertTransliteration } from '#db/dao/transliteration.dao'
import { db } from '#db/index'
import { albums, artists, tracks } from '#db/schemas/music'
import { artistScriptScoreDetails, artistScriptScores, type ArtistScriptScoreDetail } from '#db/schemas/scripts'
import { mbApi } from '#workers/musicbrainz'
import { detectTitleScript, type Script } from './detect-title-script.ts'
import { scoreTitleScript } from './score-title.ts'
import { needsTransliteration } from './script-signals.ts'
import { transliterate } from './transliterate.service.ts'

import type { Logger } from 'pino'

const COUNTRY_WEIGHT = 200
const COUNTRY_TO_SCRIPT: Record<string, Script> = {
  JP: 'japanese', CN: 'chinese', TW: 'chinese', HK: 'chinese', KR: 'korean',
}

const script2source = (script:string) => {
  if(script === 'japanese') return 'kuroshiro'
  if(script === 'chinese') return 'pinyin'
  return 'any-ascii'
}

export const processArtistTransliteration = async (artistId: string, logger: Logger) => {
  const [artist] = await db.select().from(artists).where(eq(artists.id, artistId)).limit(1)
  if (artist == null) {
    logger.warn(`Artist ${artistId} not found, skipping transliteration`)
    return
  }

  const [artistTracks, artistAlbums] = await Promise.all([
    db.select().from(tracks).where(eq(tracks.artistId, artistId)),
    db.select().from(albums).where(eq(albums.artistId, artistId)),
  ])

  // 1. score the artist's dominant script (single MusicBrainz call, internally rate-limited)
  const totals: Record<Script, number> = { japanese: 0, chinese: 0, korean: 0 }

  if (artist.musicbrainzArtistId != null) {
    try {
      const mbArtist = await mbApi.lookup('artist', artist.musicbrainzArtistId)
      const scriptFromCountry = mbArtist.country != null ? COUNTRY_TO_SCRIPT[mbArtist.country] : undefined
      if (scriptFromCountry != null) totals[scriptFromCountry] += COUNTRY_WEIGHT
    } catch (error) {
      logger.error({ error }, `MusicBrainz country lookup failed for artist ${artistId}`)
    }
  }

  const titleItems = [
    ...artistTracks.map((t) => ({ type: 'track' as const, id: t.id, title: t.title })),
    ...artistAlbums.map((a) => ({ type: 'album' as const, id: a.id, title: a.title })),
  ]

  const details: (ArtistScriptScoreDetail)[] = []

  for (const item of titleItems) {
    const scored = scoreTitleScript(item.title)
    totals.japanese += scored.japanese
    totals.chinese += scored.chinese
    totals.korean += scored.korean
    details.push({
      id: crypto.randomUUID(),
      artistId,
      itemType: item.type,
      itemId: item.id,
      title: item.title,
      ...scored,
    })
  }

  const sum = totals.japanese + totals.chinese + totals.korean
  const scoreEntries = sum > 0
    ? (Object.entries(totals) as [Script, number][])
        .filter(([, value]) => value > 0)
        .map(([script, value]) => ({ script, score: Math.round((value / sum) * 100) }))
        .sort((a, b) => b.score - a.score)
    : []

  const dominantScript: Script | null = scoreEntries[0]?.script ?? null

  await db
    .insert(artistScriptScores)
    .values({ artistId, scores: scoreEntries, computedAt: new Date() })
    .onConflictDoUpdate({ target: artistScriptScores.artistId, set: { scores: scoreEntries, computedAt: new Date() } })

  await db.delete(artistScriptScoreDetails).where(eq(artistScriptScoreDetails.artistId, artistId))
  if (details.length > 0) {
    await db.insert(artistScriptScoreDetails).values(details)
  }

  // step 2 — artist name
  if (needsTransliteration(artist.name) && dominantScript != null) {
    const romanized = await transliterate(artist.name, dominantScript, logger)
    if (romanized != null) {
      await upsertTransliteration({
        itemType: 'artist',
        itemId: artistId,
        script: dominantScript,
        originalText: artist.name,
        romanizedText: romanized,
        source: script2source(dominantScript),
      })
    }
  }

  // step 3 — tracks
  for (const track of artistTracks) {
    if (!needsTransliteration(track.title)) continue
    const script = detectTitleScript(track.title, dominantScript)
    const romanized = await transliterate(track.title, script, logger)
    if (romanized != null && script != null) {
      await upsertTransliteration({
        itemType: 'track',
        itemId: track.id,
        script,
        originalText: track.title,
        romanizedText: romanized,
        source: script2source(script),
      })
    }
  }

  for (const album of artistAlbums) {
    if (!needsTransliteration(album.title)) continue
    const script = detectTitleScript(album.title, dominantScript)
    const romanized = await transliterate(album.title, script, logger)
    if (romanized != null && script != null) {
      await upsertTransliteration({
        itemType: 'album',
        itemId: album.id,
        script,
        originalText: album.title,
        romanizedText: romanized,
        source: script2source(script),
      })
    }
  }

  logger.info(`Transliteration complete for artist ${artist.name} (${artistId})`)
}
