
import * as ArtistDAO from '#db/dao/artist.dao'
import { type AlbumWithExtraData, type Artist, type ArtistWithExtraData } from "#db/schema"
import { findArtistImage } from "#services/images/data-images.service"
import { formatOpenSubsonicData, replaceMusicFolderMarker } from "./formating.service.ts"
import { getAllArtistsByLetter } from "./index.service.ts"

import type { AlbumID3, ArtistWithAlbumsID3, Child, GenericIndex, Index, IndexArtist, IndexID3 } from "@voxmusica/types"



const indexArtistMapper = async (artist: Artist): Promise<IndexArtist> =>  {
  const imagePath = await findArtistImage(artist.id)
  return {
    id: artist.id,
    name: artist.name,
    ...(imagePath ? {
      artistImageUrl: `/api/artists/${artist.id}/image`
    }: {}),
  }
}

const indexID3ArtistMapper = (artist: ArtistWithExtraData): Promise<IndexArtist> =>  indexArtistMapper(artist).then( base => ({
    ...base,
    albumCount: artist.albumCount,
}))

const albumID3Mapper = (album: AlbumWithExtraData): AlbumID3 => {
  return {
    id: album.id,
    name: album.title,
    artist: '',
    artistId: album.artistId ?? '',
    coverArt: '',
    songCount: album.songCount,
    duration: album.duration,
    playCount: album.playCount ?? undefined,
    created: formatOpenSubsonicData(album.createdAt) ?? '',
    starred: formatOpenSubsonicData(album.starred) ?? '',
    year: album.year ?? undefined,
    genre: '',
    // played: formatOpenSubsonicData(album.played) ?? '',
    userRating: album.userRating ?? undefined,
    recordLabels: [],
    musicBrainzId: album.musicbrainzAlbumId ?? '',
    genres: [],
    artists: [],
    displayArtist: '',
    releaseTypes:  [],
    moods: [],
    sortName: album.sortTitle ?? '',
    originalReleaseDate: {},
    releaseDate: {},
    isCompilation: undefined,
    explicitStatus: undefined,
    discTitles: [],
  }
}

const getIndexForMapper = async <T extends IndexArtist>(mapper: (a: ArtistWithExtraData) => Promise<T>): Promise<Map<string, GenericIndex<T>>> => {
  const allArtistsByLetter = await getAllArtistsByLetter()
  const result = new Map<string, GenericIndex<T>>()
  for(const [letter, artists] of allArtistsByLetter){
    const artist = await Promise.all(artists.map(mapper))
    result.set(letter, {
      name: letter,
      artist
    })
  }
   return result
}

export const getIndex = async (): Promise<Map<string, Index>> => getIndexForMapper(indexArtistMapper)

export const getIndexID3 = async (): Promise<Map<string, IndexID3>> => getIndexForMapper(indexID3ArtistMapper)

export const getArtistID3 = async (artistId: string, userId: string): Promise<ArtistWithAlbumsID3 | undefined> => {
  if((artistId?.trim()?.length ?? 0) == 0){
    return undefined
  }
  const artist = await ArtistDAO.getArtistWithExtraInfoForUser(artistId, userId)
  if (!artist){
    return undefined
  }
  const artistAlbums = await ArtistDAO.getArtistAlbumsWithExtraDataForUser(artistId, userId)
  const mappedArtist = await indexID3ArtistMapper(artist)
  return {
    ...mappedArtist,
    album: (artistAlbums ?? []).map(albumID3Mapper)
  }
}


const mapRowToChild = (row: ArtistDAO.TopSongRow): Child => ({
  id: row.track.id,
  isDir: false,
  title: row.track.title,
  album: row.album.title,
  artist: row.artist.name,
  albumId: row.album.id,
  artistId: row.artist.id,
  track: row.track.trackNumber ?? undefined,
  discNumber: row.track.discNumber ?? undefined,
  year: row.track.year ?? undefined,
  genre: row.track.genre ?? undefined,
  duration: row.track.duration ?? undefined,
  bitRate: row.track.bitrate ?? undefined,
  samplingRate: row.track.sampleRate ?? undefined,
  channelCount: row.track.channels ?? undefined,
  suffix: row.track.codec ?? undefined,
  path: replaceMusicFolderMarker(row.track.filePath),
  size: row.track.fileSize,
  musicBrainzId: row.track.musicbrainzTrackId ?? undefined,
  created: row.track.createdAt?.toISOString(),
  playCount: row.userPlayCount ?? undefined,
  played: row.userLastPlayedAt?.toISOString(),
  starred: row.starredAt?.toISOString(),
  userRating: row.userRating ?? undefined,
  type: 'music',
  mediaType: 'song',
})
export interface GetArtistTopSongsParams{
  type: 'id' | 'name',
  id: string,
  userId: string,
  count?: number,
}
export const getArtistTopSongs = async (params: GetArtistTopSongsParams): Promise<Child[]> => {
  const rows = await ArtistDAO.getArtistTopSongs(params)
  return rows.map(mapRowToChild)
}
