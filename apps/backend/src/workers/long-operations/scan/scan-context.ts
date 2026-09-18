import { randomUUID } from 'node:crypto'

import { isBetterQuality } from '#services/scans/quality.service'
import { detectTitleScript } from '#services/transliteration/detect-title-script'
import { transliterate } from '#services/transliteration/transliterate.service'
import { albumId, artistId } from '#utils/ids'

import type { albumsStaging, artistsStaging, tracksStaging } from '#db/schema'
import type { Logger } from 'pino'

type ArtistRow = typeof artistsStaging.$inferInsert
type AlbumRow = typeof albumsStaging.$inferInsert
type TrackRow = typeof tracksStaging.$inferInsert

// a duplicate: same audio content as some kept TrackRow, but a different file
// on disk. Recorded rather than discarded so nothing just silently vanishes.
export type TrackDuplicateRow = {
  id: string
  trackId: string
  filePath: string
  fileSize: number
  fileModifiedAt: Date
  codec: string | null
  bitrate: number | null
}

// key used for dedup/merging: lowercased, and transliterated to Latin when the
// source script isn't already Latin — so "スーパーセル" and "Supercell" converge
// on the same key regardless of which one a given file happens to be tagged with
const normalizeKey = async (s: string, logger: Logger): Promise<{ key: string; isLatin: boolean }> => {
  const trimmed = s.trim().toLowerCase()
  const script = detectTitleScript(trimmed, null)
  if (script) {
    const transliterated = (await transliterate(trimmed, script, logger))?.replace(/[^\p{L}\p{N}]/gu, '')
    return { key: transliterated ?? trimmed, isLatin: false }
  }
  return { key: trimmed, isLatin: true }
}

export class ScanContext {
  private readonly artistsByMbid = new Map<string, ArtistRow>()
  private readonly artistsByKey = new Map<string, ArtistRow>()
  private readonly albumsByKey = new Map<string, AlbumRow>()

  // fingerprint+duration -> the track currently kept as the canonical copy
  private readonly tracksByFingerprint = new Map<string, TrackRow>()
  // every track we're keeping (fingerprinted or not), keyed by its tag-derived id
  private readonly keptTracks = new Map<string, TrackRow>()
  private readonly duplicates: TrackDuplicateRow[] = []

  // returns the artist row, plus whether it was just created this call.
  // NOTE: artists are no longer flushed to the DB as soon as they're created —
  // see index.ts, which drains them only after the full walk finishes. That's
  // required here: a later file in the same scan can retroactively promote or
  // add an alternate name on an artist we already returned, and that mutation
  // needs to still be visible when the row is finally inserted.
  async getOrCreateArtist(name: string, logger: Logger, mbid?: string | null): Promise<{ artist: ArtistRow; isNew: boolean }> {
    if (mbid && this.artistsByMbid.has(mbid)) {
      return { artist: this.artistsByMbid.get(mbid)!, isNew: false }
    }

    const { key, isLatin } = await normalizeKey(name, logger)
    const existing = this.artistsByKey.get(key)

    if (existing) {
      if (!isLatin && existing.name !== name) {
        existing.name = name
        existing.sortName = name.replace(/^(the|a|an)\s+/i, '')
      }
      if (mbid) this.artistsByMbid.set(mbid, existing)
      return { artist: existing, isNew: false }
    }

    const artist: ArtistRow = {
      id: artistId(key),
      name,
      sortName: name.replace(/^(the|a|an)\s+/i, ''),
      musicbrainzArtistId: mbid ?? null,
    }
    this.artistsByKey.set(key, artist)
    if (mbid) this.artistsByMbid.set(mbid, artist)
    return { artist, isNew: true }
  }

  async getOrCreateAlbum(
    title: string,
    artist: ArtistRow,
    extra: { year?: number | null; mbid?: string | null },
    logger: Logger
  ): Promise<{ album: AlbumRow; isNew: boolean }> {
    const { key: normalizedTitle } = await normalizeKey(title, logger)
    // BUG FIX: this used to be `${artistId}::...` — artistId is the imported
    // id-generator *function*, not this artist's id, so every album with a
    // matching normalized title across every artist collapsed into one row
    const key = `${artist.id}::${normalizedTitle}`
    const existing = this.albumsByKey.get(key)
    if (existing) {
      return { album: existing, isNew: false }
    }

    const album: AlbumRow = {
      id: albumId(artist.id, normalizedTitle),
      title,
      sortTitle: title.replace(/^(the|a|an)\s+/i, ''),
      artistId: artist.id,
      year: extra.year ?? null,
      musicbrainzAlbumId: extra.mbid ?? null,
    }
    this.albumsByKey.set(key, album)
    return { album, isNew: true }
  }

  getOrCreateFallbackAlbum(artist: ArtistRow): { album: AlbumRow; isNew: boolean } {
    // same bug as above: was `${artistId}::__unknown__`, identical for every
    // artist, so every artist's "[Unknown Album]" tracks landed on one album row
    const key = `${artist.id}::__unknown__`
    const existing = this.albumsByKey.get(key)
    if (existing) {
      return { album: existing, isNew: false }
    }
    const title = '[Unknown Album]'
    const album: AlbumRow = {
      id: albumId(artist.id, '__unknown__'),
      title,
      sortTitle: title,
      artistId: artist.id,
      year: null,
      musicbrainzAlbumId: null,
    }
    this.albumsByKey.set(key, album)
    return { album, isNew: true }
  }

  registerTrack(candidate: TrackRow, fingerprint: string | null, durationSec: number | null): void {
    if (fingerprint && durationSec != null) {
      const bucket = `${fingerprint}::${Math.round(durationSec)}`
      const current = this.tracksByFingerprint.get(bucket)

      if (current) {
        const candidateWins = isBetterQuality(
          { codec: candidate.codec ?? null, bitrate: candidate.bitrate ?? null, sampleRate: candidate.sampleRate ?? null, fileSize: candidate.fileSize },
          { codec: current.codec ?? null, bitrate: current.bitrate ?? null, sampleRate: current.sampleRate ?? null, fileSize: current.fileSize },
        )
        const winner = candidateWins ? candidate : current
        const loser = candidateWins ? current : candidate

        if (candidateWins) {
          this.tracksByFingerprint.set(bucket, candidate)
          this.keptTracks.delete(current.id)
          this.keptTracks.set(candidate.id, candidate)
        }
        this.duplicates.push({
          id: randomUUID(),
          trackId: winner.id,
          filePath: loser.filePath,
          fileSize: loser.fileSize,
          fileModifiedAt: loser.fileModifiedAt,
          codec: loser.codec ?? null,
          bitrate: loser.bitrate ?? null,
        })
        return
      }

      this.tracksByFingerprint.set(bucket, candidate)
    }
    this.keptTracks.set(candidate.id, candidate)
  }

  getAllArtists(): ArtistRow[] {
    return [...this.artistsByKey.values()]
  }

  getAllAlbums(): AlbumRow[] {
    return [...this.albumsByKey.values()]
  }

  getAllTracks(): TrackRow[] {
    return [...this.keptTracks.values()]
  }

  getAllDuplicates(): TrackDuplicateRow[] {
    return this.duplicates
  }
}
