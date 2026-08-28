import { existsSync } from 'node:fs'
import path from "node:path"

import config from "#config"
import { getArtist } from "#services/music/artists.service"
import { mbApi } from "#workers/musicbrainz"

import type { Logger } from "pino"


// const fetchAndSave = async (url: string, destPath: string) => {
//   const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } })

//   if (response.status === 404) return null
//   if (!response.ok) throw new Error(`unexpected status ${response.status} fetching ${url}`)

//   const buffer = Buffer.from(await response.arrayBuffer())
//   await mkdir(path.dirname(destPath), { recursive: true })
//   await writeFile(destPath, buffer)
//   return destPath
// }

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

  try{
    const result = await mbApi.lookup('artist', artist.artists?.musicbrainzArtistId, ['url-rels'])
    console.log(result)
  }
  catch(err){
    console.error(err)
  }
  // try {
  //   const saved = await fetchAndSave(url, destPath)
  //   await db.update(albumMusicbrainz)
  //     .set({ lastFetchedAt: new Date(), lastAttemptAt: new Date(), status: saved ? 'matched' : 'not_found' })
  //     .where(eq(albumMusicbrainz.albumId, albumId))
  // } catch (err) {
  //   await db.update(albumMusicbrainz)
  //     .set({ lastAttemptAt: new Date(), status: 'error' })
  //     .where(eq(albumMusicbrainz.albumId, albumId))
  //   throw err // rethrow so BullMQ applies its own retry/backoff
  // }
}
