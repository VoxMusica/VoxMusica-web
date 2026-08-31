DROP INDEX "album_musicbrainz_musicbrainz_id_idx";--> statement-breakpoint
DROP INDEX "album_musicbrainz_album_id_idx";--> statement-breakpoint
DROP INDEX "artist_musicbrainz_musicbrainz_id_idx";--> statement-breakpoint
DROP INDEX "artist_musicbrainz_artist_id_idx";--> statement-breakpoint
DROP INDEX "play_events_track_id_idx";--> statement-breakpoint
DROP INDEX "play_events_user_id_idx";--> statement-breakpoint
DROP INDEX "play_events_played_at_idx";--> statement-breakpoint
DROP INDEX "api_keys_key_hash_unique";--> statement-breakpoint
DROP INDEX "api_keys_key_hash_idx";--> statement-breakpoint
DROP INDEX "api_keys_user_id_idx";--> statement-breakpoint
DROP INDEX "users_username_unique";--> statement-breakpoint
ALTER TABLE `albums` ALTER COLUMN "created_at" TO "created_at" integer NOT NULL DEFAULT (unixepoch());--> statement-breakpoint
CREATE INDEX `album_musicbrainz_musicbrainz_id_idx` ON `album_musicbrainz` (`musicbrainz_id`);--> statement-breakpoint
CREATE INDEX `album_musicbrainz_album_id_idx` ON `album_musicbrainz` (`album_id`);--> statement-breakpoint
CREATE INDEX `artist_musicbrainz_musicbrainz_id_idx` ON `artist_musicbrainz` (`musicbrainz_id`);--> statement-breakpoint
CREATE INDEX `artist_musicbrainz_artist_id_idx` ON `artist_musicbrainz` (`artist_id`);--> statement-breakpoint
CREATE INDEX `play_events_track_id_idx` ON `play_events` (`track_id`);--> statement-breakpoint
CREATE INDEX `play_events_user_id_idx` ON `play_events` (`user_id`);--> statement-breakpoint
CREATE INDEX `play_events_played_at_idx` ON `play_events` (`played_at`);--> statement-breakpoint
CREATE UNIQUE INDEX `api_keys_key_hash_unique` ON `api_keys` (`key_hash`);--> statement-breakpoint
CREATE INDEX `api_keys_key_hash_idx` ON `api_keys` (`key_hash`);--> statement-breakpoint
CREATE INDEX `api_keys_user_id_idx` ON `api_keys` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);--> statement-breakpoint
ALTER TABLE `albumsStaging` ALTER COLUMN "created_at" TO "created_at" integer NOT NULL DEFAULT (unixepoch());--> statement-breakpoint
ALTER TABLE `artists` ALTER COLUMN "created_at" TO "created_at" integer NOT NULL DEFAULT '"2026-08-30T20:49:52.484Z"';--> statement-breakpoint
ALTER TABLE `artistsStaging` ALTER COLUMN "created_at" TO "created_at" integer NOT NULL DEFAULT '"2026-08-30T20:49:52.484Z"';--> statement-breakpoint
ALTER TABLE `tracks` ALTER COLUMN "created_at" TO "created_at" integer NOT NULL DEFAULT '"2026-08-30T20:49:52.485Z"';--> statement-breakpoint
ALTER TABLE `tracksStaging` ALTER COLUMN "created_at" TO "created_at" integer NOT NULL DEFAULT '"2026-08-30T20:49:52.485Z"';