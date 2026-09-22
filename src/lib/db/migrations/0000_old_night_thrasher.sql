CREATE TABLE `cv_items` (
	`id` text PRIMARY KEY NOT NULL,
	`cv_id` text NOT NULL,
	`node_id` text NOT NULL,
	`section` text NOT NULL,
	`position` integer NOT NULL,
	`hidden_sub_item_ids` text NOT NULL,
	`overrides` text NOT NULL,
	FOREIGN KEY (`cv_id`) REFERENCES `cvs`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`node_id`) REFERENCES `nodes`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `cvs` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`target_role` text,
	`company` text,
	`job_description` text,
	`template_id` text NOT NULL,
	`margins` text,
	`section_order` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `nodes` (
	`id` text PRIMARY KEY NOT NULL,
	`category` text NOT NULL,
	`title` text NOT NULL,
	`data` text NOT NULL,
	`tags` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
