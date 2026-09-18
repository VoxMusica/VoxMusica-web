import { existsSync } from 'node:fs'
import path from 'node:path'

import { invalidateLibraryCache } from '#cache'
import config from '#config'
import { getAlbum, updateAlbumMusicbrainzLastFailedAttempt, updateAlbumMusicbrainzLastFetched } from '#db/dao/album.dao'
import { fetchAndSave } from '#services/images/download-images.service'
import { mbApi } from '#workers/musicbrainz'

import type { Album } from '#db/schema'
import type { IRelation } from 'musicbrainz-api'
import type { Logger } from 'pino'



export const lookAlbumCover = async (albumId: string, logger: Logger) => {
  logger.info(`Looking for album ${albumId}`)
  const album = await getAlbum({ albumId })

  if (album == null) {
    logger.error(`Album with id '${albumId}' not found`)
    return
  }
  if (album.musicbrainzAlbumId == null) {
    logger.info(`Album with id '${albumId}' has no musicbrainz id. Will skip`)
    return
  }

  const destPath = path.join(config.get('data.dir'), 'albums', `${albumId}.jpg`)

  if (existsSync(destPath)) {
    logger.info(`cover already exists for album ${album.title} (id: ${albumId})`)
    return
  }
  const musicBrainzId = album.musicbrainzAlbumId
  const relations = await getMusicBrainzRelations(musicBrainzId, logger)
  const imageUrl = await findFallbackImageUrl(album, album.artist?.name, relations, logger)

  if (imageUrl == null) {
    logger.info(`No image found for album '${album.title}'`)
    return
  }
  logger.info(`Image url for album '${album.title}' : '${imageUrl.url}'`)
  try {
    const saved = await fetchAndSave(imageUrl.url, destPath)
    await updateAlbumMusicbrainzLastFetched(albumId, saved != null, imageUrl.source)
    await invalidateLibraryCache()
  } catch (err) {
    await updateAlbumMusicbrainzLastFailedAttempt(albumId)
    throw err // rethrow so BullMQ applies its own retry/backoff
  }
}

const getMusicBrainzRelations = async (id: string, logger: Logger) => {
  try {
    const result = await mbApi.lookup('release', id, ['url-rels'])
    return result.relations
  } catch (err) {
    logger.error(err)
    return undefined
  }
}

const findFallbackImageUrl = async (
  album: Album,
  artistName: string | undefined,
  relations: IRelation[] | undefined,
  logger: Logger
) => {
  const sources = [
    { name: 'coverartarchive', fn: () => findCoverArtArchiveImage(album.musicbrainzAlbumId ?? undefined, logger) },
    { name: 'deezer', fn: () => findDeezerImage(artistName, album.title) },
    { name: 'theaudiodb', fn: () => findAudioDbImage(album.musicbrainzAlbumId ?? undefined, logger) },
    { name: 'musicbrainz', fn: () => findMusicBrainzImage(relations, logger) },
    { name: 'fanart.tv', fn: () => findFanartImage(album.musicbrainzAlbumId ?? undefined, logger) },
    { name: 'wikidata', fn: () => findWikidataImage(relations, logger) },
  ]

  for (const source of sources) {
    try {
      const url = await source.fn()
      if (url) return { url, source: source.name }
    } catch (error) {
      logger.error({ error }, `${source.name} lookup failed for ${album.id}: ${album.title}`)
    }
  }

  return null
}

// Cover Art Archive — canonical source, keyed by MusicBrainz release ID, no API key needed
const findCoverArtArchiveImage = async (musicBrainzId: string | undefined, logger: Logger) => {
  logger.debug('Searching on Cover Art Archive')
  if (musicBrainzId == null) {
    return null
  }

  const response = await fetch(`https://coverartarchive.org/release/${musicBrainzId}/front`, {
    redirect: 'follow',
  })

  if (response.status === 404) return null
  if (!response.ok) throw new Error(`Cover Art Archive error: ${response.status}`)

  return response.url
}

// MusicBrainz images
const findMusicBrainzImage = (relations: IRelation[] | undefined, logger: Logger) => {
  logger.debug('Searching on musicbrainz')
  const imageRel = relations?.find(
    (rel) => rel.type === 'image' && rel['target-type'] === 'url'
  )
  return imageRel?.url?.resource ?? null
}

// Fanart images
const findFanartImage = async (musicBrainzId: string | undefined, logger: Logger) => {
  logger.debug('Searching on fanart')
  if (musicBrainzId == null) {
    return null
  }
  const apiKey = config.get('metadatasources.fanart.apiKey')?.trim()
  if ((apiKey?.length ?? 0) == 0) return null

  const response = await fetch(
    `https://webservice.fanart.tv/v3/music/albums/${musicBrainzId}?api_key=${apiKey}`
  )

  if (response.status === 404) return null
  if (!response.ok) throw new Error(`Fanart.tv error: ${response.status}`)

  const data = await response.json() as {
    albums?: Record<string, { albumcover?: Array<{ url: string }> }>
  }
  return data.albums?.[musicBrainzId]?.albumcover?.[0]?.url ?? null
}

// Wikidata images

const extractWikidataId = (relations: IRelation[] | undefined) => {
  const wikidataRel = relations?.find(
    (rel) => rel.type === 'wikidata' && rel['target-type'] === 'url'
  )
  if (!wikidataRel?.url?.resource) return null

  const match = wikidataRel.url.resource.match(/\/(Q\d+)$/)
  return match ? match[1] : null
}

const findWikidataImage = async (relations: IRelation[] | undefined, logger: Logger) => {
  logger.debug('Searching on wikidata')
  const qid = extractWikidataId(relations)
  if (!qid) return null

  const response = await fetch(
    `https://www.wikidata.org/wiki/Special:EntityData/${qid}.json`
  )

  if (!response.ok) return null

  const data = await response.json() as {
    entities?: Record<string, {
      claims?: {
        P18?: Array<{
          mainsnak?: {
            datavalue?: {
              value: string
            }
          }
        }>
      }
    }>
  }
  const claims = data.entities?.[qid]?.claims
  const filename = claims?.P18?.[0]?.mainsnak?.datavalue?.value

  if (!filename) return null

  const encodedFilename = encodeURIComponent(filename.replaceAll(' ', '_'))
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodedFilename}`
}

// AudioDB
const findAudioDbImage = async (musicBrainzId: string | undefined, logger: Logger) => {
  logger.debug('Searching on audioDb')
  if (musicBrainzId == null) {
    return null
  }
  const apiKey = config.get('metadatasources.audioDb.apiKey')?.trim()
  if ((apiKey?.length ?? 0) == 0) return null

  const response = await fetch(
    `https://theaudiodb.com/api/v1/json/${apiKey}/album-mb.php?i=${musicBrainzId}`
  )

  if (!response.ok) return null

  const data = await response.json() as {
    album?: Array<{
      strAlbumThumb: string
    }>
  }
  return data.album?.[0]?.strAlbumThumb ?? null
}

// Deezer
const findDeezerImage = async (artistName: string | undefined, albumTitle: string) => {
  const query = artistName != null
    ? `artist:"${artistName}" album:"${albumTitle}"`
    : albumTitle

  const response = await fetch(
    `https://api.deezer.com/search/album?q=${encodeURIComponent(query)}&limit=1`
  )

  if (!response.ok) return null

  const data = await response.json() as { data?: Array<{
    cover_xl?: string
    cover_big?: string
    cover_medium?: string
  }>}
  const result = data.data?.[0]

  return result?.cover_xl ?? result?.cover_big ?? result?.cover_medium ?? null
}
