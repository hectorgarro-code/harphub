-- Migration: Semantic Musical Knowledge Layer
-- Date: 2026-05-11

-- Table for the nodes of the knowledge graph
CREATE TABLE IF NOT EXISTS musical_entities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type ENUM('skill', 'concept', 'genre', 'technique') NOT NULL,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Relation table between lessons and knowledge entities
CREATE TABLE IF NOT EXISTS lesson_knowledge (
    lesson_id INT NOT NULL,
    entity_id INT NOT NULL,
    weight INT DEFAULT 1, -- How much this lesson covers the entity (1-5)
    PRIMARY KEY (lesson_id, entity_id),
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
    FOREIGN KEY (entity_id) REFERENCES musical_entities(id) ON DELETE CASCADE
);

-- Relation table for lesson graph (prerequisites, etc)
CREATE TABLE IF NOT EXISTS lesson_relations (
    lesson_id INT NOT NULL,
    related_lesson_id INT NOT NULL,
    relation_type ENUM('prerequisite', 'sequel', 'related') DEFAULT 'related',
    PRIMARY KEY (lesson_id, related_lesson_id, relation_type),
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
    FOREIGN KEY (related_lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
);

-- User mastery tracking per entity
CREATE TABLE IF NOT EXISTS user_knowledge_stats (
    user_id INT NOT NULL,
    entity_id INT NOT NULL,
    mastery_score INT DEFAULT 0, -- 0-100
    confidence_level INT DEFAULT 0, -- Based on repetition and consistency
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, entity_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (entity_id) REFERENCES musical_entities(id) ON DELETE CASCADE
);

-- Initial Seed Data
INSERT IGNORE INTO musical_entities (type, name, slug, description) VALUES
('skill', 'Bending', 'bending', 'The ability to lower the pitch of a note by changing airflow and mouth cavity shape.'),
('skill', 'Vibrato', 'vibrato', 'Adding a periodic change in pitch to a note for expression.'),
('skill', 'Tongue Blocking', 'tongue-blocking', 'Covering some holes with the tongue to play single notes or octaves.'),
('concept', 'Escala Pentatónica', 'escala-pentatonica', 'A five-note scale fundamental to blues and rock.'),
('concept', '12 Bar Blues', '12-bar-blues', 'The standard chord progression for blues music.'),
('technique', 'Circular Breathing', 'circular-breathing', 'Technique to play continuously without stopping for air.'),
('genre', 'Blues', 'blues', 'Traditional blues style and structure.'),
('genre', 'Jazz', 'jazz', 'Swing feel, complex harmonies and improvisation.');
