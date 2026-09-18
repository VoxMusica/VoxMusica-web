import { existsSync } from 'node:fs'
import path from "node:path"

import { invalidateLibraryCache } from '#cache'
import config from "#config"
import { getArtist, updateArtistMusicbrainzLastFailedAttempt, updateArtistMusicbrainzLastFetched } from "#db/dao/artist.dao"
import { fetchAndSave } from '#services/images/download-images.service'
import { mbApi } from "#workers/musicbrainz"

import type { Artist } from '#db/schema'
import type { IRelation } from 'musicbrainz-api'
import type { Logger } from "pino"

export const lookArtistCover = async (artistId: string, logger: Logger) => {
  logger.info(`Looking for artist ${artistId}`)
  const artist = await getArtist(artistId, true)

  if(artist == null){
    logger.error(`Artist with id '${artistId}' not found`)
    return
  }
  if(artist.artists?.musicbrainzArtistId == null){
    logger.info(`Artist with id '${artistId}' has not musicbrainz id. Will skip`)
    return
  }

  const destPath = path.join(config.get('data.dir'), 'artists', `${artistId}.jpg`)

  if(existsSync(destPath)){
    logger.info(`cover already exists for artist ${artist.artists.name} (id: ${artistId})`);
    return
  }
  const musicBrainzId = artist.artists.musicbrainzArtistId
  const relations = await getMusicBrainzRelations(musicBrainzId, logger)
  const imageUrl = await findFallbackImageUrl(artist.artists, relations, logger)
  //?.filter(v => v. type == 'image').map(v => v.url?.resource)?.at(0)

  if(imageUrl == null){
    logger.info(`No image on musicbrainz for artist '${artist.artists?.name}'`)
    return
  }
  logger.info(`Image url for artist '${artist.artists?.name}' : '${imageUrl.url}'`)
  try {
    const saved = await fetchAndSave(imageUrl.url, destPath)
    await updateArtistMusicbrainzLastFetched(artistId, saved != null, imageUrl.source)
    await invalidateLibraryCache()
  } catch (err) {
    await updateArtistMusicbrainzLastFailedAttempt(artistId)
    throw err // rethrow so BullMQ applies its own retry/backoff
  }
}

const getMusicBrainzRelations = async (id: string, logger: Logger) => {
  try{
    const result = await mbApi.lookup('artist', id, ['url-rels'])
    return result.relations
  }
  catch(err){
    logger.error(err)
    return undefined
  }
}

const findFallbackImageUrl = async (artist: Artist, relations:  IRelation[] | undefined, logger: Logger) => {
  const sources = [
    { name: 'deezer', fn: () => findDeezerImage(artist.name)},
    { name: 'theaudiodb', fn: () => findAudioDbImage(artist.musicbrainzArtistId ?? undefined, logger) },
    { name: 'musicbrainz', fn: () => findMusicBrainzImage(relations, logger) },
    { name: 'fanart.tv', fn: () => findFanartImage(artist.musicbrainzArtistId ?? undefined, logger) },
    { name: 'wikidata', fn: () => findWikidataImage(relations, logger) },
  ]

  for (const source of sources) {
    try {
      const url = await source.fn()
      if (url) return { url, source: source.name }
    } catch (error) {
     logger.error({error}, `${source.name} lookup failed for ${artist.id}: ${artist.name}`)
    }
  }

  return null
}

// MusicBrainz images
const findMusicBrainzImage = (relations:  IRelation[] | undefined, logger: Logger) => {
  logger.debug(`Searching on musicbrainz`)
  const imageRel = relations?.find(
    (rel) => rel.type === 'image' && rel['target-type'] === 'url',
  )
  return imageRel?.url?.resource ?? null
}

// Fanart images
const findFanartImage = async (musicBrainzId: string | undefined, logger: Logger) => {
  logger.debug(`Searching on fanart`)
  if(musicBrainzId == null){
    return null
  }
  const apiKey = config.get('metadatasources.fanart.apiKey')?.trim()
  if ((apiKey?.length ?? 0) == 0) return null

  const response = await fetch(
    `https://webservice.fanart.tv/v3/music/${musicBrainzId}?api_key=${apiKey}`,
  )

  if (response.status === 404) return null
  if (!response.ok) throw new Error(`Fanart.tv error: ${response.status}`)

  const data = await response.json() as { artistthumb?: Array<{url: string}>}
  return data.artistthumb?.[0]?.url ?? null
}

// Wikidata images

const extractWikidataId = (relations: IRelation[] | undefined) => {
  const wikidataRel = relations?.find(
    (rel) => rel.type === 'wikidata' && rel['target-type'] === 'url',
  )
  if (!wikidataRel?.url?.resource) return null

  const match = wikidataRel.url.resource.match(/\/(Q\d+)$/)
  return match ? match[1] : null
}

const findWikidataImage = async (relations: IRelation[] | undefined, logger: Logger) => {
  logger.debug(`Searching on wikidata`)
  const qid = extractWikidataId(relations)
  if (!qid) return null

  const response = await fetch(
    `https://www.wikidata.org/wiki/Special:EntityData/${qid}.json`,
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
  logger.debug(`Searching on audioDb`)
  if(musicBrainzId == null){
    return null
  }
  const apiKey = config.get('metadatasources.audioDb.apiKey')?.trim()
  if ((apiKey?.length ?? 0) == 0) return null

  const response = await fetch(
    `https://theaudiodb.com/api/v1/json/${apiKey}/artist-mb.php?i=${musicBrainzId}`,
  )

  if (!response.ok) return null

  const data = await response.json() as {
    artists?: Array<{
      strArtistThumb: string
    }>
  }
  return data.artists?.[0]?.strArtistThumb ?? null
}

//Deezer
const findDeezerImage = async (artistName: string) => {
  const response = await fetch(
    `https://api.deezer.com/search/artist?q=${encodeURIComponent(artistName)}&limit=1`,
  )

  if (!response.ok) return null

  const data = await response.json() as { data?: Array<{
    picture_xl?: string
    picture_big?: string
    picture_medium?: string
  }>}
  const artist = data.data?.[0]

  return artist?.picture_xl ?? artist?.picture_big ?? artist?.picture_medium ?? null
}
