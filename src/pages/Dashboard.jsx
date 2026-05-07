import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, RefreshCw } from 'lucide-react';
import { useScanStocks } from '@/lib/useScanStocks';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import MarketStats from '@/components/dashboard/MarketStats';
import HotStockCard from '@/components/dashboard/HotStockCard';
import VolatilityHeatmap from '@/components/dashboard/VolatilityHeatmap';
import StockTable from '@/components/dashboard/StockTable';

export default function Dashboard() {
  const { stocks, isScanning, lastScan, scanStocks } = useScanStocks();
  const [useAI, setUseAI] = useState(false);

  const { data: watchlist = [] } = useQuery({
    queryKey: ['watchlist'],
    queryFn: () => base44.entities.Watchlist.list(),
  });

  useEffect(() => {
    scanStocks(false);
  }, []);

  useEffect(() => {
    const handler = () => scanStocks(useAI);
    window.addEventListener('app-refresh', handler);
    return () => window.removeEventListener('app-refresh', handler);
  }, [useAI]);

  const hotStocks = stocks.filter(s => s.score >= 60).slice(0, 6);
  const watchlistTickers = watchlist.map(w => w.ticker);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-xs text-muted-foreground font-mono mt-0.5">
            {lastScan ? `Último scan: ${lastScan.toLocaleTimeString()}` : 'Sin datos aún'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={useAI ? "default" : "outline"}
            size="sm"
            onClick={() => setUseAI(!useAI)}
            className="text-xs"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            {useAI ? 'IA Activa' : 'Activar IA'}
          </Button>
          <Button
            size="sm"
            onClick={() => scanStocks(useAI)}
            disabled={isScanning}
            className="text-xs"
          >
            {isScanning ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5 mr-1.5" />}
            Escanear
          </Button>
        </div>
      </div>

      {/* Stats */}
      <MarketStats stocks={stocks} />

      {/* Hot stocks */}
      {hotStocks.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-live-pulse" />
            Acciones Calientes
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {hotStocks.map((stock, i) => (
              <HotStockCard key={stock.ticker} stock={stock} rank={i + 1} />
            ))}
          </div>
        </div>
      )}

      {/* Heatmap + Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-1">
          <VolatilityHeatmap stocks={stocks} />
        </div>
        <div className="lg:col-span-2">
          <StockTable 
            stocks={stocks} 
            watchlistTickers={watchlistTickers} 
            isLoading={isScanning} 
          />
        </div>
      </div>
    </div>
  );
}