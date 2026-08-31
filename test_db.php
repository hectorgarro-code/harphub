<?php
$pdo = new PDO("mysql:host=localhost;dbname=harphub;charset=utf8mb4", "root", "");
$stmt = $pdo->query("DESCRIBE lessons");
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
?>
