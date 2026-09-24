import { and, count, desc, eq, getTableColumns, max, sql, sum } from "drizzle-orm"

import { albumTransliterations, artistTransliterations, trackTransliterations } from '#db/aliases/scripts'
import { db } from "#db/index"
import { albums, artistMusicbrainz, artists, favorites, playEvents, ratings, tracks, transliterations, userPreferences, type AlbumWithExtraData } from "#db/schema"

import type { SCRIPTS } from "@voxmusica/types"

type Artist = typeof artists.$inferSelect
type ArtistMusicbrainz = typeof artistMusicbrainz.$inferSelect

type ArtistWithMBStatus = {
  artists: Artist
  artist_musicbrainz: ArtistMusicbrainz | null
}


export const getAllArtists = async () =>
  db.select().from(artists)
export const getAllArtistsWithAlbumCount = async (userId: string) =>
  db.select({
    ...getTableColumns(artists),
    name: sql<string>`coalesce(${artistTransliterations.value}, ${artists.name})`,
    albumCount: count(albums.id),
  })
    .from(artists)
    .leftJoin(albums, eq(albums.artistId, artists.id))
    .leftJoin(userPreferences, eq(userPreferences.userId, userId))
    .leftJoin(
      artistTransliterations,
      and(
        eq(artistTransliterations.itemType, 'artist'),
        eq(artistTransliterations.itemId, artists.id),
        eq(artistTransliterations.script, userPreferences.script)
      )
    )
    .groupBy(artists.id)

type GetArtist = {
  (id: string, withMBStatus: true): Promise<ArtistWithMBStatus | undefined>
  (id: string, withMBStatus?: false): Promise<Artist | undefined>
}
export const getArtist: GetArtist = (async (id: string, withMBStatus: boolean = false) => {
  const query = db.select().from(artists).where(eq(artists.id, id))
  if(withMBStatus){
    return query.leftJoin(
      artistMusicbrainz,
      eq(artists.id, artistMusicbrainz.artistId)
    ).then(r => r.at(0))
  }
  return query.then(r => r.at(0))
})  as GetArtist

/**
 * Return the artist with musicBrainzId + rating + favs
 */
export const getArtistWithExtraInfoForUser = (artistId: string, userId: string) => db.select({
    ...getTableColumns(artists),
    name: sql<string>`coalesce(${transliterations.value}, ${artists.name})`,
    albumCount: count(albums.id),
    userRating: ratings.rating,
    starred: favorites.starredAt,
  })
  .from(artists)
  .where(eq(artists.id, artistId))
  .leftJoin(albums, eq(albums.artistId, artists.id))
  .leftJoin(ratings, and(eq(ratings.userId, userId), eq(ratings.itemType, 'artist'), eq(ratings.itemId, artists.id)))
  .leftJoin(favorites, and(eq(favorites.userId, userId), eq(favorites.itemType, 'artist'), eq(favorites.itemId, artists.id)))
  .leftJoin(userPreferences, eq(userPreferences.userId, userId))
  .leftJoin(
    transliterations,
    and(
      eq(transliterations.itemType, 'artist'),
      eq(transliterations.itemId, artists.id),
      eq(transliterations.script, userPreferences.script)
    )
  )
  .groupBy(artists.id)
  .then(r => r.at(0))


export const updateArtistMusicbrainzLastFetched = (artistId: string, saved: boolean, source: string) =>
  db.insert(artistMusicbrainz)
    .values({ artistId, lastFetchedAt: new Date(), lastAttemptAt: new Date(), status: saved ? 'matched' : 'not_found', source })
    .onConflictDoUpdate({
      target: artistMusicbrainz.artistId,
      set: { lastFetchedAt: new Date(), lastAttemptAt: new Date(), status: saved ? 'matched' : 'not_found' },
    })

export const updateArtistMusicbrainzLastFailedAttempt = (artistId: string) =>
  db.insert(artistMusicbrainz)
    .values({ artistId, lastAttemptAt: new Date(), status: 'error' })
    .onConflictDoUpdate({
      target: artistMusicbrainz.artistId,
      set: { lastAttemptAt: new Date(), status: 'error' },
    })

export const getArtistAlbumsWithExtraDataForUser = async (artistId: string, userId: string): Promise<AlbumWithExtraData[]> => db
  .select({
    id: albums.id,
    title: sql<string>`coalesce(${albumTransliterations.value}, ${albums.title})`,
    year: albums.year,
    coverPath: albums.coverPath,
    sortTitle: albums.sortTitle,
    songCount: count(tracks.id),
    duration: sum(tracks.duration).mapWith(Number),
    userRating: ratings.rating,
    played: max(tracks.lastPlayedAt),
    starred: favorites.starredAt,
    artistId: albums.artistId,
    playCount: sum(tracks.playCount).mapWith(Number),
    createdAt: albums.createdAt,
  })
  .from(albums)
  .leftJoin(tracks, eq(tracks.albumId, albums.id))
  .leftJoin(
    ratings,
    and(
      eq(ratings.itemId, albums.id),
      eq(ratings.itemType, 'album'),
      eq(ratings.userId, userId)
    )
  )
  .leftJoin(
    favorites,
    and(
      eq(favorites.itemId, albums.id),
      eq(favorites.itemType, 'album'),
      eq(favorites.userId, userId)
    )
  )
  .leftJoin(userPreferences, eq(userPreferences.userId, userId))
  .leftJoin(
    albumTransliterations,
    and(
      eq(albumTransliterations.itemType, 'album'),
      eq(albumTransliterations.itemId, albums.id),
      eq(albumTransliterations.script, userPreferences.script)
    )
  )
  .where(eq(albums.artistId, artistId))
  .groupBy(albums.id, ratings.rating, favorites.itemId)
  .orderBy(sql`coalesce(${albums.sortTitle}, ${albums.title})`)


