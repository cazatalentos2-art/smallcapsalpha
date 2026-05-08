<?php
require_once __DIR__ . '/helpers.php';

$data = json_input();
$email = trim($data['email'] ?? '');
$password = (string)($data['password'] ?? '');

if ($email === '' || $password === '') {
    respond(['success' => false, 'message' => 'Email y contraseña son obligatorios'], 422);
}

$stmt = $pdo->prepare("SELECT id, name, email, password_hash FROM users WHERE email = ? LIMIT 1");
$stmt->execute([$email]);
$user = $stmt->fetch();

if (!$user || !password_verify($password, $user['password_hash'])) {
    respond(['success' => false, 'message' => 'Credenciales inválidas'], 401);
}

$_SESSION['user_id'] = (int)$user['id'];

respond([
    'success' => true,
    'user' => [
        'id' => (int)$user['id'],
        'name' => $user['name'],
        'email' => $user['email']
    ]
]);