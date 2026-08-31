-- Migration: Universal Unification & Collections
-- Date: 2026-05-11

-- Collections table
CREATE TABLE IF NOT EXISTS collections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    cover_image VARCHAR(255),
    visibility ENUM('private', 'public', 'remixable') DEFAULT 'private',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Many-to-many relationship between collections and lessons
CREATE TABLE IF NOT EXISTS collection_lessons (
    collection_id INT NOT NULL,
    lesson_id INT NOT NULL,
    order_index INT DEFAULT 0,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (collection_id, lesson_id),
    FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
);

-- Learning Paths (Sequences of knowledge)
CREATE TABLE IF NOT EXISTS learning_paths (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    sequence JSON, -- Array of objects {type: 'lesson'|'collection', id: ID}
    difficulty VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Update lessons to remove rigid category constraints (making it optional/legacy)
ALTER TABLE lessons MODIFY COLUMN category VARCHAR(50) NULL;
