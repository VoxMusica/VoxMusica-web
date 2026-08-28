import { albumId, artistId } from '#utils/ids'

import type { albumsStaging, artistsStaging } from '#db/schema'

type ArtistRow = typeof artistsStaging.$inferInsert
type AlbumRow = typeof albumsStaging.$inferInsert

const normalize = (s: string) => s.trim().toLowerCase()

export class ScanContext {
  private readonly artistsByMbid = new Map<string, ArtistRow>()
  private readonly artistsByName = new Map<string, ArtistRow>()
  private readonly albumsByKey = new Map<string, AlbumRow>()

  // returns the artist row, plus whether it was just created this call
  getOrCreateArtist(name: string, mbid?: string | null): { artist: ArtistRow; isNew: boolean } {
    if (mbid && this.artistsByMbid.has(mbid)) {
      return { artist: this.artistsByMbid.get(mbid)!, isNew: false }
    }
    const key = normalize(name)
    console.log(key, Object.keys(this.artistsByName))
    if (this.artistsByName.has(key)) {
      return { artist: this.artistsByName.get(key)!, isNew: false }
    }

    const artist: ArtistRow = {
      id: artistId(name),
      name,
      sortName: name.replace(/^(the|a|an)\s+/i, ''),
      musicbrainzArtistId: mbid ?? null,
    }
    this.artistsByName.set(key, artist)
    if (mbid) this.artistsByMbid.set(mbid, artist)
    return { artist, isNew: true }
  }

  getOrCreateAlbum(
    title: string,
    artist: ArtistRow,
    extra: { year?: number | null; mbid?: string | null },
  ): { album: AlbumRow; isNew: boolean } {
    const key = `${artistId}::${normalize(title)}`
    if (this.albumsByKey.has(key)) {
      return { album: this.albumsByKey.get(key)!, isNew: false }
    }

    const album: AlbumRow = {
      id: albumId(artist.name, title),
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
    const key = `${artistId}::__unknown__`
    if (this.albumsByKey.has(key)) {
      return { album: this.albumsByKey.get(key)!, isNew: false }
    }
    const title = '[Unknown Album]'
    const album: AlbumRow = {
      id: albumId(artist.name, title),
      title,
      sortTitle: title,
      artistId: artist.id,
      year: null,
      musicbrainzAlbumId: null,
    }
    this.albumsByKey.set(key, album)
    return { album, isNew: true }
  }
}

