import React, { useMemo } from 'react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

export default function MiniChart({ positive = true }) {
  const data = useMemo(() => {
    const points = [];
    let value = 50 + Math.random() * 20;
    const trend = positive ? 0.4 : -0.3;
    for (let i = 0; i < 24; i++) {
      value += (Math.random() - 0.45 + trend) * 3;
      value = Math.max(10, value);
      points.push({ v: value });
    }
    return points;
  }, [positive]);

  const color = positive ? 'hsl(142, 72%, 45%)' : 'hsl(0, 75%, 55%)';

  return (
    <div className="h-10 w-20">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id={`grad-${positive}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="v"
            stroke={color}
            fill={`url(#grad-${positive})`}
            strokeWidth={1.5}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}