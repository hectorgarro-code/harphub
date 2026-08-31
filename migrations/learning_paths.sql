-- HarpHub Learning Paths & Continuation System Schema
-- Organizes musical learning into structured roadmaps and powers the intelligent reminder engine.

-- 1. Core Learning Paths Table
CREATE TABLE IF NOT EXISTS `learning_paths` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `creator_id` varchar(255) NOT NULL,
  `original_creator_id` varchar(255) DEFAULT NULL, -- For tracking forks
  `parent_path_id` int(11) DEFAULT NULL, -- If forked from an existing path
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `cover_image` varchar(500) DEFAULT NULL,
  `instrument` varchar(100) DEFAULT NULL,
  `genres` varchar(255) DEFAULT NULL, -- JSON array
  `difficulty` varchar(50) DEFAULT 'beginner',
  `estimated_duration` int(11) DEFAULT 0, -- In minutes
  `visibility` enum('public', 'private', 'unlisted') DEFAULT 'public',
  `remix_permission` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  INDEX (`creator_id`),
  INDEX (`visibility`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Learning Path Nodes (The building blocks of the path)
CREATE TABLE IF NOT EXISTS `learning_path_nodes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `path_id` int(11) NOT NULL,
  `entity_type` enum('lesson', 'collection', 'practice', 'review', 'milestone', 'checkpoint') NOT NULL,
  `entity_id` varchar(255) DEFAULT NULL, -- ID of the lesson, collection, etc. Can be string (like user_id) or int.
  `title` varchar(255) DEFAULT NULL, -- Optional override title for the node
  `description` text DEFAULT NULL,
  `order_index` int(11) NOT NULL DEFAULT 0,
  `is_required` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  INDEX (`path_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. User Progress Tracking
CREATE TABLE IF NOT EXISTS `learning_path_progress` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` varchar(255) NOT NULL,
  `path_id` int(11) NOT NULL,
  `current_node_id` int(11) DEFAULT NULL,
  `completed_nodes_json` text DEFAULT NULL, -- JSON array of completed node IDs
  `mastery_score` int(11) DEFAULT 0, -- 0-100 score if applicable
  `status` enum('active', 'completed', 'paused') DEFAULT 'active',
  `started_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `completed_at` timestamp NULL DEFAULT NULL,
  `last_activity_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_path_unique` (`user_id`, `path_id`),
  INDEX (`user_id`),
  INDEX (`last_activity_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Contextual Reminders (Smart Continuation Engine)
CREATE TABLE IF NOT EXISTS `user_learning_reminders` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` varchar(255) NOT NULL,
  `entity_type` enum('path', 'lesson', 'practice', 'review_pending') NOT NULL,
  `entity_id` varchar(255) NOT NULL,
  `reminder_type` varchar(100) NOT NULL, -- e.g., 'resume_path', 'finish_lesson', 'practice_due'
  `custom_message` text DEFAULT NULL,
  `status` enum('active', 'snoozed', 'dismissed', 'archived', 'completed') DEFAULT 'active',
  `snoozed_until` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  INDEX (`user_id`),
  INDEX (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
