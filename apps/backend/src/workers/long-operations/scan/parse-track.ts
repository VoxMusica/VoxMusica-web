import { stat } from 'node:fs/promises'
import { promisify } from 'node:util'

// fpcalc does not provide TypeScript declarations.
// @ts-expect-error Missing declaration file for the untyped package.
import fpcalcCb from 'fpcalc'
import { parseFile } from 'music-metadata'

import { toRelativePath } from '#services/open-subsonic/formating.service'
import { lookupAcoustId } from '#services/scans/acoustic-id.service'
import { trackId } from '#utils/ids'

import type { tracksStaging } from '#db/schema'
import type { ScanContext } from './scan-context.ts'
import type { Logger } from 'pino'

const fpcalc = promisify(fpcalcCb)

export const parseTrackFile = async (
  filePath: string,
  ctx: ScanContext,
  logger: Logger
): Promise<void> => {
  try {
    const [stats, metadata] = await Promise.all([
      stat(filePath),
      parseFile(filePath, { duration: true, skipCovers: false }),
    ])
    const { common, format } = metadata

    const title = common.title ?? filePath.split('/').pop()!.replace(/\.[^.]+$/, '')
    const artistName = common.artist ?? common.albumartist ?? 'Unknown Artist'

    const { artist } = await ctx.getOrCreateArtist(
      artistName,
      logger,
      common.musicbrainz_artistid?.[0] ?? null,
    )

    const { album } = common.album
      ? await ctx.getOrCreateAlbum(common.album, artist, {
          year: common.year ?? null,
          mbid: common.musicbrainz_albumid ?? null,
        }, logger)
      : ctx.getOrCreateFallbackAlbum(artist)

    const durationSec = format.duration ? Math.round(format.duration) : null

    let fingerprint: string | null = null
    let musicbrainzTrackId = common.musicbrainz_trackid ?? null

    try {
      const fp = await fpcalc(filePath)
      fingerprint = fp.fingerprint

      if (fingerprint && !musicbrainzTrackId && process.env.ACOUSTID_API_KEY) {
        musicbrainzTrackId = await lookupAcoustId(fingerprint, fp.duration, logger)
      }
    } catch (fpErr) {
      // fingerprinting is best-effort — a missing fpcalc binary or a weird
      // file shouldn't sink the whole track. Without a fingerprint this file
      // just won't be checked for audio-content duplicates.
      logger.warn(fpErr, `Failed to fingerprint ${filePath}`)
    }

    const candidate: typeof tracksStaging.$inferInsert = {
      id: trackId(artist.name, album.title, title, common.track?.no ?? undefined),
      filePath: toRelativePath(filePath),
      fileSize: stats.size,
      fileModifiedAt: stats.mtime,
      title,
      trackNumber: common.track?.no ?? null,
      discNumber: common.disk?.no ?? null,
      year: common.year ?? null,
      genre: common.genre?.[0] ?? null,
      duration: durationSec,
      codec: format.codec ?? null,
      bitrate: format.bitrate ? Math.round(format.bitrate) : null,
      sampleRate: format.sampleRate ?? null,
      channels: format.numberOfChannels ?? null,
      musicbrainzTrackId,
      fingerprint,
      albumId: album.id,
      artistId: artist.id,
    }

    // hands off to ScanContext, which resolves audio-content duplicates by
    // quality and decides whether this file becomes the canonical copy
    ctx.registerTrack(candidate, fingerprint, durationSec)
  } catch (err) {
    console.warn(`Failed to parse ${filePath}:`, (err as Error).message)
  }
}
