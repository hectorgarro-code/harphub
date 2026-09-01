<?php
// Configuración de la base de datos con detección automática de entorno (Local XAMPP vs Hostinger)

$host_header = $_SERVER['HTTP_HOST'] ?? '';
$server_name = $_SERVER['SERVER_NAME'] ?? '';

$is_local = ($host_header === 'localhost' || str_starts_with($host_header, 'localhost:') || $server_name === 'localhost' || $server_name === '127.0.0.1');

if ($is_local) {
    // ==========================================
    // ENTORNO LOCAL (XAMPP)
    // ==========================================
    $host = 'localhost';
    $db   = 'harphub';
    $user = 'root';
    $pass = '';
} else {
    // ==========================================
    // ENTORNO PRODUCCIÓN (Hostinger)
    // ==========================================
    // Si creas la base de datos en Hostinger, ingresa aquí sus datos:
    $host = getenv('DB_HOST') ?: 'localhost';
    $db   = getenv('DB_NAME') ?: 'u803496046_harphub';
    $user = getenv('DB_USER') ?: 'u803496046_harphub';
    $pass = getenv('DB_PASS') ?: '';
}
