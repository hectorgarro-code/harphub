<?php
header("Access-Control-Allow-Origin: " . ($_SERVER['HTTP_ORIGIN'] ?? '*')); // Better: whitelist specific domains in production
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");
header("X-Content-Type-Options: nosniff");
header("X-Frame-Options: SAMEORIGIN");
header("X-XSS-Protection: 1; mode=block");

// Security helper functions
function sanitize_string($str) {
    return htmlspecialchars(strip_tags(trim($str)), ENT_QUOTES, 'UTF-8');
}

function get_int($var, $default = 0) {
    return isset($var) ? intval($var) : $default;
}

function validate_file($file, $allowed_extensions, $allowed_mimes) {
    if ($file['error'] !== UPLOAD_ERR_OK) return false;
    
    $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    if (!in_array($ext, $allowed_extensions)) return false;
    
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mime = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);
    
    return in_array($mime, $allowed_mimes);
}

function log_activity($pdo, $user_id, $type, $content_id = null, $metadata = []) {
    try {
        $stmt = $pdo->prepare("INSERT INTO activities (user_id, type, content_id, metadata) VALUES (?, ?, ?, ?)");
        $stmt->execute([
            $user_id,
            $type,
            $content_id,
            is_array($metadata) ? json_encode($metadata) : $metadata
        ]);
        return true;
    } catch (PDOException $e) {
        return false;
    }
}

function generate_activity_card($pdo, $user_id, $type, $title, $content, $metrics = [], $lesson_id = null, $submission_id = null) {
    try {
        $stmt = $pdo->prepare("INSERT INTO activity_cards (user_id, type, title, content, metrics_json, lesson_id, submission_id) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $user_id,
            $type,
            $title,
            $content,
            json_encode($metrics),
            $lesson_id,
            $submission_id
        ]);
        return true;
    } catch (PDOException $e) {
        return false;
    }
}

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}

require_once 'db_config.php';

