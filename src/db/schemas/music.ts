import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { users } from '#db/schemas/user'

const artistsSchema = {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  sortName: text('sort_name'),
  musicbrainzArtistId: text('music_brain_artist_id')
}
export const artists = sqliteTable('artists', artistsSchema)
export const artistsStaging = sqliteTable('artistsStaging', artistsSchema)

const albumsSchema = {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  year: integer('year'),
  coverPath: text('cover_path'),
  sortTitle: text('sort_title'),
  musicbrainzAlbumId: text('music_brain_album_id')
}
export const albums = sqliteTable('albums', {
  ...albumsSchema,
  artistId: text('artist_id').notNull().references(() => artists.id),
})
export const albumsStaging = sqliteTable('albumsStaging', {
  ...albumsSchema,
  artistId: text('artist_id').notNull().references(() => artistsStaging.id),
})

const tracksSchema = {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  filePath: text('file_path').notNull(),
  fileSize: integer('file_size').notNull(),
  fileModifiedAt: integer('file_modified_at', { mode: 'timestamp'}).notNull(),
  duration: integer('duration'),
  trackNumber: integer('track_number'),
  discNumber: integer('disc_number'),
  genre: text('genre'),
  year: integer('year'),
  codec: text('codec'),
  bitrate: integer('bitrate'),
  sampleRate: integer('sample_rate'),
  channels: integer('channels'),
  musicbrainzTrackId: text('musicbrainz_track_id'),
  playCount: integer('play_count').notNull().default(0),
}
export const tracks = sqliteTable('tracks', {
  ...tracksSchema,
  artistId: text('artist_id').notNull().references(() => artists.id),
  albumId:  text('album_id').notNull().references(() => albums.id),
})
export const tracksStaging = sqliteTable('tracksStaging', {
  ...tracksSchema,
  artistId: text('artist_id').notNull().references(() => artistsStaging.id),
  albumId: text('album_id').notNull().references(() => albumsStaging.id),
})

export const playlists = sqliteTable('playlists', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  userId: text('user_id').notNull().references(() => users.id),
  createdAt: integer('created_at', { mode: 'timestamp'}).notNull(),
})

export const playlistTracks = sqliteTable('playlist_tracks', {
  id: text('id').primaryKey(),
  playlistId: text('playlist_id').notNull().references(() => playlists.id),
  trackId: text('track_id').notNull().references(() => tracks.id),
  position: integer('position').notNull(),
})
