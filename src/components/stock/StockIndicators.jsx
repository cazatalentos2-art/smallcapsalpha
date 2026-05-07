import React from 'react';
import { cn } from '@/lib/utils';
import { formatNumber, formatVolume } from '@/lib/stockUtils';

export default function StockIndicators({ data }) {
  const indicators = [
    { label: 'Market Cap', value: formatNumber(data.market_cap), color: '' },
    { label: 'Volumen', value: formatVolume(data.volume), color: '' },
    { label: 'RVOL', value: `${data.rvol?.toFixed(1)}x`, color: data.rvol > 2 ? 'text-primary' : '' },
    { label: 'Float', value: `${data.float_shares}M`, color: data.float_shares < 15 ? 'text-accent' : '' },
    { label: 'Short Int', value: `${data.short_interest?.toFixed(1)}%`, color: data.short_interest > 20 ? 'text-destructive' : '' },
    { label: 'RSI', value: data.rsi, color: data.rsi > 70 ? 'text-destructive' : data.rsi < 30 ? 'text-primary' : '' },
    { label: 'ATR', value: data.atr?.toFixed(2), color: '' },
    { label: 'VWAP', value: `$${data.vwap?.toFixed(2)}`, color: '' },
    { label: 'Gap%', value: `${data.gap_pct?.toFixed(1)}%`, color: data.gap_pct > 5 ? 'text-primary' : data.gap_pct < -5 ? 'text-destructive' : '' },
    { label: '52W High', value: `$${data.high_52w?.toFixed(2) || '-'}`, color: '' },
    { label: '52W Low', value: `$${data.low_52w?.toFixed(2) || '-'}`, color: '' },
    { label: 'Sector', value: data.sector || '-', color: 'text-accent' },
  ];

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2">
      {indicators.map((ind, i) => (
        <div key={i} className="bg-card border border-border rounded-md p-2.5 text-center">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{ind.label}</p>
          <p className={cn("font-mono text-sm font-semibold mt-1", ind.color)}>{ind.value}</p>
        </div>
      ))}
    </div>
  );
}