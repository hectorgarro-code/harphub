-- Practice Submissions and Contextual Reviews System

CREATE TABLE IF NOT EXISTS `practice_submissions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` varchar(255) NOT NULL,
  `lesson_id` int(11) NOT NULL,
  `block_id` varchar(255) DEFAULT NULL,
  `audio_url` varchar(500) NOT NULL,
  `video_url` varchar(500) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `bpm` int(11) DEFAULT NULL,
  `duration` int(11) DEFAULT NULL,
  `status` enum('pending', 'reviewed', 'archived') DEFAULT 'pending',
  `review_requested` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  INDEX (`user_id`),
  INDEX (`lesson_id`),
  INDEX (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `submission_reviews` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `submission_id` int(11) NOT NULL,
  `reviewer_id` varchar(255) NOT NULL,
  `review_text` text DEFAULT NULL,
  `audio_feedback_url` varchar(500) DEFAULT NULL,
  `score` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY (`submission_id`),
  INDEX (`reviewer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `review_markers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `review_id` int(11) NOT NULL,
  `timestamp` decimal(10,2) NOT NULL,
  `measure` int(11) DEFAULT NULL,
  `note_reference` varchar(100) DEFAULT NULL,
  `comment` text NOT NULL,
  `marker_type` varchar(50) DEFAULT 'general',
  PRIMARY KEY (`id`),
  INDEX (`review_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
