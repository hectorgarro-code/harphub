-- Practice Session Tracking
CREATE TABLE IF NOT EXISTS practice_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    lesson_id INT NULL,
    instrument VARCHAR(50),
    practice_type VARCHAR(50) DEFAULT 'study', -- 'study', 'improv', 'exercise'
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    ended_at DATETIME NULL,
    duration_minutes INT DEFAULT 0,
    max_bpm INT DEFAULT 0,
    average_bpm INT DEFAULT 0,
    loops_used INT DEFAULT 0,
    bookmarks_used INT DEFAULT 0,
    playback_speed_avg FLOAT DEFAULT 1.0,
    completion_score INT DEFAULT 0,
    metadata_json TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE SET NULL
);

-- Activity Cards (Social Feed)
CREATE TABLE IF NOT EXISTS activity_cards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'bpm_record', 'practice_session', 'challenge_completed', 'review_received', etc.
    title VARCHAR(255),
    content TEXT,
    metrics_json TEXT, -- {bpm: 120, duration: 30, difficulty: 'hard'}
    lesson_id INT NULL,
    submission_id INT NULL,
    review_id INT NULL,
    visibility ENUM('public', 'followers', 'private') DEFAULT 'public',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE SET NULL
);

-- User Practice Stats Aggregation
CREATE TABLE IF NOT EXISTS user_practice_stats (
    user_id INT PRIMARY KEY,
    total_minutes INT DEFAULT 0,
    sessions_count INT DEFAULT 0,
    current_streak INT DEFAULT 0,
    longest_streak INT DEFAULT 0,
    last_practice_date DATE,
    xp_score INT DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
