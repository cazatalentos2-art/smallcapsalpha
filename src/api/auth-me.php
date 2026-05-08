<?php
require_once __DIR__ . '/helpers.php';

require_login();

$stmt = $pdo->prepare("SELECT id, name, email FROM users WHERE id = ? LIMIT 1");
$stmt->execute([get_user_id()]);
$user = $stmt->fetch();

if (!$user) {
    respond(['success' => false, 'message' => 'Usuario no encontrado'], 404);
}

respond([
    'success' => true,
    'user' => [
        'id' => (int)$user['id'],
        'name' => $user['name'],
        'email' => $user['email']
    ]
]);