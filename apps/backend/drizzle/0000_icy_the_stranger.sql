CREATE TABLE `scans` (
	`id` text PRIMARY KEY NOT NULL,
	`status` text NOT NULL,
	`total_files` integer,
	`processed_files` integer DEFAULT 0 NOT NULL,
	`started_at` integer,
	`completed_at` integer,
	`error` text
);
--> statement-breakpoint
CREATE TABLE `album_musicbrainz` (
	`album_id` text PRIMARY KEY NOT NULL,
	`musicbrainz_id` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`last_attempt_at` integer,
	`last_fetched_at` integer,
	`source` text
);
--> statement-breakpoint
CREATE INDEX `album_musicbrainz_musicbrainz_id_idx` ON `album_musicbrainz` (`musicbrainz_id`);--> statement-breakpoint
CREATE INDEX `album_musicbrainz_album_id_idx` ON `album_musicbrainz` (`album_id`);--> statement-breakpoint
CREATE TABLE `albums` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`year` integer,
	`cover_path` text,
	`sort_title` text,
	`music_brain_album_id` text,
	`artist_id` text NOT NULL,
	FOREIGN KEY (`artist_id`) REFERENCES `artists`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `albumsStaging` (
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
CREATE TABLE `artist_musicbrainz` (
	`artist_id` text PRIMARY KEY NOT NULL,
	`musicbrainz_id` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`last_attempt_at` integer,
	`last_fetched_at` integer,
	`source` text
);
--> statement-breakpoint
CREATE INDEX `artist_musicbrainz_musicbrainz_id_idx` ON `artist_musicbrainz` (`musicbrainz_id`);--> statement-breakpoint
CREATE INDEX `artist_musicbrainz_artist_id_idx` ON `artist_musicbrainz` (`artist_id`);--> statement-breakpoint
CREATE TABLE `artists` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`sort_name` text,
	`music_brain_artist_id` text
);
--> statement-breakpoint
CREATE TABLE `artistsStaging` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`sort_name` text,
	`music_brain_artist_id` text
);
--> statement-breakpoint
CREATE TABLE `favorites` (
	`user_id` text NOT NULL,
	`item_type` text NOT NULL,
	`item_id` text NOT NULL,
	`starred_at` integer NOT NULL,
	PRIMARY KEY(`user_id`, `item_type`, `item_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `play_events` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`track_id` text NOT NULL,
	`played_at` integer NOT NULL,
	`percent_played` integer,
	`counted` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `play_events_track_id_idx` ON `play_events` (`track_id`);--> statement-breakpoint
CREATE INDEX `play_events_user_id_idx` ON `play_events` (`user_id`);--> statement-breakpoint
CREATE INDEX `play_events_played_at_idx` ON `play_events` (`played_at`);--> statement-breakpoint
CREATE TABLE `playlist_tracks` (
	`id` text PRIMARY KEY NOT NULL,
	`playlist_id` text NOT NULL,
	`track_id` text NOT NULL,
	`position` integer NOT NULL,
	FOREIGN KEY (`playlist_id`) REFERENCES `playlists`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`track_id`) REFERENCES `tracks`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `playlists` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`user_id` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `ratings` (
	`user_id` text NOT NULL,
	`item_type` text NOT NULL,
	`item_id` text NOT NULL,
	`rating` integer NOT NULL,
	PRIMARY KEY(`user_id`, `item_type`, `item_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `tracks` (
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
	`last_played_at` integer,
	`artist_id` text NOT NULL,
	`album_id` text NOT NULL,
	FOREIGN KEY (`artist_id`) REFERENCES `artists`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`album_id`) REFERENCES `albums`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `tracksStaging` (
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
	`last_played_at` integer,
	`artist_id` text NOT NULL,
	`album_id` text NOT NULL,
	FOREIGN KEY (`artist_id`) REFERENCES `artistsStaging`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`album_id`) REFERENCES `albumsStaging`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `api_keys` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`key_hash` text NOT NULL,
	`label` text,
	`is_system` integer DEFAULT false NOT NULL,
	`last_used_at` integer,
	`expires_at` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `api_keys_key_hash_unique` ON `api_keys` (`key_hash`);--> statement-breakpoint
CREATE INDEX `api_keys_key_hash_idx` ON `api_keys` (`key_hash`);--> statement-breakpoint
CREATE INDEX `api_keys_user_id_idx` ON `api_keys` (`user_id`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`password_hash` text NOT NULL,
	`roles` text DEFAULT '[]' NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);