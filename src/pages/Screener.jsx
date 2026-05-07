import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Filter, RotateCcw, Download, Loader2 } from 'lucide-react';
import { useScanStocks } from '@/lib/useScanStocks';
import StockTable from '@/components/dashboard/StockTable';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

const defaultFilters = {
  minScore: 0,
  minRvol: 0,
  maxFloat: 100,
  minShortInterest: 0,
  minGap: -100,
  minChange: -100,
  sortBy: 'score',
};

export default function Screener() {
  const { stocks, isScanning, scanStocks } = useScanStocks();
  const [filters, setFilters] = useState(defaultFilters);

  const { data: watchlist = [] } = useQuery({
    queryKey: ['watchlist'],
    queryFn: () => base44.entities.Watchlist.list(),
  });

  useEffect(() => {
    if (stocks.length === 0) scanStocks(false);
  }, []);

  const filtered = useMemo(() => {
    return stocks.filter(s => {
      if ((s.score || 0) < filters.minScore) return false;
      if ((s.rvol || 0) < filters.minRvol) return false;
      if ((s.float_shares || 999) > filters.maxFloat) return false;
      if ((s.short_interest || 0) < filters.minShortInterest) return false;
      if ((s.gap_pct || 0) < filters.minGap) return false;
      if ((s.change_pct || 0) < filters.minChange) return false;
      return true;
    });
  }, [stocks, filters]);

  const exportCSV = () => {
    const headers = ['Ticker', 'Name', 'Price', 'Change%', 'Volume', 'RVOL', 'Float', 'SI%', 'RSI', 'ATR', 'Gap%', 'Score', 'Signals'];
    const rows = filtered.map(s => [
      s.ticker, s.name, s.price, s.change_pct, s.volume, s.rvol, s.float_shares, s.short_interest, s.rsi, s.atr, s.gap_pct, s.score, (s.signals || []).join(';')
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `screener_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Screener Avanzado</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{filtered.length} de {stocks.length} acciones</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={exportCSV} className="text-xs">
            <Download className="w-3.5 h-3.5 mr-1.5" /> CSV
          </Button>
          <Button size="sm" onClick={() => scanStocks(true)} disabled={isScanning} className="text-xs">
            {isScanning ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Filter className="w-3.5 h-3.5 mr-1.5" />}
            Scan con IA
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" /> Filtros
          </h3>
          <Button variant="ghost" size="sm" onClick={() => setFilters(defaultFilters)} className="text-xs text-muted-foreground">
            <RotateCcw className="w-3 h-3 mr-1" /> Reset
          </Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div>
            <Label className="text-xs text-muted-foreground">Score Mín: {filters.minScore}</Label>
            <Slider
              value={[filters.minScore]}
              onValueChange={([v]) => setFilters(f => ({ ...f, minScore: v }))}
              max={100}
              step={5}
              className="mt-2"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">RVOL Mín: {filters.minRvol}x</Label>
            <Slider
              value={[filters.minRvol]}
              onValueChange={([v]) => setFilters(f => ({ ...f, minRvol: v }))}
              max={10}
              step={0.5}
              className="mt-2"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Float Máx: {filters.maxFloat}M</Label>
            <Slider
              value={[filters.maxFloat]}
              onValueChange={([v]) => setFilters(f => ({ ...f, maxFloat: v }))}
              max={100}
              step={5}
              className="mt-2"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">SI% Mín: {filters.minShortInterest}%</Label>
            <Slider
              value={[filters.minShortInterest]}
              onValueChange={([v]) => setFilters(f => ({ ...f, minShortInterest: v }))}
              max={50}
              step={1}
              className="mt-2"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Gap% Mín: {filters.minGap}%</Label>
            <Slider
              value={[filters.minGap]}
              onValueChange={([v]) => setFilters(f => ({ ...f, minGap: v }))}
              min={-20}
              max={30}
              step={1}
              className="mt-2"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Cambio% Mín: {filters.minChange}%</Label>
            <Slider
              value={[filters.minChange]}
              onValueChange={([v]) => setFilters(f => ({ ...f, minChange: v }))}
              min={-20}
              max={50}
              step={1}
              className="mt-2"
            />
          </div>
        </div>
        
        {/* Active filters badges */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {filters.minScore > 0 && <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/30">Score ≥ {filters.minScore}</Badge>}
          {filters.minRvol > 0 && <Badge variant="outline" className="text-[10px] bg-accent/10 text-accent border-accent/30">RVOL ≥ {filters.minRvol}x</Badge>}
          {filters.maxFloat < 100 && <Badge variant="outline" className="text-[10px] bg-chart-5/10 text-chart-5 border-chart-5/30">Float ≤ {filters.maxFloat}M</Badge>}
          {filters.minShortInterest > 0 && <Badge variant="outline" className="text-[10px] bg-destructive/10 text-destructive border-destructive/30">SI ≥ {filters.minShortInterest}%</Badge>}
        </div>
      </div>

      <StockTable 
        stocks={filtered} 
        watchlistTickers={watchlist.map(w => w.ticker)} 
        isLoading={isScanning} 
      />
    </div>
  );
}