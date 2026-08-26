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
CREATE TABLE `albums` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`artist_id` text NOT NULL,
	`year` integer,
	`cover_path` text,
	`sort_title` text,
	`music_brain_album_id` text,
	FOREIGN KEY (`artist_id`) REFERENCES `artists`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `albumsStaging` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`artist_id` text NOT NULL,
	`year` integer,
	`cover_path` text,
	`sort_title` text,
	`music_brain_album_id` text,
	FOREIGN KEY (`artist_id`) REFERENCES `artists`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`artist_id`) REFERENCES `artistsStaging`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
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
CREATE TABLE `tracks` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`album_id` text NOT NULL,
	`artist_id` text NOT NULL,
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
	FOREIGN KEY (`album_id`) REFERENCES `albums`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`artist_id`) REFERENCES `artists`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `tracksStaging` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`album_id` text NOT NULL,
	`artist_id` text NOT NULL,
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
	FOREIGN KEY (`album_id`) REFERENCES `albums`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`album_id`) REFERENCES `albumsStaging`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`artist_id`) REFERENCES `artists`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`artist_id`) REFERENCES `artistsStaging`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`password_hash` text NOT NULL,
	`roles` text DEFAULT '[]' NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);