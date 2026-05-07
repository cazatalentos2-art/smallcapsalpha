import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

function getHeatColor(score, changePct) {
  if (changePct > 10) return 'bg-emerald-500/80 text-white';
  if (changePct > 5) return 'bg-emerald-500/50 text-white';
  if (changePct > 2) return 'bg-emerald-500/30 text-emerald-100';
  if (changePct > 0) return 'bg-emerald-500/15 text-emerald-300';
  if (changePct > -2) return 'bg-red-500/15 text-red-300';
  if (changePct > -5) return 'bg-red-500/30 text-red-100';
  return 'bg-red-500/50 text-white';
}

export default function VolatilityHeatmap({ stocks }) {
  if (!stocks || stocks.length === 0) return null;

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-accent" />
        Heatmap de Volatilidad
      </h3>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-1.5">
        {stocks.slice(0, 15).map((stock) => (
          <Link
            key={stock.ticker}
            to={`/stock/${stock.ticker}`}
            className={cn(
              "rounded-md p-2 text-center hover:ring-1 hover:ring-primary/50 transition-all cursor-pointer",
              getHeatColor(stock.score, stock.change_pct)
            )}
          >
            <span className="font-mono text-xs font-bold block">{stock.ticker}</span>
            <span className="font-mono text-[10px] block mt-0.5">
              {stock.change_pct >= 0 ? '+' : ''}{stock.change_pct?.toFixed(1)}%
            </span>
            <span className="text-[9px] opacity-70 block">
              Score {stock.score}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}