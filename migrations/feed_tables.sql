-- Migration: Social Music Feed Tables
-- Date: 2026-05-10

CREATE TABLE IF NOT EXISTS activities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type ENUM('practice', 'lesson_new', 'lesson_fork', 'challenge_complete', 'achievement') NOT NULL,
    content_id INT, -- ID of lesson, practice session, etc.
    metadata JSON, -- Stores BPM, duration, instrument, etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS practice_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    lesson_id INT,
    bpm INT,
    duration_seconds INT,
    instrument VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS lesson_forks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    original_lesson_id INT NOT NULL,
    new_lesson_id INT NOT NULL,
    user_id INT NOT NULL,
    changes_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (original_lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
    FOREIGN KEY (new_lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS saved_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    item_type ENUM('lesson', 'clip', 'challenge') NOT NULL,
    item_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_save (user_id, item_type, item_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Index for feed performance
CREATE INDEX idx_activities_user_created ON activities(user_id, created_at DESC);
CREATE INDEX idx_activities_type_created ON activities(type, created_at DESC);
