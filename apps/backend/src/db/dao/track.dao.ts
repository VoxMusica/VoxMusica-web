import { and, asc, count, eq, getTableColumns, max } from "drizzle-orm"

import { db } from "#db/index"
import { favorites, playEvents, ratings, tracks } from "#db/schema"

export interface GetAlbumTracksParams {
  albumId: string
  userId: string
}

export const getAlbumTracks = ({ albumId, userId }: GetAlbumTracksParams) => {
  const userPlayStats = db.$with('user_play_stats').as(
    db
      .select({
        trackId: playEvents.trackId,
        userPlayCount: count(playEvents.id).as('user_play_count'),
        userLastPlayedAt: max(playEvents.playedAt).as('user_last_played_at'),
      })
      .from(playEvents)
      .where(and(eq(playEvents.userId, userId), eq(playEvents.counted, true)))
      .groupBy(playEvents.trackId)
  )
  return db
    .with(userPlayStats)
    .select({
      ...getTableColumns(tracks),
      userPlayCount: userPlayStats.userPlayCount,
      userLastPlayedAt: userPlayStats.userLastPlayedAt,
      starredAt: favorites.starredAt,
      userRating: ratings.rating,
    })
    .from(tracks)
    .leftJoin(userPlayStats, eq(userPlayStats.trackId, tracks.id))
    .leftJoin(
      favorites,
      and(
        eq(favorites.itemId, tracks.id),
        eq(favorites.itemType, 'track'),
        eq(favorites.userId, userId)
      )
    )
    .leftJoin(
      ratings,
      and(
        eq(ratings.itemId, tracks.id),
        eq(ratings.itemType, 'track'),
        eq(ratings.userId, userId)
      )
    )
    .where(eq(tracks.albumId, albumId))
    .orderBy(asc(tracks.discNumber), asc(tracks.trackNumber))
}
