<?php
require_once __DIR__ . '/helpers.php';

require_login();

function generate_stock($ticker, $name, $sector) {
    $price = round(mt_rand(200, 3200) / 100, 2);
    $change = round(mt_rand(-500, 3000) / 100, 2);
    $volume = mt_rand(1000000, 50000000);
    $rvol = round(mt_rand(5, 60) / 10, 1);
    $rsi = mt_rand(40, 85);
    $atr = round(mt_rand(20, 350) / 100, 2);
    $gap = round(mt_rand(-200, 1500) / 100, 1);
    $si = round(mt_rand(0, 350) / 10, 1);
    $float = mt_rand(5, 50);
    $mcap = mt_rand(50000000, 2000000000);

    $signals = [];
    if ($rvol > 2) $signals[] = 'RVOL Alto';
    if ($gap > 5) $signals[] = 'Gap Up';
    if ($si > 20) $signals[] = 'Short Squeeze';
    if ($float < 15) $signals[] = 'Float Bajo';
    if ($rsi > 65) $signals[] = 'Momentum';
    if ($atr > 1.5) $signals[] = 'ATR Expand';

    $score = 0;
    if ($rvol > 2) $score += 15;
    if ($rvol > 3) $score += 10;
    if ($gap > 5) $score += 12;
    if ($gap > 10) $score += 8;
    if ($atr > 1) $score += 8;
    if ($rsi > 60 && $rsi < 80) $score += 10;
    if ($si > 15) $score += 12;
    if ($si > 25) $score += 8;
    if ($float < 20) $score += 10;
    if ($float < 10) $score += 7;
    if ($change > 5) $score += 5;
    $score = min(100, $score);

    return [
        'ticker' => $ticker,
        'name' => $name,
        'sector' => $sector,
        'price' => $price,
        'change_pct' => $change,
        'volume' => $volume,
        'market_cap' => $mcap,
        'float_shares' => $float,
        'short_interest' => $si,
        'rvol' => $rvol,
        'atr' => $atr,
        'rsi' => $rsi,
        'vwap' => round($price * (1 + (mt_rand(-20, 20) / 1000)), 2),
        'gap_pct' => $gap,
        'score' => $score,
        'signals' => $signals
    ];
}

$items = [
    ['MARA', 'Marathon Digital', 'Crypto Mining'],
    ['IONQ', 'IonQ Inc', 'Quantum Computing'],
    ['SMCI', 'Super Micro Computer', 'Technology'],
    ['RIVN', 'Rivian Automotive', 'EV'],
    ['SOFI', 'SoFi Technologies', 'Fintech'],
    ['PLTR', 'Palantir Technologies', 'AI/Defense'],
    ['AFRM', 'Affirm Holdings', 'Fintech'],
    ['UPST', 'Upstart Holdings', 'AI/Lending'],
    ['LUNR', 'Intuitive Machines', 'Space'],
    ['DNA', 'Ginkgo Bioworks', 'Biotech'],
    ['OPEN', 'Opendoor Technologies', 'Real Estate'],
    ['STEM', 'Stem Inc', 'Clean Energy'],
    ['ASTS', 'AST SpaceMobile', 'Telecom/Space'],
    ['RKLB', 'Rocket Lab USA', 'Aerospace']
];

$result = array_map(fn($s) => generate_stock($s[0], $s[1], $s[2]), $items);
usort($result, fn($a, $b) => $b['score'] <=> $a['score']);

respond([
    'success' => true,
    'stocks' => $result
]);