import { getAlbum, getAlbumUserInfo } from "#db/dao/album.dao"
import { getArtistAlbumsWithExtraDataForUser, getArtistTopSongs as getArtistTopSongsDao, getArtistWithExtraInfoForUser, type TopSongRow } from "#db/dao/artist.dao"
import { getAlbumTracks } from "#db/dao/track.dao"
import { type AlbumWithExtraData, type Artist, type ArtistWithExtraData } from "#db/schema"
import { findArtistImage } from "#services/images/data-images.service"
import { toCoverArtId } from "./cover-art.service.ts"
import { formatOpenSubsonicData, replaceMusicFolderMarker, toRelativePath } from "./formating.service.ts"
import { getAllArtistsByLetter } from "./index.service.ts"

import type { AlbumID3, AlbumID3WithSongs, ArtistWithAlbumsID3, Child, GenericIndex, Index, IndexArtist, IndexID3 } from "@voxmusica/types"

const indexArtistMapper = async (artist: Artist): Promise<IndexArtist> =>  {
  const imagePath = await findArtistImage(artist.id)
  return {
    id: artist.id,
    name: artist.name,
    ...(imagePath ? {
      artistImageUrl: `/api/artists/${artist.id}/image`,
      coverArt: `ar-${artist.id}`,
    }: {}),
  }
}

const indexID3ArtistMapper = (artist: ArtistWithExtraData): Promise<IndexArtist> =>  indexArtistMapper(artist).then( base => ({
    ...base,
    albumCount: artist.albumCount,
    userRating: artist.userRating ?? undefined,
    starred: formatOpenSubsonicData(artist.starred) ?? undefined,
}))

const albumID3Mapper = (album: AlbumWithExtraData): AlbumID3 => {
  return {
    id: album.id,
    name: album.title,
    artist: '',
    artistId: album.artistId ?? '',
    coverArt: `al-${album.id}`,
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
  const artist = await getArtistWithExtraInfoForUser(artistId, userId)
  if (!artist){
    return undefined
  }
  console.log(artist)
  const artistAlbums = await getArtistAlbumsWithExtraDataForUser(artistId, userId)
  const mappedArtist = await indexID3ArtistMapper(artist)
  return {
    ...mappedArtist,
    album: (artistAlbums ?? []).map(albumID3Mapper)
  }
}

const mapRowToChild = (row: TopSongRow): Child => ({
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
  coverArt: toCoverArtId('album', row.album.id),
})
export interface GetArtistTopSongsParams{
  type: 'id' | 'name',
  id: string,
  userId: string,
  count?: number,
}
export const getArtistTopSongs = async (params: GetArtistTopSongsParams): Promise<Child[]> => {
  const rows = await getArtistTopSongsDao(params)
  return rows.map(mapRowToChild)
}



export const getAlbumID3 = async (albumId: string, userId: string): Promise<AlbumID3WithSongs | undefined> => {
  if((albumId?.trim()?.length ?? 0) == 0){
    return undefined
  }
  const albumRow = await getAlbum({ albumId })
  if (!albumRow){
    return undefined
  }
  const albumUserInfo = await getAlbumUserInfo({ albumId, userId })
  const tracks = await getAlbumTracks({ albumId, userId })

  const songs: Child[] = tracks.map(row => ({
    id: row.id,
    isDir: false,
    title: row.title,
    album: albumRow.title,
    artist: albumRow.artist.name,
    albumId: albumRow.id,
    artistId: albumRow.artist.id,
    track: row.trackNumber ?? undefined,
    discNumber: row.discNumber ?? undefined,
    year: row.year ?? undefined,
    genre: row.genre ?? undefined,
    duration: row.duration ?? undefined,
    bitRate: row.bitrate ?? undefined,
    samplingRate: row.sampleRate ?? undefined,
    channelCount: row.channels ?? undefined,
    suffix: row.codec ?? undefined,
    path: toRelativePath(row.filePath),
    size: row.fileSize,
    coverArt: toCoverArtId('album', albumRow.id),
    musicBrainzId: row.musicbrainzTrackId ?? undefined,
    created: row.createdAt?.toISOString(),
    playCount: row.userPlayCount ?? undefined,
    played: row.userLastPlayedAt?.toISOString(),
    starred: row.starredAt?.toISOString(),
    userRating: row.userRating ?? undefined,
    type: 'music',
    mediaType: 'song',
  }))
  
  const album: AlbumID3WithSongs = {
    id: albumRow.id,
    name: albumRow.title,
    artist: albumRow.artist.name,
    artistId: albumRow.artist.id,
    coverArt: toCoverArtId('album', albumRow.id),
    songCount: albumRow.songCount,
    duration: Number(albumRow.duration ?? 0),
    created: albumRow.createdAt.toISOString(),
    year: albumRow.year ?? undefined,
    musicBrainzId: albumRow.musicbrainzAlbumId ?? undefined,
    sortName: albumRow.sortTitle ?? undefined,
    starred: albumUserInfo?.starredAt?.toISOString(),
    userRating: albumUserInfo?.userRating ?? undefined,
    song: songs,
  }

  return album
}