export interface GetArtistTopSongsParams{
  type: 'id' | 'name',
  id: string,
  userId: string,
  count?: number,
}

type transliterationType = { transliterations: Array<{script:  (typeof SCRIPTS)[number], value: string}>}
export interface TopSongRow {
  track: typeof tracks.$inferSelect & transliterationType
  album: typeof albums.$inferSelect & transliterationType
  artist: typeof artists.$inferSelect & transliterationType
  userPlayCount: number | null
  userLastPlayedAt: Date | null
  starredAt: Date | null
  userRating: number | null
}

export const getArtistTopSongs = async ({
  type,
  id,
  userId,
  count: limit = 50,
}: GetArtistTopSongsParams): Promise<TopSongRow[]> => {
  const artistMatch = type === 'id' ? eq(artists.id, id) : eq(artists.name, id)

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

  const trackTranslitAgg = db.$with('track_translit_agg').as(
    db
      .select({
        itemId: trackTransliterations.itemId,
        trackAll: sql<transliterationType['transliterations']>`json_group_array(json_object('script', ${trackTransliterations.script}, 'value', ${trackTransliterations.value}))`.as('trackAll'),
      })
      .from(trackTransliterations)
      .where(eq(trackTransliterations.itemType, 'track'))
      .groupBy(trackTransliterations.itemId)
  )

  const albumTranslitAgg = db.$with('album_translit_agg').as(
    db
      .select({
        itemId: albumTransliterations.itemId,
        albumAll: sql<transliterationType['transliterations']>`json_group_array(json_object('script', ${albumTransliterations.script}, 'value', ${albumTransliterations.value}))`.as('albumAll'),
      })
      .from(albumTransliterations)
      .where(eq(albumTransliterations.itemType, 'album'))
      .groupBy(albumTransliterations.itemId)
  )

  const artistTranslitAgg = db.$with('artist_translit_agg').as(
    db
      .select({
        itemId: artistTransliterations.itemId,
        artistAll: sql<transliterationType['transliterations']>`json_group_array(json_object('script', ${artistTransliterations.script}, 'value', ${artistTransliterations.value}))`.as('artistAll'),
      })
      .from(artistTransliterations)
      .where(eq(artistTransliterations.itemType, 'artist'))
      .groupBy(artistTransliterations.itemId)
  )

  return db
    .with(userPlayStats, trackTranslitAgg, albumTranslitAgg, artistTranslitAgg)
    .select({
      track: {
        ...getTableColumns(tracks),
        title: sql<string>`coalesce(${trackTransliterations.value}, ${tracks.title})`,
        transliterations: sql<transliterationType['transliterations']>`coalesce(${trackTranslitAgg.trackAll}, '[]')`,
      },
      album: {
        ...getTableColumns(albums),
        title: sql<string>`coalesce(${albumTransliterations.value}, ${albums.title})`,
        transliterations: sql<transliterationType['transliterations']>`coalesce(${albumTranslitAgg.albumAll}, '[]')`,
      },
      artist: {
        ...getTableColumns(artists),
        name: sql<string>`coalesce(${artistTransliterations.value}, ${artists.name})`,
        transliterations: sql<transliterationType['transliterations']>`coalesce(${artistTranslitAgg.artistAll}, '[]')`,
      },
      userPlayCount: userPlayStats.userPlayCount,
      userLastPlayedAt: userPlayStats.userLastPlayedAt,
      starredAt: favorites.starredAt,
      userRating: ratings.rating,
    })
    .from(tracks)
    .innerJoin(artists, eq(tracks.artistId, artists.id))
    .innerJoin(albums, eq(tracks.albumId, albums.id))
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
    .leftJoin(userPreferences, eq(userPreferences.userId, userId))
    .leftJoin(
      trackTransliterations,
      and(
        eq(trackTransliterations.itemType, 'track'),
        eq(trackTransliterations.itemId, tracks.id),
        eq(trackTransliterations.script, userPreferences.script)
      )
    )
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
    .leftJoin(trackTranslitAgg, eq(trackTranslitAgg.itemId, tracks.id))
    .leftJoin(albumTranslitAgg, eq(albumTranslitAgg.itemId, albums.id))
    .leftJoin(artistTranslitAgg, eq(artistTranslitAgg.itemId, artists.id))
    .where(artistMatch)
    .orderBy(desc(tracks.playCount))
    .limit(limit)
}
