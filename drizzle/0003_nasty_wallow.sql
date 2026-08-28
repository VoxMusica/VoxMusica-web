PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_album_musicbrainz` (
	`album_id` text PRIMARY KEY NOT NULL,
	`musicbrainz_id` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`last_attempt_at` integer,
	`last_fetched_at` integer
);
--> statement-breakpoint
INSERT INTO `__new_album_musicbrainz`("album_id", "musicbrainz_id", "status", "last_attempt_at", "last_fetched_at") SELECT "album_id", "musicbrainz_id", "status", "last_attempt_at", "last_fetched_at" FROM `album_musicbrainz`;--> statement-breakpoint
DROP TABLE `album_musicbrainz`;--> statement-breakpoint
ALTER TABLE `__new_album_musicbrainz` RENAME TO `album_musicbrainz`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_artist_musicbrainz` (
	`artist_id` text PRIMARY KEY NOT NULL,
	`musicbrainz_id` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`last_attempt_at` integer,
	`last_fetched_at` integer
);
--> statement-breakpoint
INSERT INTO `__new_artist_musicbrainz`("artist_id", "musicbrainz_id", "status", "last_attempt_at", "last_fetched_at") SELECT "artist_id", "musicbrainz_id", "status", "last_attempt_at", "last_fetched_at" FROM `artist_musicbrainz`;--> statement-breakpoint
DROP TABLE `artist_musicbrainz`;--> statement-breakpoint
ALTER TABLE `__new_artist_musicbrainz` RENAME TO `artist_musicbrainz`;