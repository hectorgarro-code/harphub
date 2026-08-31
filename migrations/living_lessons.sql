-- Migration: Living Lessons System
-- Date: 2026-05-10

-- Update lessons table with metadata and social tracking
ALTER TABLE lessons ADD COLUMN original_creator_id INT;
ALTER TABLE lessons ADD COLUMN parent_lesson_id INT;
ALTER TABLE lessons ADD COLUMN visibility ENUM('private', 'public', 'remixable') DEFAULT 'public';
ALTER TABLE lessons ADD COLUMN remix_permission BOOLEAN DEFAULT TRUE;
ALTER TABLE lessons ADD COLUMN fork_count INT DEFAULT 0;
ALTER TABLE lessons ADD COLUMN practice_count INT DEFAULT 0;
ALTER TABLE lessons ADD COLUMN save_count INT DEFAULT 0;

-- Create table for modular blocks
CREATE TABLE IF NOT EXISTS lesson_blocks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lesson_id INT NOT NULL,
    type VARCHAR(50) NOT NULL, -- text, video, audio, midi, sheet, practice, quiz, callout, challenge, divider
    content JSON, -- Stores the specific data for each block
    order_index INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
);

-- Create table for tracking individual user progress per lesson/block
CREATE TABLE IF NOT EXISTS user_lesson_progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    lesson_id INT NOT NULL,
    completed_blocks JSON, -- Array of block IDs completed
    practice_time_seconds INT DEFAULT 0,
    max_bpm INT DEFAULT 0,
    last_practiced TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    status ENUM('started', 'completed') DEFAULT 'started',
    UNIQUE KEY user_lesson (user_id, lesson_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
);

-- Indexing for performance
CREATE INDEX idx_blocks_lesson ON lesson_blocks(lesson_id, order_index);
CREATE INDEX idx_lessons_parent ON lessons(parent_lesson_id);
CREATE INDEX idx_lessons_creator ON lessons(user_id);
