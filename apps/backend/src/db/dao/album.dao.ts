import { and, count, eq, getTableColumns, sum } from 'drizzle-orm'

import { db } from '#db/index'
import { albumMusicbrainz, albums, artists, favorites, ratings, tracks } from '#db/schemas/music'

import type { AlbumID3 } from '@voxmusica/types'



export const updateAlbumMusicbrainzLastFetched = async (
  albumId: string,
  success: boolean,
  source: string
) => {
  await db
    .insert(albumMusicbrainz)
    .values({
      albumId,
      status: success ? 'matched' : 'not_found',
      lastFetchedAt: new Date(),
      source,
    })
    .onConflictDoUpdate({
      target: albumMusicbrainz.albumId,
      set: {
        status: success ? 'matched' : 'not_found',
        lastFetchedAt: new Date(),
        source,
      },
    })
}

export interface GetAlbumParams {
  albumId: string
}

export const getAlbum =  ({
  albumId
}: GetAlbumParams) => db
    .select({
      ...getTableColumns(albums),
      artist: artists,
      songCount: count(tracks.id),
      duration: sum(tracks.duration),
    })
    .from(albums)
    .innerJoin(artists, eq(albums.artistId, artists.id))
    .leftJoin(tracks, eq(tracks.albumId, albums.id))
    .where(eq(albums.id, albumId))
    .groupBy(albums.id, artists.id)
    .limit(1)
    .then(v => v.at(0))
    
export interface GetAlbumUserInfoParams extends GetAlbumParams {
  userId: string
}

export const getAlbumUserInfo = async ({
  albumId,
  userId
}: GetAlbumUserInfoParams) => db
    .select({
      starredAt: favorites.starredAt,
      userRating: ratings.rating,
    })
    .from(albums)
    .leftJoin(
      favorites,
      and(
        eq(favorites.itemId, albums.id),
        eq(favorites.itemType, 'album'),
        eq(favorites.userId, userId)
      )
    )
    .leftJoin(
      ratings,
      and(
        eq(ratings.itemId, albums.id),
        eq(ratings.itemType, 'album'),
        eq(ratings.userId, userId)
      )
    )
    .where(eq(albums.id, albumId))
    .limit(1)
    .then(v => v.at(0))

export const updateAlbumMusicbrainzLastFailedAttempt = async (albumId: string) => {
  await db
    .insert(albumMusicbrainz)
    .values({
      albumId,
      status: 'error',
      lastAttemptAt: new Date(),
    })
    .onConflictDoUpdate({
      target: albumMusicbrainz.albumId,
      set: {
        status: 'error',
        lastAttemptAt: new Date(),
      },
    })
}