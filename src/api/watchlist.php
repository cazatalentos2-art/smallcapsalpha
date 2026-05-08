<?php
require_once __DIR__ . '/helpers.php';

require_login();
$user_id = get_user_id();
$method = request_method();

if ($method === 'GET') {
    $stmt = $pdo->prepare("SELECT id, ticker, name, notes, target_price, stop_loss, created_at
                           FROM watchlist
                           WHERE user_id = ?
                           ORDER BY created_at DESC");
    $stmt->execute([$user_id]);
    respond($stmt->fetchAll());
}

if ($method === 'POST') {
    $data = json_input();

    $ticker = strtoupper(trim($data['ticker'] ?? ''));
    $name = trim($data['name'] ?? '');
    $notes = trim($data['notes'] ?? '');
    $target_price = isset($data['target_price']) && $data['target_price'] !== '' ? (float)$data['target_price'] : null;
    $stop_loss = isset($data['stop_loss']) && $data['stop_loss'] !== '' ? (float)$data['stop_loss'] : null;

    if ($ticker === '') {
        respond(['success' => false, 'message' => 'Ticker obligatorio'], 422);
    }

    $check = $pdo->prepare("SELECT id FROM watchlist WHERE user_id = ? AND ticker = ? LIMIT 1");
    $check->execute([$user_id, $ticker]);

    if ($check->fetch()) {
        respond(['success' => false, 'message' => 'El ticker ya está en watchlist'], 409);
    }

    $stmt = $pdo->prepare("INSERT INTO watchlist (user_id, ticker, name, notes, target_price, stop_loss)
                           VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->execute([$user_id, $ticker, $name, $notes, $target_price, $stop_loss]);

    respond([
        'success' => true,
        'id' => (int)$pdo->lastInsertId(),
        'message' => 'Añadido al watchlist'
    ], 201);
}

if ($method === 'DELETE') {
    $id = get_id();

    if ($id <= 0) {
        respond(['success' => false, 'message' => 'ID inválido'], 422);
    }

    $stmt = $pdo->prepare("DELETE FROM watchlist WHERE id = ? AND user_id = ?");
    $stmt->execute([$id, $user_id]);

    respond([
        'success' => true,
        'message' => 'Eliminado del watchlist'
    ]);
}

respond(['success' => false, 'message' => 'Método no permitido'], 405);