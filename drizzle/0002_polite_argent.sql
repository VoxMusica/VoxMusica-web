CREATE TABLE `album_musicbrainz` (
	`album_id` integer PRIMARY KEY NOT NULL,
	`musicbrainz_id` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`last_attempt_at` integer,
	`last_fetched_at` integer
);
--> statement-breakpoint
CREATE TABLE `artist_musicbrainz` (
	`artist_id` integer PRIMARY KEY NOT NULL,
	`musicbrainz_id` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`last_attempt_at` integer,
	`last_fetched_at` integer
);