try {
    // Connect to server without specifying database first
    $pdo = new PDO("mysql:host=$host;charset=utf8mb4", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Create database if it doesn't exist
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `$db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    
    // Connect to the specific database
    $pdo->exec("USE `$db`");

    $pdo->exec("CREATE TABLE IF NOT EXISTS lessons (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        youtubeId VARCHAR(100),
        category VARCHAR(50) NOT NULL,
        description TEXT,
        gpFile VARCHAR(255),
        practiceTab TEXT,
        difficulty INT DEFAULT 1,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");

    // Add columns if they do not exist
    try { $pdo->exec("ALTER TABLE lessons ADD COLUMN gpFile VARCHAR(255)"); } catch (PDOException $e) {}
    try { $pdo->exec("ALTER TABLE lessons ADD COLUMN practiceTab TEXT"); } catch (PDOException $e) {}
    try { $pdo->exec("ALTER TABLE lessons ADD COLUMN difficulty INT DEFAULT 1"); } catch (PDOException $e) {}
    try { $pdo->exec("ALTER TABLE lessons ADD COLUMN harmonica_key VARCHAR(10) DEFAULT 'ALL'"); } catch (PDOException $e) {}
    try { $pdo->exec("ALTER TABLE lessons ADD COLUMN video_bookmarks TEXT"); } catch (PDOException $e) {}
    try { $pdo->exec("ALTER TABLE lessons ADD COLUMN personal_notes TEXT"); } catch (PDOException $e) {}
    try { $pdo->exec("ALTER TABLE lessons ADD COLUMN artist VARCHAR(100)"); } catch (PDOException $e) {}
    try { $pdo->exec("ALTER TABLE lessons ADD COLUMN instrument VARCHAR(50) DEFAULT 'harmonica'"); } catch (PDOException $e) {}
    try { $pdo->exec("ALTER TABLE lessons MODIFY COLUMN youtubeId VARCHAR(100)"); } catch (PDOException $e) {}
    try { $pdo->exec("ALTER TABLE lessons ADD COLUMN attachments TEXT"); } catch (PDOException $e) {}
    try { $pdo->exec("ALTER TABLE lessons ADD COLUMN duration VARCHAR(20) DEFAULT ''"); } catch (PDOException $e) {}
    try { $pdo->exec("ALTER TABLE lessons ADD COLUMN completed TINYINT(1) DEFAULT 0"); } catch (PDOException $e) {}
    try { $pdo->exec("ALTER TABLE lessons ADD COLUMN workspace_config TEXT"); } catch (PDOException $e) {}

    // Living Lessons Migrations
    try { $pdo->exec("ALTER TABLE lessons ADD COLUMN original_creator_id INT"); } catch (PDOException $e) {}
    try { $pdo->exec("ALTER TABLE lessons ADD COLUMN parent_lesson_id INT"); } catch (PDOException $e) {}
    try { $pdo->exec("ALTER TABLE lessons ADD COLUMN visibility ENUM('private', 'public', 'remixable') DEFAULT 'public'"); } catch (PDOException $e) {}
    try { $pdo->exec("ALTER TABLE lessons ADD COLUMN remix_permission BOOLEAN DEFAULT TRUE"); } catch (PDOException $e) {}
    try { $pdo->exec("ALTER TABLE lessons ADD COLUMN fork_count INT DEFAULT 0"); } catch (PDOException $e) {}
    try { $pdo->exec("ALTER TABLE lessons ADD COLUMN practice_count INT DEFAULT 0"); } catch (PDOException $e) {}
    try { $pdo->exec("ALTER TABLE lessons ADD COLUMN save_count INT DEFAULT 0"); } catch (PDOException $e) {}

    $pdo->exec("CREATE TABLE IF NOT EXISTS lesson_blocks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        lesson_id INT NOT NULL,
        type VARCHAR(50) NOT NULL,
        content JSON,
        order_index INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");

    $pdo->exec("CREATE TABLE IF NOT EXISTS user_lesson_progress (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        lesson_id INT NOT NULL,
        completed_blocks JSON,
        practice_time_seconds INT DEFAULT 0,
        max_bpm INT DEFAULT 0,
        last_practiced TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        status ENUM('started', 'completed') DEFAULT 'started',
        UNIQUE KEY user_lesson (user_id, lesson_id)
    )");

    // Semantic Layer Migrations
    $pdo->exec("CREATE TABLE IF NOT EXISTS musical_entities (
        id INT AUTO_INCREMENT PRIMARY KEY,
        type ENUM('skill', 'concept', 'genre', 'technique') NOT NULL,
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");

    $pdo->exec("CREATE TABLE IF NOT EXISTS lesson_knowledge (
        lesson_id INT NOT NULL,
        entity_id INT NOT NULL,
        weight INT DEFAULT 1,
        PRIMARY KEY (lesson_id, entity_id)
    )");

    $pdo->exec("CREATE TABLE IF NOT EXISTS lesson_relations (
        lesson_id INT NOT NULL,
        related_lesson_id INT NOT NULL,
        relation_type ENUM('prerequisite', 'sequel', 'related') DEFAULT 'related',
        PRIMARY KEY (lesson_id, related_lesson_id, relation_type)
    )");

    $pdo->exec("CREATE TABLE IF NOT EXISTS user_knowledge_stats (
        user_id INT NOT NULL,
        entity_id INT NOT NULL,
        mastery_score INT DEFAULT 0,
        confidence_level INT DEFAULT 0,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, entity_id)
    )");

    // Collections System
    $pdo->exec("CREATE TABLE IF NOT EXISTS collections (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        visibility ENUM('private', 'public', 'remixable') DEFAULT 'private',
        cover VARCHAR(100) DEFAULT 'bg-slate-800',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )");
    try { $pdo->exec("ALTER TABLE collections ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"); } catch (PDOException $e) {}
    try { $pdo->exec("ALTER TABLE collections ADD COLUMN description TEXT"); } catch (PDOException $e) {}

    $pdo->exec("CREATE TABLE IF NOT EXISTS collection_lessons (
        collection_id INT NOT NULL,
        lesson_id INT NOT NULL,
        PRIMARY KEY (collection_id, lesson_id)
    )");

    // --- WORKSPACE SYSTEM MIGRATIONS ---
    $pdo->exec("CREATE TABLE IF NOT EXISTS user_workspaces (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        lesson_id INT NOT NULL,
        layout_config JSON,
        settings JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY user_lesson_ws (user_id, lesson_id)
    )");

    $pdo->exec("CREATE TABLE IF NOT EXISTS workspace_notes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        workspace_id INT NOT NULL,
        content TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )");

    $pdo->exec("CREATE TABLE IF NOT EXISTS workspace_bookmarks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        workspace_id INT NOT NULL,
        type ENUM('video', 'tab', 'global') DEFAULT 'global',
        title VARCHAR(255),
        position VARCHAR(100),
        metadata JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");

    // Seed initial entities if table is empty
    try {
        $countEntities = $pdo->query("SELECT COUNT(*) FROM musical_entities")->fetchColumn();
        if ($countEntities == 0) {
            $pdo->exec("INSERT INTO musical_entities (type, name, slug, description) VALUES
                ('skill', 'Bending', 'bending', 'Alteración de la afinación mediante el flujo de aire.'),
                ('skill', 'Vibrato', 'vibrato', 'Oscilación periódica del tono para expresión.'),
                ('concept', 'Escala Pentatónica', 'escala-pentatonica', 'Escala de 5 notas base del blues.'),
                ('genre', 'Blues', 'blues', 'Estructura y sentimiento tradicional de blues.')");
        }
    } catch (PDOException $e) {}

    // Universal Unification Migrations
    $pdo->exec("CREATE TABLE IF NOT EXISTS collections (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        cover_image VARCHAR(255),
        visibility ENUM('private', 'public', 'remixable') DEFAULT 'private',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");

    $pdo->exec("CREATE TABLE IF NOT EXISTS collection_lessons (
        collection_id INT NOT NULL,
        lesson_id INT NOT NULL,
        order_index INT DEFAULT 0,
        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (collection_id, lesson_id)
    )");

    $pdo->exec("CREATE TABLE IF NOT EXISTS practice_submissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        lesson_id INT NOT NULL,
        block_id VARCHAR(255),
        audio_url VARCHAR(500),
        notes TEXT,
        bpm INT,
        duration INT,
        status ENUM('pending', 'reviewed', 'archived') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");

    $pdo->exec("CREATE TABLE IF NOT EXISTS submission_reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        submission_id INT NOT NULL,
        reviewer_id INT NOT NULL,
        review_text TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY (submission_id)
    )");

    $pdo->exec("CREATE TABLE IF NOT EXISTS review_markers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        review_id INT NOT NULL,
        timestamp DECIMAL(10,2),
        comment TEXT,
        marker_type VARCHAR(50) DEFAULT 'general'
    )");

    $pdo->exec("CREATE TABLE IF NOT EXISTS learning_paths (
        id INT AUTO_INCREMENT PRIMARY KEY,
        creator_id VARCHAR(255) NOT NULL,
        original_creator_id VARCHAR(255),
        parent_path_id INT,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        cover_image VARCHAR(500),
        instrument VARCHAR(100),
        genres VARCHAR(255),
        difficulty VARCHAR(50) DEFAULT 'beginner',
        estimated_duration INT DEFAULT 0,
        visibility ENUM('public', 'private', 'unlisted') DEFAULT 'public',
        remix_permission TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )");

    $pdo->exec("CREATE TABLE IF NOT EXISTS learning_path_nodes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        path_id INT NOT NULL,
        entity_type ENUM('lesson', 'collection', 'practice', 'review', 'milestone', 'checkpoint') NOT NULL,
        entity_id VARCHAR(255),
        title VARCHAR(255),
        description TEXT,
        order_index INT DEFAULT 0,
        is_required TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");

    $pdo->exec("CREATE TABLE IF NOT EXISTS learning_path_progress (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        path_id INT NOT NULL,
        current_node_id INT,
        completed_nodes_json TEXT,
        mastery_score INT DEFAULT 0,
        status ENUM('active', 'completed', 'paused') DEFAULT 'active',
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP NULL DEFAULT NULL,
        last_activity_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");

    $pdo->exec("CREATE TABLE IF NOT EXISTS user_learning_reminders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        entity_type ENUM('path', 'lesson', 'practice', 'review_pending') NOT NULL,
        entity_id VARCHAR(255) NOT NULL,
        reminder_type VARCHAR(100) NOT NULL,
        custom_message TEXT,
        status ENUM('active', 'snoozed', 'dismissed', 'archived', 'completed') DEFAULT 'active',
        snoozed_until TIMESTAMP NULL DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )");

    try { $pdo->exec("ALTER TABLE lessons MODIFY COLUMN category VARCHAR(50) NULL"); } catch (PDOException $e) {}

    // Users and Stats tables
    $pdo->exec("CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        bio TEXT,
        avatar_url VARCHAR(255),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");

    // Migration for existing users table
    try { $pdo->exec("ALTER TABLE users ADD COLUMN email VARCHAR(255) UNIQUE"); } catch (PDOException $e) {}
    try { $pdo->exec("ALTER TABLE users ADD COLUMN bio TEXT"); } catch (PDOException $e) {}
    try { $pdo->exec("ALTER TABLE users ADD COLUMN avatar_url VARCHAR(255)"); } catch (PDOException $e) {}
    try { $pdo->exec("ALTER TABLE users ADD COLUMN full_name VARCHAR(255)"); } catch (PDOException $e) {}
    try { $pdo->exec("ALTER TABLE users ADD COLUMN musical_level VARCHAR(50) DEFAULT 'Beginner'"); } catch (PDOException $e) {}
    try { $pdo->exec("ALTER TABLE users ADD COLUMN instruments TEXT"); } catch (PDOException $e) {}

    $pdo->exec("CREATE TABLE IF NOT EXISTS follows (
        id INT AUTO_INCREMENT PRIMARY KEY,
        follower_id INT NOT NULL,
        following_id INT NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY `unique_follow` (`follower_id`, `following_id`)
    )");

    $pdo->exec("CREATE TABLE IF NOT EXISTS user_stats (
        user_id INT PRIMARY KEY,
        practiceHours FLOAT DEFAULT 0,
        streak INT DEFAULT 0,
        points INT DEFAULT 0,
        level INT DEFAULT 1,
        bendsMastered INT DEFAULT 0,
        lastPracticeDate DATE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )");

    try { $pdo->exec("ALTER TABLE user_stats ADD COLUMN points INT DEFAULT 0"); } catch (PDOException $e) {}
    try { $pdo->exec("ALTER TABLE user_stats ADD COLUMN level INT DEFAULT 1"); } catch (PDOException $e) {}
    try { $pdo->exec("ALTER TABLE user_stats MODIFY COLUMN practiceHours FLOAT DEFAULT 0"); } catch (PDOException $e) {}

    $pdo->exec("CREATE TABLE IF NOT EXISTS user_achievements (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        achievement_key VARCHAR(100),
        unlockedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_achievement (user_id, achievement_key),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )");

    $pdo->exec("CREATE TABLE IF NOT EXISTS user_blues_progress (
        user_id INT PRIMARY KEY,
        completed_weeks TEXT,
        completed_exercises TEXT,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )");

    $pdo->exec("CREATE TABLE IF NOT EXISTS backing_tracks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        rhythm_key VARCHAR(50) NOT NULL,
        note_key VARCHAR(10) NOT NULL,
        file_path VARCHAR(255) NOT NULL,
        is_global TINYINT(1) DEFAULT 0,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_track (user_id, rhythm_key, note_key)
    )");

    $pdo->exec("CREATE TABLE IF NOT EXISTS user_audio_settings (
        user_id INT PRIMARY KEY,
        eq_settings TEXT,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )");

    // Social Graph Migrations
    $pdo->exec("CREATE TABLE IF NOT EXISTS user_progress (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        entity_type ENUM('lesson', 'collection', 'path') NOT NULL,
        entity_id INT NOT NULL,
        status ENUM('started', 'completed') DEFAULT 'completed',
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_progress (user_id, entity_type, entity_id)
    )");

    $pdo->exec("CREATE TABLE IF NOT EXISTS user_saved_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        entity_type ENUM('lesson', 'collection', 'path') NOT NULL,
        entity_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_save (user_id, entity_type, entity_id)
    )");

    try { $pdo->exec("ALTER TABLE users ADD COLUMN genres TEXT"); } catch (PDOException $e) {}
    try { $pdo->exec("ALTER TABLE users ADD COLUMN featured_skills TEXT"); } catch (PDOException $e) {}

    // Learning Path Tables
    $pdo->exec("CREATE TABLE IF NOT EXISTS learning_paths (
        id INT AUTO_INCREMENT PRIMARY KEY,
        creator_id INT NOT NULL,
        original_creator_id INT,
        parent_path_id INT,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        cover_image VARCHAR(255),
        difficulty ENUM('beginner', 'intermediate', 'advanced', 'master') DEFAULT 'beginner',
        estimated_duration VARCHAR(100),
        instrument VARCHAR(100),
        genres TEXT,
        tags TEXT,
        visibility ENUM('public', 'private', 'unlisted') DEFAULT 'public',
        remix_permission TINYINT(1) DEFAULT 1,
        followers_count INT DEFAULT 0,
        forks_count INT DEFAULT 0,
        saves_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE
    )");

    try { $pdo->exec("ALTER TABLE learning_paths ADD COLUMN followers_count INT DEFAULT 0"); } catch (PDOException $e) {}
    try { $pdo->exec("ALTER TABLE learning_paths ADD COLUMN forks_count INT DEFAULT 0"); } catch (PDOException $e) {}
    try { $pdo->exec("ALTER TABLE learning_paths ADD COLUMN saves_count INT DEFAULT 0"); } catch (PDOException $e) {}
    try { $pdo->exec("ALTER TABLE learning_paths CHANGE COLUMN user_id creator_id INT NOT NULL"); } catch (PDOException $e) {}
    try { $pdo->exec("ALTER TABLE learning_paths ADD COLUMN original_creator_id INT"); } catch (PDOException $e) {}
    try { $pdo->exec("ALTER TABLE learning_paths ADD COLUMN parent_path_id INT"); } catch (PDOException $e) {}
    try { $pdo->exec("ALTER TABLE learning_paths ADD COLUMN instrument VARCHAR(100)"); } catch (PDOException $e) {}
    try { $pdo->exec("ALTER TABLE learning_paths ADD COLUMN genres TEXT"); } catch (PDOException $e) {}
    try { $pdo->exec("ALTER TABLE learning_paths ADD COLUMN tags TEXT"); } catch (PDOException $e) {}
    try { $pdo->exec("ALTER TABLE learning_paths ADD COLUMN visibility ENUM('public', 'private', 'unlisted') DEFAULT 'public'"); } catch (PDOException $e) {}
    try { $pdo->exec("ALTER TABLE learning_paths ADD COLUMN remix_permission TINYINT(1) DEFAULT 1"); } catch (PDOException $e) {}

    $pdo->exec("CREATE TABLE IF NOT EXISTS learning_path_nodes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        path_id INT NOT NULL,
        entity_type ENUM('lesson', 'collection', 'challenge') NOT NULL,
        entity_id INT NOT NULL,
        order_index INT DEFAULT 0,
        prerequisite_node_id INT DEFAULT NULL,
        estimated_time VARCHAR(50),
        milestone TINYINT(1) DEFAULT 0,
        notes TEXT,
        FOREIGN KEY (path_id) REFERENCES learning_paths(id) ON DELETE CASCADE,
        FOREIGN KEY (prerequisite_node_id) REFERENCES learning_path_nodes(id) ON DELETE SET NULL
    )");

    $pdo->exec("CREATE TABLE IF NOT EXISTS learning_path_progress (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        path_id INT NOT NULL,
        completed_nodes TEXT, -- JSON array of node IDs
        mastery FLOAT DEFAULT 0,
        current_position INT DEFAULT 0,
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP NULL,
        last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user_path (user_id, path_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (path_id) REFERENCES learning_paths(id) ON DELETE CASCADE
    )");

    $method = $_SERVER['REQUEST_METHOD'];

    if ($method === 'GET') {
        $action = $_GET['action'] ?? 'lessons';

        if ($action === 'get_profile') {
            $username = sanitize_string($_GET['username'] ?? '');
            $stmt = $pdo->prepare("SELECT id, username, full_name, bio, avatar_url, musical_level, instruments, genres, featured_skills FROM users WHERE username = ?");
            $stmt->execute([$username]);
            $user_profile = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$user_profile) {
                echo json_encode(['error' => 'User not found']);
                exit;
            }

            // Get followers/following counts
            $stmt = $pdo->prepare("SELECT COUNT(*) FROM follows WHERE following_id = ?");
            $stmt->execute([$user_profile['id']]);
            $user_profile['followers_count'] = (int)$stmt->fetchColumn();

            $stmt = $pdo->prepare("SELECT COUNT(*) FROM follows WHERE follower_id = ?");
            $stmt->execute([$user_profile['id']]);
            $user_profile['following_count'] = (int)$stmt->fetchColumn();

            // Get public asset counts
            $stmt = $pdo->prepare("SELECT COUNT(*) FROM lessons WHERE user_id = ? AND visibility = 'public'");
            $stmt->execute([$user_profile['id']]);
            $user_profile['public_lessons_count'] = (int)$stmt->fetchColumn();

            $stmt = $pdo->prepare("SELECT COUNT(*) FROM collections WHERE user_id = ? AND visibility = 'public'");
            $stmt->execute([$user_profile['id']]);
            $user_profile['public_collections_count'] = (int)$stmt->fetchColumn();

            // Get public assets
            $stmt = $pdo->prepare("SELECT id, title, category, instrument, artist, difficulty, createdAt FROM lessons WHERE user_id = ? AND visibility = 'public' ORDER BY createdAt DESC");
            $stmt->execute([$user_profile['id']]);
            $user_profile['public_lessons'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $stmt = $pdo->prepare("SELECT c.*, 
                                  (SELECT l.youtubeId FROM lessons l JOIN collection_lessons cl ON l.id = cl.lesson_id WHERE cl.collection_id = c.id AND l.youtubeId IS NOT NULL AND l.youtubeId != '' LIMIT 1) as sample_youtube_id
                                  FROM collections c WHERE c.user_id = ? AND c.visibility = 'public' ORDER BY c.created_at DESC");
            $stmt->execute([$user_profile['id']]);
            $user_profile['public_collections'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $stmt = $pdo->prepare("SELECT lp.*, 
                                  (SELECT COUNT(*) FROM learning_path_nodes WHERE path_id = lp.id) as node_count
                                  FROM learning_paths lp 
                                  WHERE lp.creator_id = ? AND lp.visibility = 'public' 
                                  ORDER BY lp.created_at DESC");
            $stmt->execute([$user_profile['id']]);
            $user_profile['public_paths'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Get recent activity
            $stmt = $pdo->prepare("SELECT a.*, 
                                  CASE 
                                    WHEN a.type IN ('lesson_new', 'lesson_fork') THEN (SELECT title FROM lessons WHERE id = a.content_id)
                                    WHEN a.type IN ('created_learning_path', 'forked_learning_path') THEN (SELECT title FROM learning_paths WHERE id = a.content_id)
                                  END as lesson_title 
                                  FROM activities a 
                                  WHERE a.user_id = ? 
                                  ORDER BY a.created_at DESC LIMIT 10");
            $stmt->execute([$user_profile['id']]);
            $user_profile['recent_activity'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Check if current user follows this profile
            $current_user_id = (int)($_GET['current_user_id'] ?? 0);
            $user_profile['is_following'] = false;
            if ($current_user_id) {
                $stmt = $pdo->prepare("SELECT COUNT(*) FROM follows WHERE follower_id = ? AND following_id = ?");
                $stmt->execute([$current_user_id, $user_profile['id']]);
                $user_profile['is_following'] = $stmt->fetchColumn() > 0;
            }

            echo json_encode($user_profile);
            exit;
        }

        if ($action === 'get_discovery') {
            $user_id = (int)($_GET['user_id'] ?? 0);

            // 1. Trending Creators
            $stmt = $pdo->prepare("SELECT DISTINCT u.id, u.username, u.avatar_url, u.full_name 
                                  FROM users u 
                                  JOIN lessons l ON u.id = l.user_id 
                                  WHERE l.visibility = 'public' 
                                  ORDER BY l.createdAt DESC LIMIT 5");
            $stmt->execute();
            $trending_creators = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // 2. Popular Collections
            $stmt = $pdo->prepare("SELECT c.*, u.username as creator_name, 
                                  (SELECT COUNT(*) FROM collection_lessons WHERE collection_id = c.id) as lesson_count,
                                  (SELECT l.youtubeId FROM lessons l JOIN collection_lessons cl ON l.id = cl.lesson_id WHERE cl.collection_id = c.id AND l.youtubeId IS NOT NULL AND l.youtubeId != '' LIMIT 1) as sample_youtube_id
                                  FROM collections c 
                                  JOIN users u ON c.user_id = u.id 
                                  WHERE c.visibility = 'public' 
                                  ORDER BY c.created_at DESC LIMIT 6");
            $stmt->execute();
            $popular_collections = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // 3. Trending Paths
            $stmt = $pdo->prepare("SELECT lp.*, u.username as creator_name,
                                  (SELECT COUNT(*) FROM learning_path_nodes WHERE path_id = lp.id) as node_count
                                  FROM learning_paths lp 
                                  JOIN users u ON lp.creator_id = u.id 
                                  WHERE lp.visibility = 'public' 
                                  ORDER BY lp.followers_count DESC LIMIT 6");
            $stmt->execute();
            $trending_paths = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // 4. Recent Public Lessons
            $stmt = $pdo->prepare("SELECT l.id, l.title, l.instrument, l.difficulty, u.username as creator_name 
                                  FROM lessons l 
                                  JOIN users u ON l.user_id = u.id 
                                  WHERE l.visibility = 'public' 
                                  ORDER BY l.createdAt DESC LIMIT 8");
            $stmt->execute();
            $recent_lessons = $stmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode([
                'success' => true,
                'creators' => $trending_creators,
                'collections' => $popular_collections,
                'paths' => $trending_paths,
                'lessons' => $recent_lessons
            ]);
            exit;
        }

        if ($action === 'get_stats' || $action === 'get_user_stats') {
            $user_id = get_int($_GET['user_id'] ?? 0);
            if (!$user_id) {
                echo json_encode(['error' => 'Invalid user_id']);
                exit;
            }
            $stmt = $pdo->prepare("SELECT * FROM user_stats WHERE user_id = ?");
            $stmt->execute([$user_id]);
            $stats = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // For get_user_stats, we also want achievements
            if ($action === 'get_user_stats') {
                $stmtA = $pdo->prepare("SELECT achievement_key, unlockedAt FROM user_achievements WHERE user_id = ?");
                $stmtA->execute([$user_id]);
                $achievements = $stmtA->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode(['success' => true, 'stats' => $stats ?: ['practiceHours' => 0, 'streak' => 0, 'points' => 0, 'level' => 1, 'bendsMastered' => 0], 'achievements' => $achievements]);
            } else {
                echo json_encode($stats ?: ['practiceHours' => 0, 'streak' => 0, 'points' => 0, 'level' => 1, 'bendsMastered' => 0]);
            }
            exit;
        }

        if ($action === 'get_achievements') {
            $user_id = get_int($_GET['user_id'] ?? 0);
            if (!$user_id) {
                echo json_encode(['error' => 'Invalid user_id']);
                exit;
            }
            $stmt = $pdo->prepare("SELECT achievement_key, unlockedAt FROM user_achievements WHERE user_id = ?");
            $stmt->execute([$user_id]);
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
            exit;
        }

        if ($action === 'get_blues_progress') {
            $user_id = get_int($_GET['user_id'] ?? 0);
            if (!$user_id) {
                echo json_encode(['error' => 'Invalid user_id']);
                exit;
            }
            $stmt = $pdo->prepare("SELECT completed_weeks, completed_exercises FROM user_blues_progress WHERE user_id = ?");
            $stmt->execute([$user_id]);
            $res = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($res) {
                echo json_encode([
                    'weeks' => json_decode($res['completed_weeks'] ?: '[]'),
                    'exercises' => json_decode($res['completed_exercises'] ?: '{}')
                ]);
            } else {
                echo json_encode(['weeks' => [], 'exercises' => (object)[]]);
            }
            exit;
        }

        if ($action === 'get_audio_settings') {
            $user_id = get_int($_GET['user_id'] ?? 0);
            if (!$user_id) {
                echo json_encode(['error' => 'Invalid user_id']);
                exit;
            }
            $stmt = $pdo->prepare("SELECT eq_settings FROM user_audio_settings WHERE user_id = ?");
            $stmt->execute([$user_id]);
            $res = $stmt->fetch(PDO::FETCH_ASSOC);
            echo json_encode($res ? json_decode($res['eq_settings']) : null);
            exit;
        }

        if ($action === 'get_workspace') {
            $user_id = get_int($_GET['user_id'] ?? 0);
            $lesson_id = get_int($_GET['lesson_id'] ?? 0);
            if (!$user_id || !$lesson_id) {
                echo json_encode(['error' => 'Missing parameters']);
                exit;
            }

            // 1. Fetch or create workspace
            $stmt = $pdo->prepare("SELECT * FROM user_workspaces WHERE user_id = ? AND lesson_id = ?");
            $stmt->execute([$user_id, $lesson_id]);
            $workspace = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$workspace) {
                // Return default empty workspace state
                $workspace = [
                    'layout_config' => null,
                    'settings' => null,
                    'notes' => [],
                    'bookmarks' => []
                ];
            } else {
                $workspace['layout_config'] = json_decode($workspace['layout_config'], true);
                $workspace['settings'] = json_decode($workspace['settings'], true);

                // 2. Fetch Notes
                $stmtN = $pdo->prepare("SELECT * FROM workspace_notes WHERE workspace_id = ? ORDER BY created_at DESC");
                $stmtN->execute([$workspace['id']]);
                $workspace['notes'] = $stmtN->fetchAll(PDO::FETCH_ASSOC);

                // 3. Fetch Bookmarks
                $stmtB = $pdo->prepare("SELECT * FROM workspace_bookmarks WHERE workspace_id = ? ORDER BY created_at ASC");
                $stmtB->execute([$workspace['id']]);
                $workspace['bookmarks'] = $stmtB->fetchAll(PDO::FETCH_ASSOC);
                foreach ($workspace['bookmarks'] as &$bm) {
                    $bm['metadata'] = json_decode($bm['metadata'], true);
                }
            }

            echo json_encode(['success' => true, 'workspace' => $workspace]);
            exit;
        }

        if ($action === 'get_feed') {
            $user_id = $_GET['user_id'] ?? null;
            $type = $_GET['type'] ?? 'all'; 
            $page = intval($_GET['page'] ?? 0);
            $limit = 10;
            $offset = $page * $limit;

            $query = "SELECT a.*, u.username, u.avatar_url, u.full_name 
                      FROM activities a 
                      JOIN users u ON a.user_id = u.id ";
            
            $params = [];
            if ($type === 'following' && $user_id) {
                $query .= " WHERE a.user_id IN (SELECT following_id FROM follows WHERE follower_id = ?) ";
                $params[] = $user_id;
            } elseif ($type === 'for_you' && $user_id) {
                $query .= " ORDER BY a.created_at DESC ";
            } else {
                $query .= " ORDER BY a.created_at DESC ";
            }

            $query .= " LIMIT $limit OFFSET $offset";
            
            $stmt = $pdo->prepare($query);
            $stmt->execute($params);
            $activities = $stmt->fetchAll(PDO::FETCH_ASSOC);

            foreach ($activities as &$act) {
                $act['metadata'] = json_decode($act['metadata'], true);
                if ($act['content_id'] && ($act['type'] === 'lesson_new' || $act['type'] === 'lesson_fork')) {
                    $stmtL = $pdo->prepare("SELECT title, difficulty, instrument FROM lessons WHERE id = ?");
                    $stmtL->execute([$act['content_id']]);
                    $act['content_data'] = $stmtL->fetch(PDO::FETCH_ASSOC);
                }
            }

            echo json_encode(['success' => true, 'activities' => $activities]);
            exit;
        }

        if ($action === 'get_lesson_detailed') {
            $lesson_id = $_GET['id'] ?? null;
            if (!$lesson_id) {
                http_response_code(400); echo json_encode(['error' => 'Missing lesson ID']); exit;
            }

            $stmt = $pdo->prepare("SELECT l.*, u.username as creator_name 
                                  FROM lessons l 
                                  JOIN users u ON l.user_id = u.id 
                                  WHERE l.id = ?");
            $stmt->execute([$lesson_id]);
            $lesson = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$lesson) {
                http_response_code(404); echo json_encode(['error' => 'Lesson not found']); exit;
            }

            $stmtB = $pdo->prepare("SELECT * FROM lesson_blocks WHERE lesson_id = ? ORDER BY order_index ASC");
            $stmtB->execute([$lesson_id]);
            $blocks = $stmtB->fetchAll(PDO::FETCH_ASSOC);

            // HYBRID SYSTEM: If no blocks and is a fork, fetch from parent
            if (empty($blocks) && !empty($lesson['parent_lesson_id'])) {
                $stmtB->execute([$lesson['parent_lesson_id']]);
                $blocks = $stmtB->fetchAll(PDO::FETCH_ASSOC);
            }

            foreach ($blocks as &$block) {
                $block['content'] = json_decode($block['content'], true);
            }

            // Virtualize blocks if empty (Legacy support)
            if (empty($blocks)) {
                // ... (Existing virtualization logic remains the same)
                $virtualIndex = 0;
                if (!empty($lesson['youtubeId'])) {
                    $blocks[] = [
                        'type' => 'video',
                        'content' => ['youtubeId' => $lesson['youtubeId']],
                        'order_index' => $virtualIndex++
                    ];
                }
                if (!empty($lesson['description'])) {
                    $blocks[] = [
                        'type' => 'text',
                        'content' => ['text' => $lesson['description']],
                        'order_index' => $virtualIndex++
                    ];
                }
                if (!empty($lesson['practiceTab'])) {
                    $blocks[] = [
                        'type' => 'sea-tab',
                        'content' => ['tab' => $lesson['practiceTab'], 'title' => 'Tablatura SEA'],
                        'order_index' => $virtualIndex++
                    ];
                }
                if (!empty($lesson['gpFile'])) {
                    $blocks[] = [
                        'type' => 'gp-tab',
                        'content' => ['fileUrl' => $lesson['gpFile'], 'title' => 'Partitura Guitar Pro'],
                        'order_index' => $virtualIndex++
                    ];
                }
                if (!empty($lesson['personal_notes'])) {
                    $blocks[] = [
                        'type' => 'callout',
                        'content' => ['title' => 'Mis Notas', 'text' => $lesson['personal_notes'], 'style' => 'info'],
                        'order_index' => $virtualIndex++
                    ];
                }
            }

            // Get semantic knowledge
            $stmtK = $pdo->prepare("SELECT e.*, lk.weight 
                                   FROM musical_entities e 
                                   JOIN lesson_knowledge lk ON e.id = lk.entity_id 
                                   WHERE lk.lesson_id = ?");
            $stmtK->execute([$lesson_id]);
            $knowledge = $stmtK->fetchAll(PDO::FETCH_ASSOC);

            // HYBRID SYSTEM: If no knowledge and is a fork, fetch from parent
            if (empty($knowledge) && !empty($lesson['parent_lesson_id'])) {
                $stmtK->execute([$lesson['parent_lesson_id']]);
                $knowledge = $stmtK->fetchAll(PDO::FETCH_ASSOC);
            }

            // Get relations
            $stmtR = $pdo->prepare("SELECT r.relation_type, l.id, l.title, l.difficulty 
                                   FROM lesson_relations r 
                                   JOIN lessons l ON r.related_lesson_id = l.id 
                                   WHERE r.lesson_id = ?");
            $stmtR->execute([$lesson_id]);
            $relations = $stmtR->fetchAll(PDO::FETCH_ASSOC);

            // Check progress
            $user_id = (int)($_GET['user_id'] ?? 0);
            $is_completed = false;
            if ($user_id) {
                $stmtP = $pdo->prepare("SELECT COUNT(*) FROM user_progress WHERE user_id = ? AND entity_type = 'lesson' AND entity_id = ?");
                $stmtP->execute([$user_id, $lesson_id]);
                $is_completed = $stmtP->fetchColumn() > 0;
            }

            // Workspace Data if user_id is provided
            $workspace = null;
            $user_id_param = get_int($_GET['user_id'] ?? 0);
            if ($user_id_param) {
                $stmtWS = $pdo->prepare("SELECT * FROM user_workspaces WHERE user_id = ? AND lesson_id = ?");
                $stmtWS->execute([$user_id_param, $lesson_id]);
                $workspace = $stmtWS->fetch(PDO::FETCH_ASSOC);
                if ($workspace) {
                    $workspace['layout_config'] = json_decode($workspace['layout_config'], true);
                    $workspace['settings'] = json_decode($workspace['settings'], true);
                    
                    // Fetch Notes
                    $stmtN = $pdo->prepare("SELECT * FROM workspace_notes WHERE workspace_id = ? ORDER BY created_at DESC");
                    $stmtN->execute([$workspace['id']]);
                    $workspace['notes'] = $stmtN->fetchAll(PDO::FETCH_ASSOC);

                    // Fetch Bookmarks
                    $stmtB = $pdo->prepare("SELECT * FROM workspace_bookmarks WHERE workspace_id = ? ORDER BY created_at ASC");
                    $stmtB->execute([$workspace['id']]);
                    $workspace['bookmarks'] = $stmtB->fetchAll(PDO::FETCH_ASSOC);
                    foreach ($workspace['bookmarks'] as &$bm) {
                        $bm['metadata'] = json_decode($bm['metadata'], true);
                    }
                }
            }

            // Check if saved
            $is_saved = false;
            if ($user_id_param) {
                $stmtS = $pdo->prepare("SELECT COUNT(*) FROM user_saved_items WHERE user_id = ? AND entity_type = 'lesson' AND entity_id = ?");
                $stmtS->execute([$user_id_param, $lesson_id]);
                $is_saved = $stmtS->fetchColumn() > 0;
            }

            echo json_encode([
                'success' => true, 
                'lesson' => $lesson, 
                'blocks' => $blocks, 
                'knowledge' => $knowledge, 
                'relations' => $relations,
                'is_completed' => $is_completed,
                'is_saved' => $is_saved,
                'workspace' => $workspace
            ]);
            exit;
        }

        if ($action === 'get_learning_paths') {
            $user_id = get_int($_GET['user_id'] ?? 0);
            $filter = sanitize_string($_GET['filter'] ?? 'all'); // all, popular, mine
            
            $query = "SELECT lp.*, u.username as creator_name, 
                     (SELECT COUNT(*) FROM learning_path_nodes WHERE path_id = lp.id) as node_count,
                     (SELECT COUNT(*) FROM learning_path_progress WHERE path_id = lp.id) as followers_count
                     FROM learning_paths lp 
                     JOIN users u ON lp.creator_id = u.id ";
            $params = [];

            if ($filter === 'mine') {
                $query .= " WHERE lp.creator_id = ? ";
                $params[] = $user_id;
            } else if ($filter === 'popular') {
                $query .= " WHERE lp.visibility = 'public' ORDER BY (SELECT COUNT(*) FROM learning_path_progress WHERE path_id = lp.id) DESC ";
            } else {
                $query .= " WHERE lp.visibility = 'public' ";
            }

            $query .= " ORDER BY lp.created_at DESC LIMIT 20";
            
            $stmt = $pdo->prepare($query);
            $stmt->execute($params);
            $paths = $stmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode(['success' => true, 'paths' => $paths]);
            exit;
        }

        if ($action === 'get_learning_path_detailed') {
            $path_id = get_int($_GET['id'] ?? 0);
            $user_id = get_int($_GET['user_id'] ?? 0);

            if (!$path_id) {
                http_response_code(400); echo json_encode(['error' => 'Missing path ID']); exit;
            }

            // 1. Path Metadata
            $stmt = $pdo->prepare("SELECT lp.*, u.username as creator_name 
                                  FROM learning_paths lp 
                                  JOIN users u ON lp.creator_id = u.id 
                                  WHERE lp.id = ?");
            $stmt->execute([$path_id]);
            $path = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$path) {
                http_response_code(404); echo json_encode(['error' => 'Path not found']); exit;
            }

            // 2. Nodes
            $stmtN = $pdo->prepare("SELECT n.*, 
                                   CASE 
                                     WHEN n.entity_type = 'lesson' THEN (SELECT title FROM lessons WHERE id = n.entity_id)
                                     WHEN n.entity_type = 'collection' THEN (SELECT title FROM collections WHERE id = n.entity_id)
                                   END as entity_title,
                                   CASE 
                                     WHEN n.entity_type = 'lesson' THEN (SELECT difficulty FROM lessons WHERE id = n.entity_id)
                                     WHEN n.entity_type = 'collection' THEN 'intermediate' -- Placeholder
                                   END as entity_difficulty
                                   FROM learning_path_nodes n 
                                   WHERE n.path_id = ? 
                                   ORDER BY n.order_index ASC");
            $stmtN->execute([$path_id]);
            $nodes = $stmtN->fetchAll(PDO::FETCH_ASSOC);

            // 3. User Progress
            $progress = null;
            if ($user_id) {
                $stmtP = $pdo->prepare("SELECT * FROM learning_path_progress WHERE user_id = ? AND path_id = ?");
                $stmtP->execute([$user_id, $path_id]);
                $progress = $stmtP->fetch(PDO::FETCH_ASSOC);
                if ($progress) {
                    $progress['completed_nodes'] = json_decode($progress['completed_nodes'], true) ?: [];
                }
            }

            echo json_encode([
                'success' => true,
                'path' => $path,
                'nodes' => $nodes,
                'progress' => $progress
            ]);
            exit;
        }

        if ($action === 'get_smart_reminders') {
            $user_id = sanitize_string($_GET['user_id'] ?? '');
            if (!$user_id) {
                http_response_code(400); echo json_encode(['error' => 'Missing user ID']); exit;
            }

            // 1. Detección Inteligente: Paths activos sin movimiento en 2 días
            $stmtPath = $pdo->prepare("
                SELECT path_id FROM learning_path_progress 
                WHERE user_id = ? AND status = 'active' 
                AND last_activity_at < DATE_SUB(NOW(), INTERVAL 2 DAY)
            ");
            $stmtPath->execute([$user_id]);
            $stalled_paths = $stmtPath->fetchAll(PDO::FETCH_COLUMN);

            foreach ($stalled_paths as $pid) {
                // Verificar si ya hay un recordatorio activo
                $stmtCheck = $pdo->prepare("SELECT id FROM user_learning_reminders WHERE user_id = ? AND entity_type = 'path' AND entity_id = ? AND status IN ('active', 'snoozed')");
                $stmtCheck->execute([$user_id, $pid]);
                if (!$stmtCheck->fetchColumn()) {
                    $stmtIns = $pdo->prepare("INSERT INTO user_learning_reminders (user_id, entity_type, entity_id, reminder_type, custom_message) VALUES (?, 'path', ?, 'resume_path', 'Retoma tu aprendizaje donde lo dejaste')");
                    $stmtIns->execute([$user_id, $pid]);
                }
            }

            // 2. Detección: Lecciones empezadas no completadas recientemente
            $stmtLesson = $pdo->prepare("
                SELECT lesson_id FROM user_lesson_progress 
                WHERE user_id = ? AND status = 'started' 
                AND last_practiced > DATE_SUB(NOW(), INTERVAL 7 DAY)
                AND last_practiced < DATE_SUB(NOW(), INTERVAL 1 DAY)
            ");
            $stmtLesson->execute([$user_id]);
            $pending_lessons = $stmtLesson->fetchAll(PDO::FETCH_COLUMN);
            
            foreach ($pending_lessons as $lid) {
                $stmtCheck = $pdo->prepare("SELECT id FROM user_learning_reminders WHERE user_id = ? AND entity_type = 'lesson' AND entity_id = ? AND status IN ('active', 'snoozed')");
                $stmtCheck->execute([$user_id, $lid]);
                if (!$stmtCheck->fetchColumn()) {
                    $stmtIns = $pdo->prepare("INSERT INTO user_learning_reminders (user_id, entity_type, entity_id, reminder_type, custom_message) VALUES (?, 'lesson', ?, 'finish_lesson', 'Continúa trabajando en esta lección')");
                    $stmtIns->execute([$user_id, $lid]);
                }
            }

            // Fetch active reminders
            $stmt = $pdo->prepare("
                SELECT r.*, 
                CASE 
                    WHEN r.entity_type = 'path' THEN (SELECT title FROM learning_paths WHERE id = r.entity_id)
                    WHEN r.entity_type = 'lesson' THEN (SELECT title FROM lessons WHERE id = r.entity_id)
                END as entity_title
                FROM user_learning_reminders r
                WHERE r.user_id = ? AND r.status = 'active'
                ORDER BY r.created_at DESC
            ");
            $stmt->execute([$user_id]);
            $reminders = $stmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode(['success' => true, 'reminders' => $reminders]);
            exit;
        }

        if ($action === 'get_backing_tracks') {
            $user_id = $_GET['user_id'] ?? 0;
            
            // Get global tracks (user_id = 1 or is_global = 1)
            $stmt = $pdo->prepare("SELECT rhythm_key, note_key, file_path, 'global' as type FROM backing_tracks WHERE is_global = 1 OR user_id = 1");
            $stmt->execute();
            $global = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Get user tracks
            $user = [];
            if ($user_id > 1) {
                $stmt = $pdo->prepare("SELECT rhythm_key, note_key, file_path, 'user' as type FROM backing_tracks WHERE user_id = ? AND is_global = 0");
                $stmt->execute([$user_id]);
                $user = $stmt->fetchAll(PDO::FETCH_ASSOC);
            }
            
            echo json_encode(['success' => true, 'global' => $global, 'user' => $user]);
            exit;
        }

        if ($action === 'get_collections') {
            try {
                $user_id = get_int($_GET['user_id'] ?? 0);
                
                // Migration (only when viewing collections)
                try {
                    $stmtCats = $pdo->prepare("SELECT DISTINCT category FROM lessons WHERE user_id = ?");
                    $stmtCats->execute([$user_id]);
                    $allCats = $stmtCats->fetchAll(PDO::FETCH_COLUMN);
                    foreach ($allCats as $cat) {
                        if (!$cat) continue;
                        
                        $stmtCheck = $pdo->prepare("SELECT id FROM collections WHERE user_id = ? AND title = ?");
                        $stmtCheck->execute([$user_id, $cat]);
                        $colId = $stmtCheck->fetchColumn();
                        
                        if (!$colId) {
                            $stmtIns = $pdo->prepare("INSERT INTO collections (user_id, title, description) VALUES (?, ?, ?)");
                            $stmtIns->execute([$user_id, $cat, "Colección automática de $cat"]);
                            $colId = $pdo->lastInsertId();
                        }
                        
                        $stmtRel = $pdo->prepare("INSERT IGNORE INTO collection_lessons (collection_id, lesson_id) 
                                       SELECT ?, id FROM lessons WHERE user_id = ? AND category = ?");
                        $stmtRel->execute([$colId, $user_id, $cat]);
                    }
                } catch (PDOException $e) {
                    error_log("Internal Migration error: " . $e->getMessage());
                }

                $stmt = $pdo->prepare("SELECT c.*, 
                                      (SELECT COUNT(*) FROM collection_lessons WHERE collection_id = c.id) as lesson_count,
                                      (SELECT l.youtubeId FROM lessons l JOIN collection_lessons cl ON l.id = cl.lesson_id WHERE cl.collection_id = c.id AND l.youtubeId IS NOT NULL AND l.youtubeId != '' LIMIT 1) as sample_youtube_id
                                      FROM collections c 
                                      WHERE c.user_id = ? OR c.visibility = 'public' 
                                      ORDER BY c.updated_at DESC");
                $stmt->execute([$user_id]);
                $collections = $stmt->fetchAll(PDO::FETCH_ASSOC);

                echo json_encode(['success' => true, 'collections' => $collections]);
            } catch (Exception $e) {
                http_response_code(500);
                echo json_encode(['success' => false, 'error' => $e->getMessage()]);
            }
            exit;
        }

        if ($action === 'get_submissions') {
            $user_id = $_GET['user_id'] ?? null;
            $lesson_id = $_GET['lesson_id'] ?? null;
            
            $query = "SELECT s.*, r.review_text, r.created_at as reviewed_at 
                      FROM practice_submissions s 
                      LEFT JOIN submission_reviews r ON s.id = r.submission_id 
                      WHERE 1=1";
            $params = [];
            if ($user_id) { $query .= " AND s.user_id = ?"; $params[] = $user_id; }
            if ($lesson_id) { $query .= " AND s.lesson_id = ?"; $params[] = $lesson_id; }
            
            $query .= " ORDER BY s.created_at DESC";
            $stmt = $pdo->prepare($query);
            $stmt->execute($params);
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
            exit;
        }

        if ($action === 'get_review_queue') {
            $creator_id = $_GET['creator_id'] ?? null;
            $query = "SELECT s.*, u.username as student_name, l.title as lesson_title 
                      FROM practice_submissions s 
                      JOIN users u ON s.user_id = u.id 
                      JOIN lessons l ON s.lesson_id = l.id";
            $params = [];
            if ($creator_id) {
                $query .= " WHERE l.user_id = ?";
                $params[] = $creator_id;
            }
            $query .= " ORDER BY s.created_at DESC";
            $stmt = $pdo->prepare($query);
            $stmt->execute($params);
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
            exit;
        }

        if ($action === 'get_submission_details') {
            $id = get_int($_GET['id'] ?? 0);
            if (!$id) { http_response_code(400); echo json_encode(['error' => 'Missing ID']); exit; }

            $stmt = $pdo->prepare("SELECT s.*, u.username as student_name, l.title as lesson_title 
                                  FROM practice_submissions s 
                                  JOIN users u ON s.user_id = u.id 
                                  JOIN lessons l ON s.lesson_id = l.id 
                                  WHERE s.id = ?");
            $stmt->execute([$id]);
            $submission = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($submission) {
                $stmtR = $pdo->prepare("SELECT * FROM submission_reviews WHERE submission_id = ?");
                $stmtR->execute([$id]);
                $submission['review'] = $stmtR->fetch(PDO::FETCH_ASSOC);
                
                if ($submission['review']) {
                    $stmtM = $pdo->prepare("SELECT * FROM review_markers WHERE review_id = ? ORDER BY timestamp ASC");
                    $stmtM->execute([$submission['review']['id']]);
                    $submission['review']['markers'] = $stmtM->fetchAll(PDO::FETCH_ASSOC);
                }
            }
            echo json_encode($submission);
            exit;
        }

        if ($action === 'get_practice_stats') {
            $user_id = get_int($_GET['user_id'] ?? 0);
            if (!$user_id) { http_response_code(400); echo json_encode(['error' => 'Missing user_id']); exit; }

            // Get overview stats
            $stmt = $pdo->prepare("SELECT 
                                    SUM(duration_minutes) as total_minutes, 
                                    COUNT(*) as sessions_count 
                                   FROM practice_sessions 
                                   WHERE user_id = ?");
            $stmt->execute([$user_id]);
            $overview = $stmt->fetch(PDO::FETCH_ASSOC);

            // Get daily activity for the last 365 days
            $stmtD = $pdo->prepare("SELECT 
                                    DATE(started_at) as date, 
                                    SUM(duration_minutes) as minutes 
                                   FROM practice_sessions 
                                   WHERE user_id = ? AND started_at >= DATE_SUB(NOW(), INTERVAL 365 DAY)
                                   GROUP BY DATE(started_at)");
            $stmtD->execute([$user_id]);
            $daily = $stmtD->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode([
                'success' => true, 
                'overview' => $overview,
                'daily' => $daily
            ]);
            exit;
        }
        if ($action === 'get_activity_cards') {
            $user_id = $_GET['user_id'] ?? null;
            $type = $_GET['type'] ?? 'all'; // 'all', 'mine', 'following'
            
            $query = "SELECT a.*, u.username, u.avatar_url, l.title as lesson_title 
                      FROM activity_cards a 
                      JOIN users u ON a.user_id = u.id 
                      LEFT JOIN lessons l ON a.lesson_id = l.id 
                      WHERE a.visibility = 'public'";
            $params = [];
            
            if ($type === 'mine' && $user_id) {
                $query = str_replace("a.visibility = 'public'", "a.user_id = ?", $query);
                $params[] = $user_id;
            }
            
            $query .= " ORDER BY a.created_at DESC LIMIT 50";
            $stmt = $pdo->prepare($query);
            $stmt->execute($params);
            echo json_encode(['success' => true, 'activities' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
            exit;
        }

        if ($action === 'get_discovery') {
            $user_id = get_int($_GET['user_id'] ?? 0);
            
            // Trending Creators
            $creators = $pdo->query("SELECT id, username, full_name, avatar_url 
                                    FROM users 
                                    ORDER BY id DESC LIMIT 5")->fetchAll(PDO::FETCH_ASSOC);
            
            // Popular Collections
            $collections = $pdo->query("SELECT * FROM collections ORDER BY id DESC LIMIT 4")->fetchAll(PDO::FETCH_ASSOC);
            
            // Trending Paths
            $paths = $pdo->query("SELECT p.*, u.username as creator_name,
                                 (SELECT COUNT(*) FROM learning_path_nodes WHERE path_id = p.id) as node_count,
                                 (SELECT COUNT(*) FROM learning_path_progress WHERE path_id = p.id) as followers_count
                                 FROM learning_paths p 
                                 JOIN users u ON p.creator_id = u.id 
                                 ORDER BY followers_count DESC, p.id DESC LIMIT 3")->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode([
                'success' => true,
                'creators' => $creators,
                'collections' => $collections,
                'paths' => $paths
            ]);
            exit;
        }
        if ($action === 'get_review_queue') {
            $creator_id = get_int($_GET['creator_id'] ?? 0);
            if (!$creator_id) { echo json_encode([]); exit; }
            
            $stmt = $pdo->prepare("SELECT s.*, l.title as lesson_title, u.username as student_name, u.avatar_url 
                                  FROM practice_submissions s 
                                  JOIN lessons l ON s.lesson_id = l.id 
                                  JOIN users u ON s.user_id = u.id 
                                  WHERE l.user_id = ? 
                                  ORDER BY s.created_at DESC");
            $stmt->execute([$creator_id]);
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
            exit;
        }

        if ($action === 'lessons' || $action === 'get_lessons') {
            $user_id = get_int($_GET['user_id'] ?? 0);
            if (!$user_id) {
                echo json_encode([]);
                exit;
            }
            $stmt = $pdo->prepare("SELECT * FROM lessons WHERE user_id = ? ORDER BY createdAt DESC");
            $stmt->execute([$user_id]);
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
            exit;
        }

        if ($action === 'get_collections') {
            $user_id = get_int($_GET['user_id'] ?? 0);
            if (!$user_id) { echo json_encode(['success' => false, 'error' => 'Missing user_id']); exit; }
            $stmt = $pdo->prepare("SELECT * FROM collections WHERE user_id = ? ORDER BY created_at DESC");
            $stmt->execute([$user_id]);
            echo json_encode(['success' => true, 'collections' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
            exit;
        }

    } elseif ($method === 'POST') {
        $data = null;
        $contentType = isset($_SERVER["CONTENT_TYPE"]) ? trim($_SERVER["CONTENT_TYPE"]) : '';

        // Handle JSON or Multipart form data
        if (strpos($contentType, 'application/json') !== false) {
            $data = json_decode(file_get_contents("php://input"), true);
        } else {
            $data = $_POST;
        }

        if (!$data) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid data']);
            exit;
        }

        $action = sanitize_string($data['action'] ?? 'add_lesson');

        if ($action === 'upload_audio') {
            if (!isset($_FILES['audio'])) {
                http_response_code(400); echo json_encode(['error' => 'No file uploaded']); exit;
            }
            $file = $_FILES['audio'];
            $upload_dir = 'uploads/practice/';
            if (!is_dir($upload_dir)) mkdir($upload_dir, 0777, true);
            
            $filename = time() . '_' . bin2hex(random_bytes(8)) . '.webm';
            $target_path = $upload_dir . $filename;
            
            if (move_uploaded_file($file['tmp_name'], $target_path)) {
                echo json_encode(['success' => true, 'url' => $target_path]);
            } else {
                http_response_code(500); echo json_encode(['error' => 'Upload failed']);
            }
            exit;
        }

        if ($action === 'submit_practice') {
            $user_id = get_int($data['user_id'] ?? 0);
            $lesson_id = get_int($data['lesson_id'] ?? 0);
            $audio_url = sanitize_string($data['audio_url'] ?? '');
            $notes = sanitize_string($data['notes'] ?? '');
            $bpm = get_int($data['bpm'] ?? 0);
            $duration = get_int($data['duration'] ?? 0);
            
            if (!$user_id || !$lesson_id || !$audio_url) {
                http_response_code(400); echo json_encode(['error' => 'Missing required data']); exit;
            }

            $stmt = $pdo->prepare("INSERT INTO practice_submissions (user_id, lesson_id, audio_url, notes, bpm, duration) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute([$user_id, $lesson_id, $audio_url, $notes, $bpm, $duration]);
            $submission_id = $pdo->lastInsertId();
            
            log_activity($pdo, $user_id, 'practice_submitted', $submission_id, ['lesson_id' => $lesson_id]);
            
            // Generate Activity Card for first submission or milestone
            generate_activity_card($pdo, $user_id, 'first_submission', 'Nueva práctica enviada', 'Compartió su progreso para revisión técnica.', ['bpm' => $bpm, 'duration' => $duration], $lesson_id, $submission_id);

            echo json_encode(['success' => true, 'submission_id' => $submission_id]);
            exit;
        }

        if ($action === 'start_practice_session') {
            $user_id = get_int($data['user_id'] ?? 0);
            $lesson_id = get_int($data['lesson_id'] ?? 0);
            $instrument = sanitize_string($data['instrument'] ?? 'harmonica');
            
            if (!$user_id) { http_response_code(400); echo json_encode(['error' => 'Missing user_id']); exit; }

            $stmt = $pdo->prepare("INSERT INTO practice_sessions (user_id, lesson_id, instrument) VALUES (?, ?, ?)");
            $stmt->execute([$user_id, $lesson_id, $instrument]);
            
            echo json_encode(['success' => true, 'session_id' => $pdo->lastInsertId()]);
            exit;
        }

        if ($action === 'end_practice_session') {
            $session_id = get_int($data['session_id'] ?? 0);
            $duration = get_int($data['duration_minutes'] ?? 0);
            $max_bpm = get_int($data['max_bpm'] ?? 0);
            $loops = get_int($data['loops_used'] ?? 0);
            $metadata = $data['metadata'] ?? [];

            if (!$session_id) { http_response_code(400); echo json_encode(['error' => 'Missing session_id']); exit; }

            $stmt = $pdo->prepare("UPDATE practice_sessions SET ended_at = NOW(), duration_minutes = ?, max_bpm = ?, loops_used = ?, metadata_json = ? WHERE id = ?");
            $stmt->execute([$duration, $max_bpm, $loops, json_encode($metadata), $session_id]);

            // Fetch session info for activity evaluation
            $stmtS = $pdo->prepare("SELECT user_id, lesson_id FROM practice_sessions WHERE id = ?");
            $stmtS->execute([$session_id]);
            $session = $stmtS->fetch();

            if ($session) {
                // Milestone: 30+ min session
                if ($duration >= 30) {
                    generate_activity_card($pdo, $session['user_id'], 'practice_session', 'Sesión de práctica intensa', "Practicó durante $duration minutos seguidos.", ['duration' => $duration, 'bpm' => $max_bpm], $session['lesson_id']);
                }
                
                // Milestone: New BPM Record (Simulated check)
                if ($max_bpm >= 120) {
                    generate_activity_card($pdo, $session['user_id'], 'bpm_record', 'Nuevo récord de velocidad', "Alcanzó los $max_bpm BPM con gran consistencia.", ['bpm' => $max_bpm], $session['lesson_id']);
                }
            }

            echo json_encode(['success' => true]);
            exit;
        }

        if ($action === 'submit_review') {
            $submission_id = get_int($data['submission_id'] ?? 0);
            $reviewer_id = get_int($data['reviewer_id'] ?? 0);
            $review_text = sanitize_string($data['review_text'] ?? '');
            $markers = $data['markers'] ?? [];
            
            if (!$submission_id || !$reviewer_id) {
                http_response_code(400); echo json_encode(['error' => 'Missing required data']); exit;
            }

            $pdo->beginTransaction();
            try {
                $stmt = $pdo->prepare("INSERT INTO submission_reviews (submission_id, reviewer_id, review_text) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE reviewer_id=?, review_text=?");
                $stmt->execute([$submission_id, $reviewer_id, $review_text, $reviewer_id, $review_text]);
                
                $stmtId = $pdo->prepare("SELECT id FROM submission_reviews WHERE submission_id = ?");
                $stmtId->execute([$submission_id]);
                $review_id = $stmtId->fetchColumn();
                
                // Clear old markers
                $pdo->prepare("DELETE FROM review_markers WHERE review_id = ?")->execute([$review_id]);
                
                foreach ($markers as $marker) {
                    $stmtM = $pdo->prepare("INSERT INTO review_markers (review_id, timestamp, comment, marker_type) VALUES (?, ?, ?, ?)");
                    $stmtM->execute([
                        $review_id, 
                        $marker['timestamp'], 
                        sanitize_string($marker['comment']), 
                        sanitize_string($marker['marker_type'] ?? 'general')
                    ]);
                }
                
                $pdo->prepare("UPDATE practice_submissions SET status = 'reviewed' WHERE id = ?")->execute([$submission_id]);
                $pdo->commit();
                
                log_activity($pdo, $reviewer_id, 'review_completed', $submission_id);
                
                // Notify student via activity card
                $stmtSub = $pdo->prepare("SELECT user_id, lesson_id FROM practice_submissions WHERE id = ?");
                $stmtSub->execute([$submission_id]);
                $sub = $stmtSub->fetch();
                if ($sub) {
                    generate_activity_card($pdo, $sub['user_id'], 'review_received', 'Feedback técnico recibido', 'Su última práctica ha sido revisada por un instructor.', ['submission_id' => $submission_id], $sub['lesson_id'], $submission_id);
                }

                echo json_encode(['success' => true]);
            } catch (Exception $e) {
                $pdo->rollBack();
                http_response_code(500); echo json_encode(['error' => $e->getMessage()]);
            }
            exit;
        }

        if ($action === 'update_profile') {
            $user_id = get_int($data['user_id'] ?? 0);
            $full_name = sanitize_string($data['full_name'] ?? '');
            $bio = sanitize_string($data['bio'] ?? '');
            $musical_level = sanitize_string($data['musical_level'] ?? 'Beginner');
            $instruments = sanitize_string($data['instruments'] ?? '');
            $avatar_url = sanitize_string($data['avatar_url'] ?? '');

            $stmt = $pdo->prepare("UPDATE users SET full_name = ?, bio = ?, musical_level = ?, instruments = ?, avatar_url = ? WHERE id = ?");
            $stmt->execute([$full_name, $bio, $musical_level, $instruments, $avatar_url, $user_id]);
            
            echo json_encode(['success' => true]);
            exit;
        }

        if ($action === 'update_reminder_status') {
            $user_id = sanitize_string($data['user_id'] ?? '');
            $reminder_id = get_int($data['reminder_id'] ?? 0);
            $new_status = sanitize_string($data['status'] ?? '');
            $snoozed_until = $data['snoozed_until'] ?? null;

            if (!$user_id || !$reminder_id || !$new_status) {
                http_response_code(400); echo json_encode(['error' => 'Missing required data']); exit;
            }

            // Validar que el reminder pertenece al user
            $stmtCheck = $pdo->prepare("SELECT id FROM user_learning_reminders WHERE id = ? AND user_id = ?");
            $stmtCheck->execute([$reminder_id, $user_id]);
            if (!$stmtCheck->fetch()) {
                http_response_code(403); echo json_encode(['error' => 'Unauthorized']); exit;
            }

            $stmt = $pdo->prepare("UPDATE user_learning_reminders SET status = ?, snoozed_until = ? WHERE id = ?");
            $stmt->execute([$new_status, $snoozed_until, $reminder_id]);

            echo json_encode(['success' => true]);
            exit;
        }

        if ($action === 'toggle_completion') {
            $user_id = $data['user_id'] ?? null;
            $entity_id = $data['entity_id'] ?? null;
            $entity_type = $data['entity_type'] ?? 'lesson';

            if (!$user_id || !$entity_id) {
                http_response_code(400); echo json_encode(['error' => 'Missing data']); exit;
            }

            // Check if already completed
            $stmt = $pdo->prepare("SELECT id FROM user_progress WHERE user_id = ? AND entity_type = ? AND entity_id = ?");
            $stmt->execute([$user_id, $entity_type, $entity_id]);
            $exists = $stmt->fetch();

            if ($exists) {
                $stmt = $pdo->prepare("DELETE FROM user_progress WHERE id = ?");
                $stmt->execute([$exists['id']]);
                $status = 'uncompleted';
            } else {
                $stmt = $pdo->prepare("INSERT INTO user_progress (user_id, entity_type, entity_id, status) VALUES (?, ?, ?, 'completed')");
                $stmt->execute([$user_id, $entity_type, $entity_id]);
                $status = 'completed';
                
                // Log activity
                log_activity($pdo, $user_id, 'completed_' . $entity_type, $entity_id);
            }

            echo json_encode(['success' => true, 'status' => $status]);
            exit;
        }

        if ($action === 'toggle_follow') {
            $follower_id = get_int($data['follower_id'] ?? 0);
            $following_id = get_int($data['following_id'] ?? 0);

            if ($follower_id === $following_id) {
                echo json_encode(['error' => 'Cannot follow yourself']);
                exit;
            }

            if ($follow) {
                $stmt = $pdo->prepare("DELETE FROM follows WHERE id = ?");
                $stmt->execute([$follow['id']]);
                echo json_encode(['success' => true, 'following' => false]);
            } else {
                $stmt = $pdo->prepare("INSERT INTO follows (follower_id, following_id) VALUES (?, ?)");
                $stmt->execute([$follower_id, $following_id]);
                log_activity($pdo, $follower_id, 'follow', $following_id);
                echo json_encode(['success' => true, 'following' => true]);
            }
            exit;
        }

        if ($action === 'toggle_save') {
            $user_id = get_int($data['user_id'] ?? 0);
            $type = sanitize_string($data['entity_type'] ?? '');
            $entity_id = get_int($data['entity_id'] ?? 0);

            if (!$user_id || !$type || !$entity_id) {
                echo json_encode(['error' => 'Missing data']);
                exit;
            }

            $stmt = $pdo->prepare("SELECT id FROM user_saved_items WHERE user_id = ? AND entity_type = ? AND entity_id = ?");
            $stmt->execute([$user_id, $type, $entity_id]);
            $save = $stmt->fetch();

            if ($save) {
                $stmt = $pdo->prepare("DELETE FROM user_saved_items WHERE id = ?");
                $stmt->execute([$save['id']]);
                echo json_encode(['success' => true, 'saved' => false]);
            } else {
                $stmt = $pdo->prepare("INSERT INTO user_saved_items (user_id, entity_type, entity_id) VALUES (?, ?, ?)");
                $stmt->execute([$user_id, $type, $entity_id]);
                // Removed log_activity for 'save' as per Knowledge-First feedback (noise reduction)
                echo json_encode(['success' => true, 'saved' => true]);
            }
            exit;
        }

        if ($action === 'fork_lesson') {
            $user_id = get_int($data['user_id'] ?? 0);
            $lesson_id = get_int($data['lesson_id'] ?? 0);

            if (!$user_id || !$lesson_id) {
                echo json_encode(['error' => 'Missing data']);
                exit;
            }

            // Get source lesson
            $stmt = $pdo->prepare("SELECT * FROM lessons WHERE id = ?");
            $stmt->execute([$lesson_id]);
            $src = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$src) {
                echo json_encode(['error' => 'Source lesson not found']);
                exit;
            }

            // Create fork
            $stmt = $pdo->prepare("INSERT INTO lessons (user_id, title, youtubeId, category, instrument, artist, description, gpFile, practiceTab, difficulty, harmonica_key, video_bookmarks, personal_notes, attachments, duration, original_creator_id, parent_lesson_id, workspace_config) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            
            $stmt->execute([
                $user_id,
                $src['title'] . " (Fork)",
                $src['youtubeId'],
                $src['category'],
                $src['instrument'],
                $src['artist'],
                $src['description'],
                $src['gpFile'],
                $src['practiceTab'],
                $src['difficulty'],
                $src['harmonica_key'],
                $src['video_bookmarks'],
                $src['personal_notes'],
                $src['attachments'],
                $src['duration'],
                $src['user_id'], // original_creator_id
                $lesson_id,      // parent_lesson_id
                $src['workspace_config']
            ]);
            
            $new_id = $pdo->lastInsertId();

            // HYBRID SYSTEM: We DO NOT copy blocks or knowledge immediately.
            // The fork will reference the parent until the user makes their first edit.
            
            log_activity($pdo, $user_id, 'lesson_fork', $new_id, ['parent_id' => $lesson_id]);
            
            echo json_encode(['success' => true, 'new_id' => $new_id]);
            exit;
        }

        if ($action === 'save_collection') {
            $user_id = get_int($data['user_id'] ?? ($_POST['user_id'] ?? 0));
            $title = sanitize_string($data['title'] ?? ($_POST['title'] ?? ''));
            $description = sanitize_string($data['description'] ?? ($_POST['description'] ?? ''));
            $visibility = sanitize_string($data['visibility'] ?? ($_POST['visibility'] ?? 'private'));
            $id = get_int($data['id'] ?? ($_POST['id'] ?? 0));

            $cover_image_url = null;
            if (isset($_FILES['cover_image']) && $_FILES['cover_image']['error'] === UPLOAD_ERR_OK) {
                $userFolder = intval($user_id);
                $uploadDir = __DIR__ . '/uploads/' . $userFolder . '/collections/';
                if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);

                $safeFileName = preg_replace('/[^a-zA-Z0-9_.-]/', '_', basename($_FILES['cover_image']['name']));
                $fileName = time() . '_' . $safeFileName;
                if (move_uploaded_file($_FILES['cover_image']['tmp_name'], $uploadDir . $fileName)) {
                    $cover_image_url = 'backend/uploads/' . $userFolder . '/collections/' . $fileName;
                }
            }

            if ($id) {
                $sql = "UPDATE collections SET title = ?, description = ?, visibility = ?";
                $params = [$title, $description, $visibility];
                if ($cover_image_url) {
                    $sql .= ", cover_image = ?";
                    $params[] = $cover_image_url;
                }
                $sql .= " WHERE id = ? AND user_id = ?";
                $params[] = $id;
                $params[] = $user_id;
                
                $stmt = $pdo->prepare($sql);
                $stmt->execute($params);
            } else {
                $stmt = $pdo->prepare("INSERT INTO collections (user_id, title, description, visibility, cover_image) VALUES (?, ?, ?, ?, ?)");
                $stmt->execute([$user_id, $title, $description, $visibility, $cover_image_url]);
                $id = $pdo->lastInsertId();
            }
            
            log_activity($pdo, $user_id, 'collection_new', $id);
            
            echo json_encode(['success' => true, 'id' => $id, 'cover_image' => $cover_image_url]);
            exit;
        }

        if ($action === 'delete_collection') {
            try {
                $user_id = get_int($data['user_id'] ?? 0);
                $collection_id = get_int($data['id'] ?? 0);
                
                if (!$collection_id || !$user_id) throw new Exception("Missing params");

                $stmt = $pdo->prepare("DELETE FROM collection_lessons WHERE collection_id = ?");
                $stmt->execute([$collection_id]);
                
                $stmt = $pdo->prepare("DELETE FROM collections WHERE id = ? AND user_id = ?");
                $stmt->execute([$collection_id, $user_id]);

                echo json_encode(['success' => true]);
            } catch (Exception $e) {
                http_response_code(500); echo json_encode(['success' => false, 'error' => $e->getMessage()]);
            }
            exit;
        }

        if ($action === 'register') {
            $username = sanitize_string($data['username'] ?? '');
            $password = $data['password'] ?? ''; // Don't sanitize password, it will be hashed
            $email = isset($data['email']) ? filter_var($data['email'], FILTER_SANITIZE_EMAIL) : null;
            if (!$username || !$password) {
                http_response_code(400); echo json_encode(['error' => 'Missing username or password']); exit;
            }
            
            if ($email && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
                http_response_code(400); echo json_encode(['error' => 'Invalid email format']); exit;
            }
            
            // Check if user exists
            $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ? OR (email IS NOT NULL AND email = ?)");
            $stmt->execute([$username, $email]);
            if ($stmt->fetch()) {
                http_response_code(400); echo json_encode(['error' => 'Username or Email already exists']); exit;
            }

            $hash = password_hash($password, PASSWORD_DEFAULT);
            $stmt = $pdo->prepare("INSERT INTO users (username, password_hash, email) VALUES (?, ?, ?)");
            $stmt->execute([$username, $hash, $email]);
            $newUserId = $pdo->lastInsertId();

            // Auto-Migration: If this is the FIRST user, assign all orphan/existing lessons to them
            $countUsers = $pdo->query("SELECT COUNT(*) FROM users")->fetchColumn();
            if ($countUsers == 1) {
                $pdo->prepare("UPDATE lessons SET user_id = ?")->execute([$newUserId]);
            }

            // Default stats
            $stmt = $pdo->prepare("INSERT INTO user_stats (user_id) VALUES (?)");
            $stmt->execute([$newUserId]);

            log_activity($pdo, $newUserId, 'user_joined');

            echo json_encode(['success' => true, 'user_id' => $newUserId, 'username' => $username, 'stats' => ['practiceHours' => 0, 'streak' => 0, 'points' => 0, 'level' => 1, 'bendsMastered' => 0]]);
            exit;
        }

        if ($action === 'login') {
            $username = $data['username'] ?? '';
            $password = $data['password'] ?? '';
            if (!$username || !$password) {
                http_response_code(400); echo json_encode(['error' => 'Missing username or password']); exit;
            }

            $stmt = $pdo->prepare("SELECT id, username, password_hash FROM users WHERE username = ?");
            $stmt->execute([$username]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($user && password_verify($password, $user['password_hash'])) {
                $stmtStats = $pdo->prepare("SELECT practiceHours, streak, points, level, bendsMastered, lastPracticeDate FROM user_stats WHERE user_id = ?");
                $stmtStats->execute([$user['id']]);
                $stats = $stmtStats->fetch(PDO::FETCH_ASSOC) ?: ['practiceHours' => 0, 'streak' => 0, 'points' => 0, 'level' => 1, 'bendsMastered' => 0];

                echo json_encode(['success' => true, 'user_id' => $user['id'], 'username' => $user['username'], 'stats' => $stats]);
            } else {
                http_response_code(401); echo json_encode(['error' => 'Invalid credentials']);
            }
            exit;
        }

        // Automigración para el Feed
        $pdo->exec("CREATE TABLE IF NOT EXISTS activities (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            type VARCHAR(50) NOT NULL,
            content_id INT,
            metadata JSON,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )");

        $pdo->exec("CREATE TABLE IF NOT EXISTS practice_sessions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            lesson_id INT,
            bpm INT,
            duration_seconds INT,
            instrument VARCHAR(50),
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )");

        // Endpoints del Feed
        if ($action === 'log_practice') {
            $user_id = $data['user_id'];
            $lesson_id = $data['lesson_id'] ?? null;
            $bpm = $data['bpm'] ?? 0;
            $duration = $data['duration'] ?? 0;
            $instrument = $data['instrument'] ?? 'Armónica';

            $stmt = $pdo->prepare("INSERT INTO practice_sessions (user_id, lesson_id, bpm, duration_seconds, instrument) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([$user_id, $lesson_id, $bpm, $duration, $instrument]);
            $sessionId = $pdo->lastInsertId();

            // Log activity
            $metadata = json_encode(['bpm' => $bpm, 'duration' => $duration, 'instrument' => $instrument]);
            $stmtAct = $pdo->prepare("INSERT INTO activities (user_id, type, content_id, metadata) VALUES (?, 'practice', ?, ?)");
            $stmtAct->execute([$user_id, $sessionId, $metadata]);

            echo json_encode(['success' => true]);
            exit;
        }

        if ($action === 'save_lesson_blocks') {
            $lesson_id = $data['lesson_id'];
            $blocks = $data['blocks'] ?? [];

            // Simple atomic update: delete old blocks and insert new ones
            // In production, use transactions
            $pdo->prepare("DELETE FROM lesson_blocks WHERE lesson_id = ?")->execute([$lesson_id]);

            foreach ($blocks as $index => $block) {
                $stmt = $pdo->prepare("INSERT INTO lesson_blocks (lesson_id, type, content, order_index) VALUES (?, ?, ?, ?)");
                $stmt->execute([
                    $lesson_id, 
                    $block['type'], 
                    json_encode($block['content']), 
                    $index
                ]);
            }

            echo json_encode(['success' => true]);
            exit;
        }

        if ($action === 'google_login') {
            $credential = $data['credential'] ?? '';
            if (!$credential) {
                http_response_code(400); echo json_encode(['error' => 'Missing Google credential']); exit;
            }
            
            // Verify token with Google
            $ch = curl_init("https://oauth2.googleapis.com/tokeninfo?id_token=" . $credential);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            if ($httpCode !== 200) {
                http_response_code(401); echo json_encode(['error' => 'Invalid Google token']); exit;
            }

            $payload = json_decode($response, true);
            $email = $payload['email'] ?? null;
            $username = $payload['name'] ?? null;

            if (!$email || !$username) {
                http_response_code(400); echo json_encode(['error' => 'Google profile missing email/name']); exit;
            }

            // Check if user exists by email
            $stmt = $pdo->prepare("SELECT id, username FROM users WHERE email = ?");
            $stmt->execute([$email]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$user) {
                // Register new user
                $baseUsername = str_replace(' ', '', $username);
                $finalUsername = $baseUsername;
                $counter = 1;
                while (true) {
                    $stmtCheck = $pdo->prepare("SELECT id FROM users WHERE username = ?");
                    $stmtCheck->execute([$finalUsername]);
                    if (!$stmtCheck->fetch()) break;
                    $finalUsername = $baseUsername . $counter;
                    $counter++;
                }

                $hash = password_hash(bin2hex(random_bytes(16)), PASSWORD_DEFAULT);
                $stmtInsert = $pdo->prepare("INSERT INTO users (username, password_hash, email) VALUES (?, ?, ?)");
                $stmtInsert->execute([$finalUsername, $hash, $email]);
                $userId = $pdo->lastInsertId();

                $stmtStats = $pdo->prepare("INSERT INTO user_stats (user_id) VALUES (?)");
                $stmtStats->execute([$userId]);

                $user = ['id' => $userId, 'username' => $finalUsername];
            }

            $stmtStats = $pdo->prepare("SELECT practiceHours, streak, points, level, bendsMastered, lastPracticeDate FROM user_stats WHERE user_id = ?");
            $stmtStats->execute([$user['id']]);
            $stats = $stmtStats->fetch(PDO::FETCH_ASSOC) ?: ['practiceHours' => 0, 'streak' => 0, 'points' => 0, 'level' => 1, 'bendsMastered' => 0];

            echo json_encode(['success' => true, 'user_id' => $user['id'], 'username' => $user['username'], 'stats' => $stats]);
            exit;
        }

        if ($action === 'get_saved_items') {
            $user_id = get_int($_GET['user_id'] ?? 0);
            if (!$user_id) { echo json_encode(['error' => 'Missing user_id']); exit; }

            $stmt = $pdo->prepare("SELECT s.*, 
                                  CASE 
                                    WHEN s.entity_type = 'lesson' THEN (SELECT title FROM lessons WHERE id = s.entity_id)
                                    WHEN s.entity_type = 'collection' THEN (SELECT title FROM collections WHERE id = s.entity_id)
                                    WHEN s.entity_type = 'path' THEN (SELECT title FROM learning_paths WHERE id = s.entity_id)
                                  END as title,
                                  CASE 
                                    WHEN s.entity_type = 'collection' THEN (SELECT cover_image FROM collections WHERE id = s.entity_id)
                                    WHEN s.entity_type = 'path' THEN (SELECT cover_image FROM learning_paths WHERE id = s.entity_id)
                                  END as cover_image,
                                  CASE 
                                    WHEN s.entity_type = 'collection' THEN (SELECT l.youtubeId FROM lessons l JOIN collection_lessons cl ON l.id = cl.lesson_id WHERE cl.collection_id = s.entity_id AND l.youtubeId IS NOT NULL AND l.youtubeId != '' LIMIT 1)
                                  END as sample_youtube_id
                                  FROM user_saved_items s 
                                  WHERE s.user_id = ? 
                                  ORDER BY s.created_at DESC");
            $stmt->execute([$user_id]);
            echo json_encode(['success' => true, 'items' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
            exit;
        }

        if ($action === 'update_stats') {
            $user_id = $data['user_id'] ?? '';
            $stats = $data['stats'] ?? [];
            if (!$user_id || empty($stats)) {
                 http_response_code(400); echo json_encode(['error' => 'Missing data']); exit;
            }

            // Streak Logic
            $stmt = $pdo->prepare("SELECT lastPracticeDate, streak FROM user_stats WHERE user_id = ?");
            $stmt->execute([$user_id]);
            $current = $stmt->fetch(PDO::FETCH_ASSOC);
            
            $today = date('Y-m-d');
            $newStreak = $stats['streak'] ?? ($current['streak'] ?? 0);
            
            if ($current && $current['lastPracticeDate']) {
                $lastDate = $current['lastPracticeDate'];
                if ($lastDate !== $today) {
                    $yesterday = date('Y-m-d', strtotime('-1 day'));
                    if ($lastDate === $yesterday) {
                        $newStreak++;
                    } else {
                        $newStreak = 1; // Reseteado pero hoy practicó
                    }
                }
            } else {
                $newStreak = 1;
            }

            $stmt = $pdo->prepare("UPDATE user_stats SET practiceHours = ?, streak = ?, points = ?, level = ?, bendsMastered = ?, lastPracticeDate = ? WHERE user_id = ?");
            $stmt->execute([
                $stats['practiceHours'] ?? 0,
                $newStreak,
                $stats['points'] ?? 0,
                $stats['level'] ?? 1,
                $stats['bendsMastered'] ?? 0,
                $today,
                $user_id
            ]);
            echo json_encode(['success' => true, 'newStreak' => $newStreak]);
            exit;
        }

        if ($action === 'unlock_achievement') {
            $user_id = $data['user_id'] ?? '';
            $key = $data['achievement_key'] ?? '';
            if (!$user_id || !$key) {
                http_response_code(400); echo json_encode(['error' => 'Missing data']); exit;
            }
            $stmt = $pdo->prepare("INSERT IGNORE INTO user_achievements (user_id, achievement_key) VALUES (?, ?)");
            $stmt->execute([$user_id, $key]);
            echo json_encode(['success' => true]);
            exit;
        }

        if ($action === 'save_learning_path') {
            $user_id = get_int($data['creator_id'] ?? 0);
            $path_id = get_int($data['id'] ?? 0);
            $title = sanitize_string($data['title'] ?? '');
            $nodes = $data['nodes'] ?? [];

            if (!$user_id || !$title) {
                http_response_code(400); echo json_encode(['error' => 'Missing data']); exit;
            }

            $pdo->beginTransaction();
            try {
                if ($path_id) {
                    // Update
                    $stmt = $pdo->prepare("UPDATE learning_paths SET title = ?, description = ?, difficulty = ?, instrument = ?, visibility = ? WHERE id = ? AND creator_id = ?");
                    $stmt->execute([
                        $title, $data['description'] ?? '', $data['difficulty'] ?? 'beginner', 
                        $data['instrument'] ?? '', $data['visibility'] ?? 'public',
                        $path_id, $user_id
                    ]);
                } else {
                    // Create
                    $stmt = $pdo->prepare("INSERT INTO learning_paths (creator_id, title, description, difficulty, instrument, visibility) VALUES (?, ?, ?, ?, ?, ?)");
                    $stmt->execute([
                        $user_id, $title, $data['description'] ?? '', 
                        $data['difficulty'] ?? 'beginner', $data['instrument'] ?? '', 
                        $data['visibility'] ?? 'public'
                    ]);
                    $path_id = $pdo->lastInsertId();
                    log_activity($pdo, $user_id, 'created_learning_path', $path_id);
                }

                // Atomic Nodes Update
                $pdo->prepare("DELETE FROM learning_path_nodes WHERE path_id = ?")->execute([$path_id]);
                foreach ($nodes as $index => $node) {
                    $stmtN = $pdo->prepare("INSERT INTO learning_path_nodes (path_id, entity_type, entity_id, order_index, milestone, notes) VALUES (?, ?, ?, ?, ?, ?)");
                    $stmtN->execute([
                        $path_id, $node['entity_type'], $node['entity_id'], 
                        $index, $node['milestone'] ?? 0, $node['notes'] ?? ''
                    ]);
                }

                $pdo->commit();
                echo json_encode(['success' => true, 'id' => $path_id]);
            } catch (Exception $e) {
                $pdo->rollBack();
                http_response_code(500); echo json_encode(['error' => $e->getMessage()]);
            }
            exit;
        }

        if ($action === 'update_path_progress') {
            $user_id = get_int($data['user_id'] ?? 0);
            $path_id = get_int($data['path_id'] ?? 0);
            $node_id = get_int($data['node_id'] ?? 0);

            if (!$user_id || !$path_id || !$node_id) {
                http_response_code(400); echo json_encode(['error' => 'Missing data']); exit;
            }

            // Get current progress
            $stmt = $pdo->prepare("SELECT completed_nodes FROM learning_path_progress WHERE user_id = ? AND path_id = ?");
            $stmt->execute([$user_id, $path_id]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);

            $completed = [];
            if ($row) {
                $completed = json_decode($row['completed_nodes'], true) ?: [];
            }

            if (!in_array($node_id, $completed)) {
                $completed[] = $node_id;
            }

            // Calculate mastery
            $stmtTotal = $pdo->prepare("SELECT COUNT(*) FROM learning_path_nodes WHERE path_id = ?");
            $stmtTotal->execute([$path_id]);
            $totalNodes = $stmtTotal->fetchColumn() ?: 1;
            $mastery = (count($completed) / $totalNodes) * 100;

            $stmtSave = $pdo->prepare("INSERT INTO learning_path_progress (user_id, path_id, completed_nodes, mastery) 
                                     VALUES (?, ?, ?, ?) 
                                     ON DUPLICATE KEY UPDATE completed_nodes = VALUES(completed_nodes), mastery = VALUES(mastery)");
            $stmtSave->execute([$user_id, $path_id, json_encode($completed), $mastery]);

            if ($mastery >= 100) {
                log_activity($pdo, $user_id, 'completed_learning_path', $path_id);
            }

            echo json_encode(['success' => true, 'mastery' => $mastery]);
            exit;
        }

        if ($action === 'fork_learning_path') {
            $user_id = get_int($data['user_id'] ?? 0);
            $path_id = get_int($data['path_id'] ?? 0);

            if (!$user_id || !$path_id) {
                http_response_code(400); echo json_encode(['error' => 'Missing data']); exit;
            }

            $pdo->beginTransaction();
            try {
                $stmt = $pdo->prepare("SELECT * FROM learning_paths WHERE id = ?");
                $stmt->execute([$path_id]);
                $src = $stmt->fetch(PDO::FETCH_ASSOC);

                if (!$src) throw new Exception("Source path not found");

                // Create hybrid fork
                $stmtIns = $pdo->prepare("INSERT INTO learning_paths (creator_id, original_creator_id, parent_path_id, title, description, difficulty, instrument, visibility) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
                $stmtIns->execute([
                    $user_id, 
                    $src['original_creator_id'] ?: $src['creator_id'],
                    $path_id,
                    $src['title'] . " (Remix)",
                    $src['description'],
                    $src['difficulty'],
                    $src['instrument'],
                    'private'
                ]);
                $new_id = $pdo->lastInsertId();

                // Copy nodes
                $stmtNodes = $pdo->prepare("SELECT * FROM learning_path_nodes WHERE path_id = ?");
                $stmtNodes->execute([$path_id]);
                $nodes = $stmtNodes->fetchAll(PDO::FETCH_ASSOC);

                foreach ($nodes as $n) {
                    $stmtNodeIns = $pdo->prepare("INSERT INTO learning_path_nodes (path_id, entity_type, entity_id, order_index, milestone, notes) VALUES (?, ?, ?, ?, ?, ?)");
                    $stmtNodeIns->execute([$new_id, $n['entity_type'], $n['entity_id'], $n['order_index'], $n['milestone'], $n['notes']]);
                }

                $pdo->commit();
                log_activity($pdo, $user_id, 'forked_learning_path', $new_id, ['parent_id' => $path_id]);
                echo json_encode(['success' => true, 'id' => $new_id]);
            } catch (Exception $e) {
                $pdo->rollBack();
                http_response_code(500); echo json_encode(['error' => $e->getMessage()]);
            }
            exit;
        }

        if ($action === 'update_blues_progress') {
            $user_id = $data['user_id'] ?? '';
            $weeks = $data['weeks'] ?? [];
            $exercises = $data['exercises'] ?? [];
            if (!$user_id) {
                http_response_code(400); echo json_encode(['error' => 'Missing user_id']); exit;
            }

            $stmt = $pdo->prepare("INSERT INTO user_blues_progress (user_id, completed_weeks, completed_exercises) 
                                 VALUES (?, ?, ?) 
                                 ON DUPLICATE KEY UPDATE completed_weeks = VALUES(completed_weeks), completed_exercises = VALUES(completed_exercises)");
            $stmt->execute([
                $user_id,
                json_encode($weeks),
                json_encode($exercises)
            ]);
            echo json_encode(['success' => true]);
        }

        if ($action === 'update_audio_settings') {
            $user_id = $data['user_id'] ?? '';
            $eq = $data['eq_settings'] ?? null;
            if (!$user_id || !$eq) {
                http_response_code(400); echo json_encode(['error' => 'Missing data']); exit;
            }
            $stmt = $pdo->prepare("INSERT INTO user_audio_settings (user_id, eq_settings) VALUES (?, ?) ON DUPLICATE KEY UPDATE eq_settings = VALUES(eq_settings)");
            $stmt->execute([$user_id, is_array($eq) ? json_encode($eq) : $eq]);
            echo json_encode(['success' => true]);
            exit;
        }

        if ($action === 'upload_backing_track') {
            $user_id = get_int($data['user_id'] ?? ($_POST['user_id'] ?? 0));
            if (!isset($_FILES['audio_file'])) {
                http_response_code(400); echo json_encode(['error' => 'No file uploaded']); exit;
            }

            if (!validate_file($_FILES['audio_file'], ['mp3'], ['audio/mpeg', 'audio/mp3', 'application/octet-stream'])) {
                http_response_code(400); echo json_encode(['error' => 'Invalid file type. Only MP3 allowed.']); exit;
            }
            
            $rhythm = $_POST['rhythm'] ?? '';
            $key = $_POST['key'] ?? '';
            $is_global = ($_POST['is_global'] ?? '0') === '1';
            
            if (!$rhythm || !$key || !$user_id) {
                http_response_code(400); echo json_encode(['error' => 'Missing data']); exit;
            }

            // Max 10MB
            if ($_FILES['audio_file']['size'] > 10 * 1024 * 1024) {
                http_response_code(400); echo json_encode(['error' => 'File too large (Max 10MB)']); exit;
            }
            
            $dir = __DIR__ . '/uploads/backingtracks/' . ($is_global ? 'global' : 'user_' . $user_id) . '/';
            if (!is_dir($dir)) mkdir($dir, 0777, true);
            
            $safeRhythm = preg_replace('/[^a-z0-9]/', '_', $rhythm);
            $safeKey = preg_replace('/[^a-z0-9#]/', '_', strtolower($key));
            $fileName = $safeRhythm . '_' . $safeKey . '_' . time() . '.mp3';
            $targetPath = $dir . $fileName;
            
            if (move_uploaded_file($_FILES['audio_file']['tmp_name'], $targetPath)) {
                $dbPath = 'backend/uploads/backingtracks/' . ($is_global ? 'global' : 'user_' . $user_id) . '/' . $fileName;
                
                // Save to DB
                $stmt = $pdo->prepare("INSERT INTO backing_tracks (user_id, rhythm_key, note_key, file_path, is_global) 
                                     VALUES (?, ?, ?, ?, ?) 
                                     ON DUPLICATE KEY UPDATE file_path = VALUES(file_path), is_global = VALUES(is_global)");
                $stmt->execute([$user_id, $rhythm, $key, $dbPath, $is_global ? 1 : 0]);
                
                echo json_encode(['success' => true, 'path' => $dbPath]);
            } else {
                http_response_code(500); echo json_encode(['error' => 'Failed to move file']);
            }
            exit;
        }
        
        // Action add_lesson or update_lesson
        if ($action === 'add_lesson' || $action === 'update_lesson') {
            $user_id_for_lesson = $data['user_id'] ?? ($_POST['user_id'] ?? null);
            if (!$user_id_for_lesson && $action === 'add_lesson') {
                 http_response_code(400); echo json_encode(['error' => 'Missing user_id for lesson']); exit;
            }

            $gpFileUrl = '';
            if (isset($_FILES['gpFile_upload'])) {
                if (!validate_file($_FILES['gpFile_upload'], ['gp', 'gpx', 'gp5', 'pdf'], ['application/octet-stream', 'application/pdf', 'application/x-guitar-pro'])) {
                    // Note: some gp files have generic mimes, might need adjustment
                }

                $userFolder = intval($user_id_for_lesson);
                $uploadDir = __DIR__ . '/uploads/' . $userFolder . '/';
                if (!is_dir($uploadDir)) {
                    mkdir($uploadDir, 0755, true);
                }
                
                // Clean filename
                $safeFileName = preg_replace('/[^a-zA-Z0-9_.-]/', '_', basename($_FILES['gpFile_upload']['name']));
                $fileName = time() . '_' . $safeFileName;
                $targetPath = $uploadDir . $fileName;
                
                if (move_uploaded_file($_FILES['gpFile_upload']['tmp_name'], $targetPath)) {
                    // Return a relative path suitable for the domain
                    $gpFileUrl = 'backend/uploads/' . $userFolder . '/' . $fileName;
                }
            }

            // Fields allowed for update
            $allowedFields = [
                'title', 'youtubeId', 'category', 'instrument', 'artist', 
                'description', 'practiceTab', 'difficulty', 'harmonica_key', 
                'video_bookmarks', 'personal_notes', 'duration', 'completed'
            ];

            $updates = [];
            $params = [];

            foreach ($allowedFields as $field) {
                if (isset($data[$field])) {
                    $value = $data[$field];
                    if (is_array($value)) {
                        $value = json_encode($value);
                    } else if (is_string($value)) {
                        $value = sanitize_string($value);
                    }
                    $updates[] = "$field = ?";
                    $params[] = $value;
                }
            }


            // Handle GP File Upload
            if ($gpFileUrl) {
                $updates[] = "gpFile = ?";
                $params[] = $gpFileUrl;
            }

            // Handle Attachments
            $attachments = isset($data['attachments']) ? (is_array($data['attachments']) ? json_encode($data['attachments']) : $data['attachments']) : null;
            if ($attachments !== null || isset($_FILES['attachment_files'])) {
                $existing_attachments = json_decode($attachments ?: '[]', true) ?: [];
                if (isset($_FILES['attachment_files'])) {
                    $userFolder = intval($user_id_for_lesson);
                    $uploadDir = __DIR__ . '/uploads/' . $userFolder . '/attachments/';
                    if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);

                    foreach ($_FILES['attachment_files']['tmp_name'] as $key => $tmp_name) {
                        if ($_FILES['attachment_files']['error'][$key] === UPLOAD_ERR_OK) {
                            $safeFileName = preg_replace('/[^a-zA-Z0-9_.-]/', '_', basename($_FILES['attachment_files']['name'][$key]));
                            $fileName = time() . '_' . $safeFileName;
                            if (move_uploaded_file($tmp_name, $uploadDir . $fileName)) {
                                $existing_attachments[] = [
                                    'type' => 'file',
                                    'title' => $_FILES['attachment_files']['name'][$key],
                                    'url' => 'backend/uploads/' . $userFolder . '/attachments/' . $fileName
                                ];
                            }
                        }
                    }
                }
                $updates[] = "attachments = ?";
                $params[] = json_encode($existing_attachments);
            }

            if ($action === 'add_lesson') {
                // For add_lesson we still use a full insert with defaults
                $title = sanitize_string($data['title'] ?? ($_POST['title'] ?? ''));
                $youtubeId = sanitize_string($data['youtubeId'] ?? ($_POST['youtubeId'] ?? ''));
                $category = sanitize_string($data['category'] ?? ($_POST['category'] ?? 'daily'));
                $instrument = sanitize_string($data['instrument'] ?? ($_POST['instrument'] ?? 'harmonica'));
                $artist = sanitize_string($data['artist'] ?? ($_POST['artist'] ?? ''));
                $description = sanitize_string($data['description'] ?? ($_POST['description'] ?? ''));
                $practiceTab = sanitize_string($data['practiceTab'] ?? ($_POST['practiceTab'] ?? ''));
                $difficulty = get_int($data['difficulty'] ?? ($_POST['difficulty'] ?? 1));
                $harmonicaKey = sanitize_string($data['harmonica_key'] ?? ($_POST['harmonica_key'] ?? 'ALL'));
                $videoBookmarks = isset($data['video_bookmarks']) ? (is_array($data['video_bookmarks']) ? json_encode($data['video_bookmarks']) : $data['video_bookmarks']) : ($_POST['video_bookmarks'] ?? '[]');
                $personalNotes = sanitize_string($data['personal_notes'] ?? ($_POST['personal_notes'] ?? ''));
                $duration = sanitize_string($data['duration'] ?? ($_POST['duration'] ?? ''));
                $completed = get_int($data['completed'] ?? ($_POST['completed'] ?? 0));

                $finalAttachments = isset($existing_attachments) ? json_encode($existing_attachments) : '[]';

                // Check if category is a collection ID
                $actualCategoryTitle = $category;
                $targetCollectionId = is_numeric($category) ? intval($category) : null;

                if ($targetCollectionId) {
                    $stmtC = $pdo->prepare("SELECT title FROM collections WHERE id = ?");
                    $stmtC->execute([$targetCollectionId]);
                    $titleRes = $stmtC->fetchColumn();
                    if ($titleRes) $actualCategoryTitle = $titleRes;
                }

                $workspaceConfig = isset($data['workspace_config']) ? (is_array($data['workspace_config']) ? json_encode($data['workspace_config']) : $data['workspace_config']) : ($_POST['workspace_config'] ?? null);

                $stmt = $pdo->prepare("INSERT INTO lessons (user_id, title, youtubeId, category, instrument, artist, description, gpFile, practiceTab, difficulty, harmonica_key, video_bookmarks, personal_notes, attachments, duration, completed, workspace_config) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
                $stmt->execute([
                    $user_id_for_lesson, $title, $youtubeId, $actualCategoryTitle, $instrument, $artist, $description, $gpFileUrl, $practiceTab, $difficulty, $harmonicaKey, $videoBookmarks, $personalNotes, $finalAttachments, $duration, $completed, $workspaceConfig
                ]);
                $lesson_id = $pdo->lastInsertId();

                // Assign to collection
                if ($targetCollectionId) {
                    $pdo->prepare("INSERT IGNORE INTO collection_lessons (collection_id, lesson_id) VALUES (?, ?)")
                        ->execute([$targetCollectionId, $lesson_id]);
                }

                log_activity($pdo, $user_id_for_lesson, 'lesson_new', $lesson_id);

                echo json_encode(['success' => true, 'id' => $lesson_id]);
            } else {
                $lesson_id = $data['id'] ?? ($_POST['id'] ?? null);
                if (!$lesson_id) {
                     http_response_code(400); echo json_encode(['error' => 'Missing lesson id']); exit;
                }
                
                // Ownership check
                $stmtCheck = $pdo->prepare("SELECT user_id FROM lessons WHERE id = ?");
                $stmtCheck->execute([$lesson_id]);
                $owner = $stmtCheck->fetchColumn();
                if ($owner != $user_id_for_lesson) {
                    http_response_code(403); echo json_encode(['error' => 'Unauthorized to edit this lesson']); exit;
                }

                // If updating category, check if it's an ID
                if (isset($data['category'])) {
                    $categoryVal = $data['category'];
                    if (is_numeric($categoryVal)) {
                        $targetCollectionId = intval($categoryVal);
                        $stmtC = $pdo->prepare("SELECT title FROM collections WHERE id = ?");
                        $stmtC->execute([$targetCollectionId]);
                        $actualCategoryTitle = $stmtC->fetchColumn();
                        
                        if ($actualCategoryTitle) {
                            // Update the title in the updates array
                            foreach ($updates as $i => $u) {
                                if (strpos($u, 'category = ?') !== false) {
                                    $params[$i] = $actualCategoryTitle;
                                }
                            }
                            // Also ensure it's linked
                            $pdo->prepare("INSERT IGNORE INTO collection_lessons (collection_id, lesson_id) VALUES (?, ?)")
                                ->execute([$targetCollectionId, $lesson_id]);
                        }
                    }
                }

                if (empty($updates)) {
                    echo json_encode(['success' => true, 'message' => 'No fields to update']);
                    exit;
                }

                $params[] = $lesson_id;
                $sql = "UPDATE lessons SET " . implode(", ", $updates) . " WHERE id = ?";
                $stmt = $pdo->prepare($sql);
                $stmt->execute($params);

                $response = ['success' => true];
                if (isset($existing_attachments)) $response['attachments'] = $existing_attachments;
                if (isset($gpFileUrl) && $gpFileUrl) $response['gpFile'] = $gpFileUrl;
                
                echo json_encode($response);
            }
            exit;
        }

        if ($action === 'save_workspace_state') {
            $user_id = get_int($data['user_id'] ?? 0);
            $lesson_id = get_int($data['lesson_id'] ?? 0);
            $layout_config = isset($data['layout_config']) ? json_encode($data['layout_config']) : null;
            $settings = isset($data['settings']) ? json_encode($data['settings']) : null;

            if (!$user_id || !$lesson_id) {
                echo json_encode(['error' => 'Missing parameters']);
                exit;
            }

            $stmt = $pdo->prepare("INSERT INTO user_workspaces (user_id, lesson_id, layout_config, settings) 
                                   VALUES (?, ?, ?, ?) 
                                   ON DUPLICATE KEY UPDATE layout_config = VALUES(layout_config), settings = VALUES(settings)");
            $stmt->execute([$user_id, $lesson_id, $layout_config, $settings]);

            echo json_encode(['success' => true]);
            exit;
        }

        if ($action === 'save_workspace_note') {
            $workspace_id = get_int($data['workspace_id'] ?? 0);
            $content = $data['content'] ?? '';

            if (!$workspace_id) {
                echo json_encode(['error' => 'Missing workspace_id']);
                exit;
            }

            $stmt = $pdo->prepare("INSERT INTO workspace_notes (workspace_id, content) VALUES (?, ?)");
            $stmt->execute([$workspace_id, $content]);

            echo json_encode(['success' => true, 'note_id' => $pdo->lastInsertId()]);
            exit;
        }

        if ($action === 'add_workspace_bookmark') {
            $workspace_id = get_int($data['workspace_id'] ?? 0);
            $type = $data['type'] ?? 'global';
            $title = $data['title'] ?? 'New Bookmark';
            $position = $data['position'] ?? '';
            $metadata = isset($data['metadata']) ? json_encode($data['metadata']) : null;

            if (!$workspace_id) {
                echo json_encode(['error' => 'Missing workspace_id']);
                exit;
            }

            $stmt = $pdo->prepare("INSERT INTO workspace_bookmarks (workspace_id, type, title, position, metadata) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([$workspace_id, $type, $title, $position, $metadata]);

            echo json_encode(['success' => true, 'bookmark_id' => $pdo->lastInsertId()]);
            exit;
        }

        // Action patch_lesson (Partial Update for Auto-save)
        if ($action === 'patch_lesson') {
            $lesson_id = $data['id'] ?? null;
            if (!$lesson_id) {
                http_response_code(400); echo json_encode(['error' => 'Missing lesson id']); exit;
            }

            // Campos permitidos para actualización parcial
            $allowedFields = [
                'title', 'youtubeId', 'category', 'instrument', 'artist', 
                'description', 'practiceTab', 'difficulty', 'harmonica_key', 
                'video_bookmarks', 'personal_notes', 'attachments', 'duration', 'completed', 'workspace_config'
            ];

            $updates = [];
            $params = [];

            foreach ($allowedFields as $field) {
                if (isset($data[$field])) {
                    $value = $data[$field];
                    // Si es un array (bookmarks/attachments), lo convertimos a JSON
                    if (is_array($value)) {
                        $value = json_encode($value);
                    }
                    $updates[] = "$field = ?";
                    $params[] = $value;
                }
            }

            if (empty($updates)) {
                echo json_encode(['success' => true, 'message' => 'No fields to update']);
                exit;
            }

            $params[] = $lesson_id;
            $sql = "UPDATE lessons SET " . implode(", ", $updates) . " WHERE id = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            
            echo json_encode(['success' => true]);
            exit;
        }

        // Action delete_lesson

        // Action delete_lesson
        if ($action === 'delete_lesson') {
            $lesson_id = $data['id'] ?? null;
            if (!$lesson_id) {
                 http_response_code(400); echo json_encode(['error' => 'Missing lesson id']); exit;
            }
            $stmt = $pdo->prepare("DELETE FROM lessons WHERE id=?");
            $stmt->execute([$lesson_id]);
            echo json_encode(['success' => true]);
            exit;
        }
    }
} catch (PDOException $e) {
    http_response_code(500);
    // Log error internally in a real production app
    error_log($e->getMessage());
    echo json_encode(['error' => 'Internal Server Error. Please try again later.']);
}
