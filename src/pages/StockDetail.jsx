import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '@/api/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Star, Bell, Loader2, TrendingUp, TrendingDown, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getChangeColor, getSignalBadgeColor } from '@/lib/stockUtils';
import ScoreGauge from '@/components/dashboard/ScoreGauge';
import StockChart from '@/components/stock/StockChart';
import StockNewsPanel from '@/components/stock/StockNewsPanel';
import StockIndicators from '@/components/stock/StockIndicators';

export default function StockDetail() {
  const { ticker } = useParams();
  const [stockData, setStockData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchStockData = async () => {
      if (!ticker) return;

      setIsLoading(true);

      try {
        const result = await api.get(`stock-detail.php?ticker=${encodeURIComponent(ticker)}`);

        if (isMounted) {
          setStockData(result?.data || result || null);
        }
      } catch (error) {
        console.error('Error cargando detalle del stock:', error);
        if (isMounted) {
          setStockData(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchStockData();

    return () => {
      isMounted = false;
    };
  }, [ticker]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
          <p className="text-sm text-muted-foreground font-mono">Cargando {ticker}...</p>
        </div>
      </div>
    );
  }

  if (!stockData) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">No se encontraron datos para {ticker}</p>
        <Link to="/" className="text-primary text-sm mt-2 inline-block">
          Volver al Dashboard
        </Link>
      </div>
    );
  }

  const isPositive = (stockData.change_pct || 0) >= 0;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Link to="/" className="mt-1">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>

          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-mono font-bold">{stockData.ticker || ticker}</h1>
              <ScoreGauge score={stockData.score || 0} size="md" />
            </div>

            <p className="text-sm text-muted-foreground mt-0.5">{stockData.name}</p>

            <div className="flex items-center gap-2 mt-2">
              <span className="font-mono text-3xl font-bold">${stockData.price?.toFixed(2)}</span>
              <div className={cn('flex items-center gap-1 font-mono text-sm font-medium', getChangeColor(stockData.change_pct))}>
                {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {isPositive ? '+' : ''}
                {stockData.change_pct?.toFixed(2)}%
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 mt-2">
              {stockData.signals?.map((s, i) => (
                <Badge key={i} variant="outline" className={cn('text-xs border', getSignalBadgeColor(s))}>
                  {s}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="text-xs">
            <Star className="w-3.5 h-3.5 mr-1.5" /> Watchlist
          </Button>

          <Button variant="outline" size="sm" className="text-xs">
            <Bell className="w-3.5 h-3.5 mr-1.5" /> Alerta
          </Button>

          <a
            href={`https://www.tradingview.com/symbols/${ticker}/`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="sm" className="text-xs">
              <ExternalLink className="w-3.5 h-3.5 mr-1.5" /> TradingView
            </Button>
          </a>
        </div>
      </div>

      <StockIndicators data={stockData} />

      <Tabs defaultValue="chart" className="w-full">
        <TabsList className="bg-secondary">
          <TabsTrigger value="chart">Gráfico</TabsTrigger>
          <TabsTrigger value="news">Noticias</TabsTrigger>
          <TabsTrigger value="analysis">Análisis IA</TabsTrigger>
        </TabsList>

        <TabsContent value="chart" className="mt-4">
          <StockChart ticker={ticker} price={stockData.price} isPositive={isPositive} />
        </TabsContent>

        <TabsContent value="news" className="mt-4">
          <StockNewsPanel news={stockData.news || []} />
        </TabsContent>

        <TabsContent value="analysis" className="mt-4">
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-sm font-semibold mb-3">Análisis de IA</h3>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              {stockData.analysis_summary || 'No hay análisis disponible en este momento.'}
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}