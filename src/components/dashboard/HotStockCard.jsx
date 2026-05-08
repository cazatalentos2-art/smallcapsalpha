import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getChangeColor, getScoreBg, getSignalBadgeColor } from '@/lib/stockUtils';
import ScoreGauge from './ScoreGauge';

export default function HotStockCard({ stock, rank }) {
  const isPositive = stock.change_pct >= 0;

  return (
    <Link to={`/stock/${stock.ticker}`}>
      <div className={cn(
        "relative bg-card border rounded-lg p-4 hover:border-primary/40 transition-all group cursor-pointer",
        stock.score >= 80 ? "border-primary/20 glow-green" : "border-border"
      )}>
        {/* Rank badge */}
        <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-secondary border border-border flex items-center justify-center">
          <span className="text-xs font-mono font-bold text-muted-foreground">#{rank}</span>
        </div>

        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-mono font-bold text-sm">{stock.ticker}</span>
              {stock.score >= 80 && <Zap className="w-3 h-3 text-accent fill-accent" />}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-[100px]">{stock.name}</p>
          </div>
          <ScoreGauge score={stock.score || 0} size="sm" />
        </div>

        <div className="flex items-end justify-between">
          <div>
            <span className="font-mono text-lg font-semibold">${stock.price?.toFixed(2)}</span>
            <div className={cn("flex items-center gap-1 text-xs font-mono font-medium mt-0.5", getChangeColor(stock.change_pct))}>
              {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {isPositive ? '+' : ''}{stock.change_pct?.toFixed(2)}%
            </div>
          </div>
          <div className="text-right">
            <span className={cn("text-xs font-mono", stock.rvol > 2 ? "text-primary" : "text-muted-foreground")}>
              RVOL {stock.rvol?.toFixed(1)}x
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mt-3">
          {stock.signals?.slice(0, 2).map((s, i) => (
            <Badge key={i} variant="outline" className={cn("text-[10px] px-1.5 py-0 border", getSignalBadgeColor(s))}>
              {s}
            </Badge>
          ))}
        </div>
      </div>
    </Link>
  );
}