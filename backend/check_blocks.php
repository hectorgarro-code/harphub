<?php
require_once 'db_config.php';
try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $stmt = $pdo->prepare("SELECT id FROM lessons WHERE title LIKE '%Your bird can sing%'");
    $stmt->execute();
    $id = $stmt->fetchColumn();
    if ($id) {
        $stmtB = $pdo->prepare("SELECT type, content FROM lesson_blocks WHERE lesson_id = ?");
        $stmtB->execute([$id]);
        echo json_encode($stmtB->fetchAll(PDO::FETCH_ASSOC), JSON_PRETTY_PRINT);
    } else {
        echo "Lesson not found";
    }
} catch (PDOException $e) {
    echo $e->getMessage();
}
