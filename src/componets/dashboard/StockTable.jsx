import React, { useState } from 'react';
import { ArrowUpDown, Loader2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import api from '@/api/api';
import StockRow from './StockRow';

const columns = [
  { key: 'ticker', label: 'Ticker', align: 'left' },
  { key: 'price', label: 'Precio', align: 'right' },
  { key: 'change_pct', label: '%Cambio', align: 'right' },
  { key: 'volume', label: 'Volumen', align: 'right' },
  { key: 'rvol', label: 'RVOL', align: 'right' },
  { key: 'float_shares', label: 'Float', align: 'right' },
  { key: 'short_interest', label: 'SI%', align: 'right' },
  { key: 'signals', label: 'Señales', align: 'right' },
  { key: 'score', label: 'Score', align: 'center' },
];

export default function StockTable({ stocks = [], watchlistTickers = [], isLoading }) {
  const [sortKey, setSortKey] = useState('score');
  const [sortDir, setSortDir] = useState(-1);
  const queryClient = useQueryClient();

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => d * -1);
    } else {
      setSortKey(key);
      setSortDir(-1);
    }
  };

  const sorted = [...stocks].sort((a, b) => {
    const aVal = a?.[sortKey] ?? 0;
    const bVal = b?.[sortKey] ?? 0;

    if (typeof aVal === 'string' || typeof bVal === 'string') {
      return String(aVal).localeCompare(String(bVal), 'es', { numeric: true }) * sortDir;
    }

    return (aVal - bVal) * sortDir;
  });

  const handleAddWatchlist = async (stock) => {
    if (!stock?.ticker || watchlistTickers.includes(stock.ticker)) return;

    try {
      await api.post('watchlist.php', {
        ticker: stock.ticker,
        name: stock.name || ''
      });

      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
    } catch (error) {
      console.error('Error al añadir a watchlist:', error);
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h3 className="text-sm font-semibold">Screener en Tiempo Real</h3>
        <span className="text-xs text-muted-foreground font-mono">{stocks.length} acciones</span>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="ml-2 text-sm text-muted-foreground">Escaneando mercados...</span>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => col.key !== 'signals' && handleSort(col.key)}
                    className={cn(
                      'py-2.5 px-3 text-xs font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors select-none',
                      col.align === 'right' && 'text-right',
                      col.align === 'center' && 'text-center'
                    )}
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.label}
                      {sortKey === col.key && (
                        <ArrowUpDown className="w-3 h-3 text-primary" />
                      )}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((stock) => (
                <StockRow
                  key={stock.ticker}
                  stock={stock}
                  onAddWatchlist={handleAddWatchlist}
                  isInWatchlist={watchlistTickers.includes(stock.ticker)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}