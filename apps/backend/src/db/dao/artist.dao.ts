import { and, count, desc, eq, getTableColumns, max, sql, sum } from "drizzle-orm"

import { db } from "#db/index"
import { albums, artistMusicbrainz, artists, favorites, playEvents, ratings, tracks, type AlbumWithExtraData, type ArtistWithExtraData } from "#db/schema"

type Artist = typeof artists.$inferSelect
type ArtistMusicbrainz = typeof artistMusicbrainz.$inferSelect

type ArtistWithMBStatus = {
  artists: Artist
  artist_musicbrainz: ArtistMusicbrainz | null
}


export const getAllArtists = async () =>
  db.select().from(artists)
export const getAllArtistsWithAlbumCount = async () =>
  db.select({
    ...getTableColumns(artists),
    albumCount: count(albums.id)
  })
  .from(artists)
  .leftJoin(albums, eq(albums.artistId, artists.id))
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
    albumCount: count(albums.id),
    userRating: ratings.rating,
    starred: favorites.starredAt,
  })
  .from(artists)
  .where(eq(artists.id, artistId))
  .leftJoin(albums, eq(albums.artistId, artists.id))
  .leftJoin(ratings, and(eq(ratings.userId, userId), eq(ratings.itemType, 'album'), eq(ratings.itemId, albums.id)))
  .leftJoin(favorites, and(eq(favorites.userId, userId), eq(favorites.itemType, 'album'), eq(favorites.itemId, albums.id)))
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
      title: albums.title,
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
    .where(eq(albums.artistId, artistId))
    .groupBy(albums.id, ratings.rating, favorites.itemId)
    .orderBy(sql`coalesce(${albums.sortTitle}, ${albums.title})`)


export interface GetArtistTopSongsParams{
  type: 'id' | 'name',
  id: string,
  userId: string,
  count?: number,
}
export interface TopSongRow {
  track: typeof tracks.$inferSelect
  album: typeof albums.$inferSelect
  artist: typeof artists.$inferSelect
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

  return db
    .with(userPlayStats)
    .select({
      track: tracks,
      album: albums,
      artist: artists,
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
    .where(artistMatch)
    .orderBy(desc(tracks.playCount))
    .limit(limit)
}

