PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_albumsStaging` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`year` integer,
	`cover_path` text,
	`sort_title` text,
	`music_brain_album_id` text,
	`artist_id` text NOT NULL,
	FOREIGN KEY (`artist_id`) REFERENCES `artistsStaging`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_albumsStaging`("id", "title", "year", "cover_path", "sort_title", "music_brain_album_id", "artist_id") SELECT "id", "title", "year", "cover_path", "sort_title", "music_brain_album_id", "artist_id" FROM `albumsStaging`;--> statement-breakpoint
DROP TABLE `albumsStaging`;--> statement-breakpoint
ALTER TABLE `__new_albumsStaging` RENAME TO `albumsStaging`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_tracksStaging` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`file_path` text NOT NULL,
	`file_size` integer NOT NULL,
	`file_modified_at` integer NOT NULL,
	`duration` integer,
	`track_number` integer,
	`disc_number` integer,
	`genre` text,
	`year` integer,
	`codec` text,
	`bitrate` integer,
	`sample_rate` integer,
	`channels` integer,
	`musicbrainz_track_id` text,
	`play_count` integer DEFAULT 0 NOT NULL,
	`artist_id` text NOT NULL,
	`album_id` text NOT NULL,
	FOREIGN KEY (`artist_id`) REFERENCES `artistsStaging`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`album_id`) REFERENCES `albumsStaging`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_tracksStaging`("id", "title", "file_path", "file_size", "file_modified_at", "duration", "track_number", "disc_number", "genre", "year", "codec", "bitrate", "sample_rate", "channels", "musicbrainz_track_id", "play_count", "artist_id", "album_id") SELECT "id", "title", "file_path", "file_size", "file_modified_at", "duration", "track_number", "disc_number", "genre", "year", "codec", "bitrate", "sample_rate", "channels", "musicbrainz_track_id", "play_count", "artist_id", "album_id" FROM `tracksStaging`;--> statement-breakpoint
DROP TABLE `tracksStaging`;--> statement-breakpoint
ALTER TABLE `__new_tracksStaging` RENAME TO `tracksStaging`;