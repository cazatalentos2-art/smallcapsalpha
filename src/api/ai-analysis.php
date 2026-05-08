<?php
require_once __DIR__ . '/helpers.php';

require_login();

$data = json_input();
$ticker = strtoupper(trim($data['ticker'] ?? ''));

if ($ticker === '') {
    respond(['success' => false, 'message' => 'Ticker obligatorio'], 422);
}

$entry = round(mt_rand(200, 3200) / 100, 2);
$target = round($entry * 1.12, 2);
$stop = round($entry * 0.94, 2);
$rr = $stop < $entry ? round(($target - $entry) / ($entry - $stop), 1) : 0;

respond([
    'ticker' => $ticker,
    'name' => "$ticker Holdings Inc.",
    'volatility_score' => mt_rand(55, 95),
    'pattern' => 'Breakout',
    'pattern_description' => "El precio está comprimiendo por encima de zona de soporte dinámica y muestra expansión de volumen relativa.",
    'historical_comparisons' => [
        ['ticker' => 'MARA', 'date' => '2024-11-14', 'similarity' => 82, 'outcome' => 'Rompió premarket y extendió movimiento durante la sesión.'],
        ['ticker' => 'RKLB', 'date' => '2025-02-03', 'similarity' => 76, 'outcome' => 'Confirmó continuación tras apertura con consolidación corta.'],
        ['ticker' => 'ASTS', 'date' => '2025-06-19', 'similarity' => 71, 'outcome' => 'Setup volátil con barrida inicial y recuperación sobre VWAP.']
    ],
    'continuation_probability' => mt_rand(52, 84),
    'direction' => 'bullish',
    'support_levels' => [round($entry * 0.97, 2), round($entry * 0.94, 2)],
    'resistance_levels' => [round($entry * 1.04, 2), round($entry * 1.09, 2)],
    'entry_price' => $entry,
    'target_price' => $target,
    'stop_loss' => $stop,
    'risk_reward_ratio' => $rr,
    'risk_level' => 'medio',
    'analysis_summary' => "### Lectura general\n\n$ticker presenta una configuración de momentum con posibilidad de continuación si el volumen acompaña la ruptura.\n\n### Plan operativo\n\n- Entrada: sobre confirmación de nivel clave.\n- Stop: bajo soporte inmediato o pérdida de VWAP.\n- Objetivo: extensión hacia resistencias superiores.\n\n### Riesgo\n\nEs un activo apto para operativa táctica, no para ejecución sin gestión activa del riesgo."
]);