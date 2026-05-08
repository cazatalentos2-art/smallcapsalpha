import { useState, useCallback } from 'react';
import api from '@/api/api';

function generateSampleData() {
  const tickers = [
    { ticker: 'MARA', name: 'Marathon Digital', sector: 'Crypto Mining' },
    { ticker: 'BBBY', name: 'Bed Bath & Beyond', sector: 'Retail' },
    { ticker: 'IONQ', name: 'IonQ Inc', sector: 'Quantum Computing' },
    { ticker: 'SMCI', name: 'Super Micro Computer', sector: 'Technology' },
    { ticker: 'RIVN', name: 'Rivian Automotive', sector: 'EV' },
    { ticker: 'SOFI', name: 'SoFi Technologies', sector: 'Fintech' },
    { ticker: 'PLTR', name: 'Palantir Technologies', sector: 'AI/Defense' },
    { ticker: 'AFRM', name: 'Affirm Holdings', sector: 'Fintech' },
    { ticker: 'UPST', name: 'Upstart Holdings', sector: 'AI/Lending' },
    { ticker: 'LUNR', name: 'Intuitive Machines', sector: 'Space' },
    { ticker: 'DNA', name: 'Ginkgo Bioworks', sector: 'Biotech' },
    { ticker: 'OPEN', name: 'Opendoor Technologies', sector: 'Real Estate' },
    { ticker: 'STEM', name: 'Stem Inc', sector: 'Clean Energy' },
    { ticker: 'ASTS', name: 'AST SpaceMobile', sector: 'Telecom/Space' },
    { ticker: 'RKLB', name: 'Rocket Lab USA', sector: 'Aerospace' },
  ];

  return tickers.map(t => {
    const price = (Math.random() * 30 + 2).toFixed(2);
    const change = (Math.random() * 30 - 5).toFixed(2);
    const vol = Math.floor(Math.random() * 50e6 + 1e6);
    const rvol = (Math.random() * 6 + 0.5).toFixed(1);
    const rsi = Math.floor(Math.random() * 40 + 40);
    const atr = (Math.random() * 3 + 0.2).toFixed(2);
    const gap = (Math.random() * 15 - 2).toFixed(1);
    const si = (Math.random() * 35).toFixed(1);
    const floatShares = Math.floor(Math.random() * 50 + 5);
    const mcap = (Math.random() * 1.8e9 + 100e6);

    const signals = [];
    if (parseFloat(rvol) > 2) signals.push('RVOL Alto');
    if (parseFloat(gap) > 5) signals.push('Gap Up');
    if (parseFloat(si) > 20) signals.push('Short Squeeze');
    if (floatShares < 15) signals.push('Float Bajo');
    if (rsi > 65) signals.push('Momentum');
    if (parseFloat(atr) > 1.5) signals.push('ATR Expand');

    let score = 0;
    if (parseFloat(rvol) > 2) score += 15;
    if (parseFloat(rvol) > 3) score += 10;
    if (parseFloat(gap) > 5) score += 12;
    if (parseFloat(gap) > 10) score += 8;
    if (parseFloat(atr) > 1) score += 8;
    if (rsi > 60 && rsi < 80) score += 10;
    if (parseFloat(si) > 15) score += 12;
    if (parseFloat(si) > 25) score += 8;
    if (floatShares < 20) score += 10;
    if (floatShares < 10) score += 7;
    if (parseFloat(change) > 5) score += 5;
    score = Math.min(100, score);

    return {
      ticker: t.ticker,
      name: t.name,
      sector: t.sector,
      price: parseFloat(price),
      change_pct: parseFloat(change),
      volume: vol,
      market_cap: mcap,
      float_shares: floatShares,
      short_interest: parseFloat(si),
      rvol: parseFloat(rvol),
      atr: parseFloat(atr),
      rsi,
      vwap: parseFloat((parseFloat(price) * (1 + (Math.random() * 0.04 - 0.02))).toFixed(2)),
      gap_pct: parseFloat(gap),
      score,
      signals,
    };
  }).sort((a, b) => b.score - a.score);
}

export function useScanStocks() {
  const [stocks, setStocks] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [lastScan, setLastScan] = useState(null);
  const [scanError, setScanError] = useState(null);

  const scanStocks = useCallback(async (useAI = false) => {
    setIsScanning(true);
    setScanError(null);

    try {
      const result = await api.post('scan-stocks.php', { useAI });

      const data = Array.isArray(result?.stocks) ? result.stocks : [];
      if (data.length > 0) {
        const sorted = [...data].sort((a, b) => (b.score || 0) - (a.score || 0));
        setStocks(sorted);
        setLastScan(new Date());
        return sorted;
      }

      const fallback = generateSampleData();
      setStocks(fallback);
      setLastScan(new Date());
      return fallback;
    } catch (error) {
      console.error('Error escaneando acciones:', error);
      setScanError(error.message || 'No se pudo completar el escaneo.');

      const fallback = generateSampleData();
      setStocks(fallback);
      setLastScan(new Date());
      return fallback;
    } finally {
      setIsScanning(false);
    }
  }, []);

  return { stocks, isScanning, lastScan, scanError, scanStocks };
}