CREATE TABLE `prompt_images` (
	`id` text PRIMARY KEY NOT NULL,
	`prompt_id` text NOT NULL,
	`object_key` text NOT NULL,
	`mime_type` text NOT NULL,
	`size_bytes` integer NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`is_cover` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`prompt_id`) REFERENCES `prompts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `prompt_images_prompt_idx` ON `prompt_images` (`prompt_id`);--> statement-breakpoint
CREATE INDEX `prompt_images_cover_idx` ON `prompt_images` (`prompt_id`,`is_cover`);--> statement-breakpoint
CREATE TABLE `prompt_tags` (
	`prompt_id` text NOT NULL,
	`tag_id` text NOT NULL,
	PRIMARY KEY(`prompt_id`, `tag_id`),
	FOREIGN KEY (`prompt_id`) REFERENCES `prompts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `prompt_tags_prompt_idx` ON `prompt_tags` (`prompt_id`);--> statement-breakpoint
CREATE INDEX `prompt_tags_tag_idx` ON `prompt_tags` (`tag_id`);--> statement-breakpoint
CREATE TABLE `prompts` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`positive_prompt` text NOT NULL,
	`negative_prompt` text,
	`visibility` text DEFAULT 'private' NOT NULL,
	`view_count` integer DEFAULT 0 NOT NULL,
	`positive_copy_count` integer DEFAULT 0 NOT NULL,
	`negative_copy_count` integer DEFAULT 0 NOT NULL,
	`slug` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `prompts_slug_unique` ON `prompts` (`slug`);--> statement-breakpoint
CREATE INDEX `prompts_visibility_idx` ON `prompts` (`visibility`);--> statement-breakpoint
CREATE INDEX `prompts_created_idx` ON `prompts` (`created_at`);--> statement-breakpoint
CREATE INDEX `prompts_popular_idx` ON `prompts` (`positive_copy_count`,`negative_copy_count`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`token_hash` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sessions_token_unique` ON `sessions` (`token_hash`);--> statement-breakpoint
CREATE INDEX `sessions_expiry_idx` ON `sessions` (`expires_at`);--> statement-breakpoint
CREATE TABLE `tags` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`normalized_name` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tags_normalized_unique` ON `tags` (`normalized_name`);