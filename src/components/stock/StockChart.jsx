import React, { useMemo, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar, ComposedChart } from 'recharts';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function StockChart({ ticker, price = 10, isPositive = true }) {
  const [period, setPeriod] = useState('1D');
  
  const data = useMemo(() => {
    const points = [];
    const periods = { '1D': 78, '5D': 390, '1M': 22, '3M': 66, '1Y': 252 };
    const numPoints = periods[period] || 78;
    let val = price * (0.85 + Math.random() * 0.1);
    const trend = isPositive ? 0.002 : -0.001;

    for (let i = 0; i < numPoints; i++) {
      val += val * (Math.random() * 0.04 - 0.018 + trend);
      val = Math.max(val * 0.7, val);
      const volume = Math.floor(Math.random() * 2000000 + 200000);
      
      let label = '';
      if (period === '1D') {
        const hour = 9 + Math.floor(i / 12);
        const min = (i % 12) * 5;
        label = `${hour}:${min.toString().padStart(2, '0')}`;
      } else {
        label = `Day ${i + 1}`;
      }
      
      points.push({ time: label, price: parseFloat(val.toFixed(2)), volume });
    }
    return points;
  }, [price, isPositive, period]);

  const color = isPositive ? 'hsl(142, 72%, 45%)' : 'hsl(0, 75%, 55%)';
  const minPrice = Math.min(...data.map(d => d.price)) * 0.998;
  const maxPrice = Math.max(...data.map(d => d.price)) * 1.002;

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold font-mono">{ticker}</h3>
        <div className="flex gap-1">
          {['1D', '5D', '1M', '3M', '1Y'].map(p => (
            <Button
              key={p}
              variant={period === p ? "default" : "ghost"}
              size="sm"
              className="h-7 px-2.5 text-xs font-mono"
              onClick={() => setPeriod(p)}
            >
              {p}
            </Button>
          ))}
        </div>
      </div>

      {/* Price chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.2} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 14%)" />
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 10, fill: 'hsl(215, 15%, 50%)' }} 
              axisLine={false}
              tickLine={false}
              interval={Math.floor(data.length / 6)}
            />
            <YAxis 
              domain={[minPrice, maxPrice]}
              tick={{ fontSize: 10, fill: 'hsl(215, 15%, 50%)' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${v.toFixed(2)}`}
              width={60}
            />
            <Tooltip
              contentStyle={{ 
                backgroundColor: 'hsl(220, 18%, 9%)', 
                border: '1px solid hsl(220, 15%, 16%)',
                borderRadius: '6px',
                fontSize: '12px'
              }}
              formatter={(value) => [`$${value.toFixed(2)}`, 'Precio']}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke={color}
              fill="url(#priceGrad)"
              strokeWidth={2}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Volume bars */}
      <div className="h-16 mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 0, right: 5, left: 0, bottom: 0 }}>
            <Bar dataKey="volume" fill="hsl(220, 15%, 20%)" radius={[1, 1, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}