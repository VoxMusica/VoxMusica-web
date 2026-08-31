ALTER TABLE `albums` ADD `created_at` integer DEFAULT '"2026-08-30T20:04:50.415Z"' NOT NULL;--> statement-breakpoint
ALTER TABLE `albumsStaging` ADD `created_at` integer DEFAULT '"2026-08-30T20:04:50.415Z"' NOT NULL;--> statement-breakpoint
ALTER TABLE `artists` ADD `created_at` integer DEFAULT '"2026-08-30T20:04:50.414Z"' NOT NULL;--> statement-breakpoint
ALTER TABLE `artistsStaging` ADD `created_at` integer DEFAULT '"2026-08-30T20:04:50.414Z"' NOT NULL;--> statement-breakpoint
ALTER TABLE `tracks` ADD `created_at` integer DEFAULT '"2026-08-30T20:04:50.415Z"' NOT NULL;--> statement-breakpoint
ALTER TABLE `tracksStaging` ADD `created_at` integer DEFAULT '"2026-08-30T20:04:50.415Z"' NOT NULL;