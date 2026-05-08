import React from 'react';
import { Link } from 'react-router-dom';
import { Star, TrendingUp, TrendingDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getChangeColor, formatNumber, formatVolume, getSignalBadgeColor } from '@/lib/stockUtils';
import ScoreGauge from './ScoreGauge';

export default function StockRow({ stock, onAddWatchlist, isInWatchlist }) {
  const isPositive = stock.change_pct >= 0;

  return (
    <tr className="border-b border-border/50 hover:bg-secondary/40 transition-colors group">
      <td className="py-3 px-3">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-6 w-6", isInWatchlist ? "text-accent" : "text-muted-foreground opacity-0 group-hover:opacity-100")}
            onClick={(e) => { e.preventDefault(); onAddWatchlist(stock); }}
          >
            <Star className={cn("w-3.5 h-3.5", isInWatchlist && "fill-accent")} />
          </Button>
          <Link to={`/stock/${stock.ticker}`} className="hover:text-primary transition-colors">
            <span className="font-mono font-semibold text-sm">{stock.ticker}</span>
            <p className="text-xs text-muted-foreground truncate max-w-[120px]">{stock.name}</p>
          </Link>
        </div>
      </td>
      <td className="py-3 px-3 text-right font-mono text-sm">
        ${stock.price?.toFixed(2)}
      </td>
      <td className={cn("py-3 px-3 text-right font-mono text-sm font-medium", getChangeColor(stock.change_pct))}>
        <div className="flex items-center justify-end gap-1">
          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {isPositive ? '+' : ''}{stock.change_pct?.toFixed(2)}%
        </div>
      </td>
      <td className="py-3 px-3 text-right font-mono text-xs text-muted-foreground">
        {formatVolume(stock.volume)}
      </td>
      <td className={cn("py-3 px-3 text-right font-mono text-xs", stock.rvol > 2 ? "text-primary font-medium" : "text-muted-foreground")}>
        {stock.rvol?.toFixed(1)}x
      </td>
      <td className="py-3 px-3 text-right font-mono text-xs text-muted-foreground">
        {stock.float_shares}M
      </td>
      <td className="py-3 px-3 text-right font-mono text-xs text-muted-foreground">
        {stock.short_interest?.toFixed(1)}%
      </td>
      <td className="py-3 px-3">
        <div className="flex flex-wrap gap-1 justify-end">
          {stock.signals?.slice(0, 3).map((s, i) => (
            <Badge key={i} variant="outline" className={cn("text-[10px] px-1.5 py-0 border", getSignalBadgeColor(s))}>
              {s}
            </Badge>
          ))}
        </div>
      </td>
      <td className="py-3 px-3">
        <div className="flex justify-center">
          <ScoreGauge score={stock.score || 0} size="sm" />
        </div>
      </td>
    </tr>
  );
}