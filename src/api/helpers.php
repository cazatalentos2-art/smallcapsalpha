<?php
require_once __DIR__ . '/db.php';

function json_input() {
    $raw = file_get_contents('php://input');
    return $raw ? json_decode($raw, true) : [];
}

function respond($data = [], int $status = 200) {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function require_login() {
    if (empty($_SESSION['user_id'])) {
        respond([
            'success' => false,
            'message' => 'No autorizado'
        ], 401);
    }
}

function get_user_id() {
    return $_SESSION['user_id'] ?? null;
}

function request_method() {
    return $_SERVER['REQUEST_METHOD'] ?? 'GET';
}

function get_id() {
    return isset($_GET['id']) ? (int) $_GET['id'] : 0;
}