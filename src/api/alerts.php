<?php
require_once __DIR__ . '/helpers.php';

require_login();
$user_id = get_user_id();
$method = request_method();

if ($method === 'GET') {
    $stmt = $pdo->prepare("SELECT id, ticker, condition_type, threshold, channel, is_active, last_triggered, created_at
                           FROM alerts
                           WHERE user_id = ?
                           ORDER BY created_at DESC");
    $stmt->execute([$user_id]);
    $rows = $stmt->fetchAll();

    foreach ($rows as &$row) {
        $row['is_active'] = (bool)$row['is_active'];
        $row['threshold'] = (float)$row['threshold'];
    }

    respond($rows);
}

if ($method === 'POST') {
    $data = json_input();

    $ticker = strtoupper(trim($data['ticker'] ?? ''));
    $condition_type = trim($data['condition_type'] ?? 'score_above');
    $threshold = isset($data['threshold']) ? (float)$data['threshold'] : 0;
    $channel = trim($data['channel'] ?? 'email');
    $is_active = !empty($data['is_active']) ? 1 : 0;

    if ($ticker === '') {
        respond(['success' => false, 'message' => 'Ticker obligatorio'], 422);
    }

    $stmt = $pdo->prepare("INSERT INTO alerts (user_id, ticker, condition_type, threshold, channel, is_active)
                           VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->execute([$user_id, $ticker, $condition_type, $threshold, $channel, $is_active]);

    respond([
        'success' => true,
        'id' => (int)$pdo->lastInsertId(),
        'message' => 'Alerta creada'
    ], 201);
}

if ($method === 'PUT' || $method === 'PATCH') {
    $id = get_id();
    $data = json_input();

    if ($id <= 0) {
        respond(['success' => false, 'message' => 'ID inválido'], 422);
    }

    $fields = [];
    $values = [];

    if (isset($data['is_active'])) {
        $fields[] = 'is_active = ?';
        $values[] = !empty($data['is_active']) ? 1 : 0;
    }

    if (isset($data['threshold'])) {
        $fields[] = 'threshold = ?';
        $values[] = (float)$data['threshold'];
    }

    if (isset($data['channel'])) {
        $fields[] = 'channel = ?';
        $values[] = trim($data['channel']);
    }

    if (empty($fields)) {
        respond(['success' => false, 'message' => 'No hay campos para actualizar'], 422);
    }

    $values[] = $id;
    $values[] = $user_id;

    $sql = "UPDATE alerts SET " . implode(', ', $fields) . " WHERE id = ? AND user_id = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($values);

    respond([
        'success' => true,
        'message' => 'Alerta actualizada'
    ]);
}

if ($method === 'DELETE') {
    $id = get_id();

    if ($id <= 0) {
        respond(['success' => false, 'message' => 'ID inválido'], 422);
    }

    $stmt = $pdo->prepare("DELETE FROM alerts WHERE id = ? AND user_id = ?");
    $stmt->execute([$id, $user_id]);

    respond([
        'success' => true,
        'message' => 'Alerta eliminada'
    ]);
}

respond(['success' => false, 'message' => 'Método no permitido'], 405);