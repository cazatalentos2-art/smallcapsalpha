import React from 'react';
import { TrendingUp, BarChart3, Zap, AlertTriangle } from 'lucide-react';

export default function MarketStats({ stocks }) {
  const hotCount = stocks.filter(s => s.score >= 80).length;
  const avgRvol = stocks.length > 0 
    ? (stocks.reduce((sum, s) => sum + (s.rvol || 0), 0) / stocks.length).toFixed(1) 
    : '0';
  const topGainer = stocks.length > 0 
    ? stocks.reduce((max, s) => (s.change_pct > max.change_pct ? s : max), stocks[0]) 
    : null;
  const squeezeCount = stocks.filter(s => s.signals?.includes('Short Squeeze')).length;

  const stats = [
    { 
      label: 'Señales Calientes', 
      value: hotCount, 
      icon: Zap, 
      color: 'text-primary',
      bg: 'bg-primary/10'
    },
    { 
      label: 'RVOL Promedio', 
      value: `${avgRvol}x`, 
      icon: BarChart3, 
      color: 'text-accent',
      bg: 'bg-accent/10'
    },
    { 
      label: 'Top Gainer', 
      value: topGainer ? `${topGainer.ticker} +${topGainer.change_pct?.toFixed(1)}%` : '-', 
      icon: TrendingUp, 
      color: 'text-chart-4',
      bg: 'bg-chart-4/10'
    },
    { 
      label: 'Squeeze Alerts', 
      value: squeezeCount, 
      icon: AlertTriangle, 
      color: 'text-destructive',
      bg: 'bg-destructive/10'
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat, i) => (
        <div key={i} className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-8 h-8 rounded-md ${stat.bg} flex items-center justify-center`}>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
          </div>
          <p className="text-xl font-mono font-bold">{stat.value}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}