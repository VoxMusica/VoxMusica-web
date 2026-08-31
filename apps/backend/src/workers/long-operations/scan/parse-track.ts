import { stat } from 'node:fs/promises'

import { parseFile } from 'music-metadata'

import { toRelativePath } from '#services/open-subsonic/formating.service'
import { trackId } from '#utils/ids'

import type { albumsStaging, artistsStaging, tracksStaging } from '#db/schema'
import type { ScanContext } from './scan-context.ts'



type ParseResult = {
  track: typeof tracksStaging.$inferInsert
  newArtist?: typeof artistsStaging.$inferInsert | undefined
  newAlbum?: typeof albumsStaging.$inferInsert | undefined
}

export const parseTrackFile = async (
  filePath: string,
  ctx: ScanContext,
): Promise<ParseResult | null> => {
  try {
    const [stats, metadata] = await Promise.all([
      stat(filePath),
      parseFile(filePath, { duration: true, skipCovers: false }),
    ])
    const { common, format } = metadata

    const title = common.title ?? filePath.split('/').pop()!.replace(/\.[^.]+$/, '')
    const artistName = common.artist ?? common.albumartist ?? 'Unknown Artist'

    // sync from here to the end of the map writes — no awaits, so no interleaving risk
    const { artist, isNew: artistIsNew } = ctx.getOrCreateArtist(
      artistName,
      common.musicbrainz_artistid?.[0] ?? null,
    )

    const { album, isNew: albumIsNew } = common.album
      ? ctx.getOrCreateAlbum(common.album, artist, {
          year: common.year ?? null,
          mbid: common.musicbrainz_albumid ?? null,
        })
      : ctx.getOrCreateFallbackAlbum(artist)

    const albumId = album.id
    const newAlbum = albumIsNew ? album : undefined
    return {
      track: {
        id: trackId(artist.name, album.title, title, common.track?.no ?? undefined),
        filePath: toRelativePath(filePath),
        fileSize: stats.size,
        fileModifiedAt: stats.mtime,
        title,
        trackNumber: common.track?.no ?? null,
        discNumber: common.disk?.no ?? null,
        year: common.year ?? null,
        genre: common.genre?.[0] ?? null,
        duration: format.duration ? Math.round(format.duration) : null,
        codec: format.codec ?? null,
        bitrate: format.bitrate ? Math.round(format.bitrate) : null,
        sampleRate: format.sampleRate ?? null,
        channels: format.numberOfChannels ?? null,
        musicbrainzTrackId: common.musicbrainz_trackid ?? null,
        albumId,
        artistId: artist.id,
      },
      newArtist: artistIsNew ? artist : undefined,
      newAlbum,
    }
  } catch (err) {
    console.warn(`Failed to parse ${filePath}:`, (err as Error).message)
    return null
  }
}
