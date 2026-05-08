<?php
require_once __DIR__ . '/helpers.php';

require_login();

$ticker = strtoupper(trim($_GET['ticker'] ?? ''));

if ($ticker === '') {
    respond(['success' => false, 'message' => 'Ticker obligatorio'], 422);
}

$price = round(mt_rand(200, 3200) / 100, 2);
$change = round(mt_rand(-500, 3000) / 100, 2);
$isPositive = $change >= 0;

$data = [
    'ticker' => $ticker,
    'name' => $ticker . ' Holdings Inc.',
    'sector' => 'Technology',
    'price' => $price,
    'change_pct' => $change,
    'volume' => mt_rand(1000000, 50000000),
    'avg_volume' => mt_rand(500000, 10000000),
    'market_cap' => mt_rand(50000000, 2000000000),
    'float_shares' => mt_rand(5, 50),
    'short_interest' => round(mt_rand(0, 350) / 10, 1),
    'rvol' => round(mt_rand(5, 60) / 10, 1),
    'atr' => round(mt_rand(20, 350) / 100, 2),
    'rsi' => mt_rand(35, 85),
    'vwap' => round($price * 0.99, 2),
    'gap_pct' => round(mt_rand(-200, 1500) / 100, 1),
    'high_52w' => round($price * 1.8, 2),
    'low_52w' => round($price * 0.4, 2),
    'score' => mt_rand(45, 96),
    'signals' => $isPositive ? ['Momentum', 'RVOL Alto'] : ['ATR Expand', 'Short Squeeze'],
    'news' => [
        ['title' => "$ticker reports unusual trading activity in premarket session", 'source' => 'MarketWire', 'date' => date('Y-m-d')],
        ['title' => "Analysts highlight volatility setup in $ticker", 'source' => 'Benzinga', 'date' => date('Y-m-d', strtotime('-1 day'))],
        ['title' => "$ticker attracts momentum traders after sector move", 'source' => 'StockNews', 'date' => date('Y-m-d', strtotime('-2 day'))]
    ],
    'analysis_summary' => "El ticker $ticker muestra una estructura de alta volatilidad con atención especulativa creciente. La lectura actual sugiere un setup sensible a volumen, con posibilidad de continuación si mantiene VWAP y confirma ruptura sobre resistencias intradía."
];

respond([
    'success' => true,
    'data' => $data
]);