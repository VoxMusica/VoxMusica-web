import { and, eq } from "drizzle-orm"

import { db } from "#db/index"
import { albums, artists, favorites, ratings, tracks } from "#db/schema"

type ItemType = 'artist' | 'album' | 'track'

const resolveItemType = async (id: string): Promise<ItemType | null> => {
  const [artist] = await db.select({ id: artists.id }).from(artists).where(eq(artists.id, id)).limit(1)
  if (artist != null) return 'artist'

  const [album] = await db.select({ id: albums.id }).from(albums).where(eq(albums.id, id)).limit(1)
  if (album != null) return 'album'

  const [track] = await db.select({ id: tracks.id }).from(tracks).where(eq(tracks.id, id)).limit(1)
  if (track != null) return 'track'

  return null
}

export const setRating = async (id: string, userId: string, rating: number): Promise<boolean> => {
  const itemType = await resolveItemType(id)
  if (itemType == null) return false

  if (rating === 0) {
    await db
      .delete(ratings)
      .where(and(eq(ratings.userId, userId), eq(ratings.itemType, itemType), eq(ratings.itemId, id)))
    return true
  }

  await db
    .insert(ratings)
    .values({ userId, itemType, itemId: id, rating })
    .onConflictDoUpdate({
      target: [ratings.userId, ratings.itemType, ratings.itemId],
      set: { rating },
    })

  return true
}

export const addStar = async (id: string, userId: string): Promise<boolean> => {
  const itemType = await resolveItemType(id)
  if (itemType == null) return false

  await db
    .insert(favorites)
    .values({ userId, itemType, itemId: id, starredAt: new Date() })
    .onConflictDoNothing()

  return true
}

export const removeStar = async (id: string, userId: string): Promise<boolean> => {
  const itemType = await resolveItemType(id)
  if (itemType == null) return false

  await db
    .delete(favorites)
    .where(and(eq(favorites.userId, userId), eq(favorites.itemType, itemType), eq(favorites.itemId, id)))

  return true
}
