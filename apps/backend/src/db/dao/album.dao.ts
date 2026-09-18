import { and, count, eq, getTableColumns, sum, sql } from 'drizzle-orm'

import { albumTransliterations, artistTransliterations } from '#db/aliases/scripts'
import { db } from '#db/index'
import { userPreferences } from '#db/schema'
import { albumMusicbrainz, albums, artists, favorites, ratings, tracks } from '#db/schemas/music'



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
  userId?: string
}

export const getAlbum = ({
  albumId,
  userId
}: GetAlbumParams) => db
  .select({
    ...getTableColumns(albums),
    title: sql<string>`coalesce(${albumTransliterations.value}, ${albums.title})`,
    artist: {
      ...getTableColumns(artists),
      name: sql<string>`coalesce(${artistTransliterations.value}, ${artists.name})`,
    },
    songCount: count(tracks.id),
    duration: sum(tracks.duration),
  })
  .from(albums)
  .innerJoin(artists, eq(albums.artistId, artists.id))
  .leftJoin(tracks, eq(tracks.albumId, albums.id))
  .leftJoin(userPreferences, eq(userPreferences.userId, userId ?? ''))
  .leftJoin(
    albumTransliterations,
    and(
      eq(albumTransliterations.itemType, 'album'),
      eq(albumTransliterations.itemId, albums.id),
      eq(albumTransliterations.script, userPreferences.script)
    )
  )
  .leftJoin(
    artistTransliterations,
    and(
      eq(artistTransliterations.itemType, 'artist'),
      eq(artistTransliterations.itemId, artists.id),
      eq(artistTransliterations.script, userPreferences.script)
    )
  )
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