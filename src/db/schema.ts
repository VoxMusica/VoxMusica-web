import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: integer('created_at').notNull(),
})

export const artists = sqliteTable('artists', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  sortName: text('sort_name'),
})

export const albums = sqliteTable('albums', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  artistId: text('artist_id').notNull().references(() => artists.id),
  year: integer('year'),
  coverPath: text('cover_path'),
})

export const tracks = sqliteTable('tracks', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  albumId: text('album_id').notNull().references(() => albums.id),
  artistId: text('artist_id').notNull().references(() => artists.id),
  filePath: text('file_path').notNull(),
  duration: integer('duration'),
  trackNumber: integer('track_number'),
  genre: text('genre'),
  playCount: integer('play_count').notNull().default(0),
})

export const playlists = sqliteTable('playlists', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  userId: text('user_id').notNull().references(() => users.id),
  createdAt: integer('created_at').notNull(),
})

export const playlistTracks = sqliteTable('playlist_tracks', {
  id: text('id').primaryKey(),
  playlistId: text('playlist_id').notNull().references(() => playlists.id),
  trackId: text('track_id').notNull().references(() => tracks.id),
  position: integer('position').notNull(),
})

export const scrobbles = sqliteTable('scrobbles', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  trackId: text('track_id').notNull().references(() => tracks.id),
  playedAt: integer('played_at').notNull(),
})
