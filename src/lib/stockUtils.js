// Utility functions for stock analysis

export function calculateScore(stock) {
  let score = 0;
  
  if (stock.rvol > 2) score += 15;
  if (stock.rvol > 3) score += 10;
  if (stock.rvol > 5) score += 5;
  
  if (stock.gap_pct > 5) score += 12;
  if (stock.gap_pct > 10) score += 8;
  
  if (stock.atr > 0) score += 8;
  
  if (stock.rsi > 60 && stock.rsi < 80) score += 10;
  
  if (stock.short_interest > 15) score += 12;
  if (stock.short_interest > 25) score += 8;
  
  if (stock.float_shares && stock.float_shares < 20) score += 10;
  if (stock.float_shares && stock.float_shares < 10) score += 7;
  
  if (stock.change_pct > 5) score += 5;
  
  return Math.min(100, Math.max(0, score));
}

export function getScoreColor(score) {
  if (score >= 80) return 'text-primary';
  if (score >= 60) return 'text-accent';
  if (score >= 40) return 'text-chart-4';
  return 'text-muted-foreground';
}

export function getScoreBg(score) {
  if (score >= 80) return 'bg-primary/15 border-primary/30';
  if (score >= 60) return 'bg-accent/15 border-accent/30';
  if (score >= 40) return 'bg-chart-4/15 border-chart-4/30';
  return 'bg-muted border-border';
}

export function getChangeColor(value) {
  if (value > 0) return 'text-primary';
  if (value < 0) return 'text-destructive';
  return 'text-muted-foreground';
}

export function formatNumber(num) {
  if (!num && num !== 0) return '-';
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
  return num.toFixed(2);
}

export function formatVolume(num) {
  if (!num && num !== 0) return '-';
  if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(0) + 'K';
  return num.toString();
}

export function getSignalBadgeColor(signal) {
  const map = {
    'RVOL Alto': 'bg-primary/20 text-primary border-primary/30',
    'Gap Up': 'bg-accent/20 text-accent border-accent/30',
    'Breakout': 'bg-chart-4/20 text-chart-4 border-chart-4/30',
    'Short Squeeze': 'bg-destructive/20 text-destructive border-destructive/30',
    'Float Bajo': 'bg-chart-5/20 text-chart-5 border-chart-5/30',
    'Momentum': 'bg-primary/20 text-primary border-primary/30',
    'ATR Expand': 'bg-accent/20 text-accent border-accent/30',
    'Vol Premarket': 'bg-chart-4/20 text-chart-4 border-chart-4/30',
  };
  return map[signal] || 'bg-secondary text-secondary-foreground border-border';
}