CREATE TABLE IF NOT EXISTS `prompt_sequence` (
	`id` integer PRIMARY KEY NOT NULL,
	`value` integer NOT NULL
);
--> statement-breakpoint
INSERT OR IGNORE INTO `prompt_sequence` (`id`, `value`)
SELECT 1, MAX(COUNT(*), COALESCE(MAX(CASE WHEN title LIKE '프롬프트 %' THEN CAST(SUBSTR(title, 6) AS INTEGER) ELSE 0 END), 0)) FROM `prompts`;
