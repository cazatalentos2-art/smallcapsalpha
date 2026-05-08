import React from 'react';
import { cn } from '@/lib/utils';
import { getScoreColor } from '@/lib/stockUtils';

export default function ScoreGauge({ score, size = 'md' }) {
  const sizes = {
    sm: { w: 36, h: 36, stroke: 3, text: 'text-xs' },
    md: { w: 48, h: 48, stroke: 3.5, text: 'text-sm' },
    lg: { w: 64, h: 64, stroke: 4, text: 'text-base' },
  };
  const s = sizes[size];
  const radius = (s.w - s.stroke * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: s.w, height: s.h }}>
      <svg width={s.w} height={s.h} className="-rotate-90">
        <circle
          cx={s.w / 2}
          cy={s.h / 2}
          r={radius}
          stroke="hsl(var(--secondary))"
          strokeWidth={s.stroke}
          fill="none"
        />
        <circle
          cx={s.w / 2}
          cy={s.h / 2}
          r={radius}
          stroke={score >= 80 ? 'hsl(var(--primary))' : score >= 60 ? 'hsl(var(--accent))' : score >= 40 ? 'hsl(var(--chart-4))' : 'hsl(var(--muted-foreground))'}
          strokeWidth={s.stroke}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700"
        />
      </svg>
      <span className={cn("absolute font-mono font-bold", s.text, getScoreColor(score))}>
        {score}
      </span>
    </div>
  );
}