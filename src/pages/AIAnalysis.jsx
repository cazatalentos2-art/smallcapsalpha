import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Brain, Loader2, TrendingUp, Target, AlertTriangle, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getScoreColor } from '@/lib/stockUtils';
import ScoreGauge from '@/components/dashboard/ScoreGauge';
import ReactMarkdown from 'react-markdown';

export default function AIAnalysis() {
  const [ticker, setTicker] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const runAnalysis = async () => {
    if (!ticker.trim()) return;
    setIsAnalyzing(true);

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an expert stock analyst specializing in small cap momentum plays and volatility trading. Analyze the stock ${ticker.toUpperCase()} in detail.

Provide:
1. A volatility score (0-100) based on current technical setup
2. Pattern classification: what technical pattern is forming (e.g. bull flag, cup and handle, squeeze setup, breakout, consolidation)
3. Historical comparison: compare current setup to similar past runners - name 2-3 similar historical setups
4. Probability estimate: what's the probability of continuation (bull or bear)
5. Key support and resistance levels
6. Risk assessment
7. Recommended entry, target, and stop loss
8. Overall analysis summary in Spanish

Be specific with numbers and levels.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          ticker: { type: "string" },
          name: { type: "string" },
          volatility_score: { type: "number" },
          pattern: { type: "string" },
          pattern_description: { type: "string" },
          historical_comparisons: { 
            type: "array", 
            items: { 
              type: "object", 
              properties: { 
                ticker: { type: "string" }, 
                date: { type: "string" }, 
                similarity: { type: "number" },
                outcome: { type: "string" }
              } 
            } 
          },
          continuation_probability: { type: "number" },
          direction: { type: "string" },
          support_levels: { type: "array", items: { type: "number" } },
          resistance_levels: { type: "array", items: { type: "number" } },
          entry_price: { type: "number" },
          target_price: { type: "number" },
          stop_loss: { type: "number" },
          risk_reward_ratio: { type: "number" },
          risk_level: { type: "string" },
          analysis_summary: { type: "string" }
        }
      },
      model: "gemini_3_flash"
    });

    setAnalysis(result);
    setIsAnalyzing(false);
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <Brain className="w-5 h-5 text-chart-5" />
          Análisis con IA
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">Clasificación de patrones, comparación histórica y probabilidades</p>
      </div>

      {/* Search */}
      <div className="flex gap-2 max-w-md">
        <Input
          value={ticker}
          onChange={(e) => setTicker(e.target.value.toUpperCase())}
          placeholder="Ingresa un ticker (ej. MARA)"
          className="font-mono bg-secondary"
          onKeyDown={(e) => e.key === 'Enter' && runAnalysis()}
        />
        <Button onClick={runAnalysis} disabled={isAnalyzing}>
          {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
          <span className="ml-1.5 text-sm">Analizar</span>
        </Button>
      </div>

      {isAnalyzing && (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-chart-5 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Analizando {ticker} con IA...</p>
          <p className="text-xs text-muted-foreground mt-1">Clasificando patrones y buscando setups similares</p>
        </div>
      )}

      {analysis && !isAnalyzing && (
        <div className="space-y-4">
          {/* Header card */}
          <div className="bg-card border border-border rounded-lg p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="font-mono text-xl font-bold">{analysis.ticker}</h2>
                  <Badge variant="outline" className="text-xs border-chart-5/30 text-chart-5 bg-chart-5/10">
                    {analysis.pattern}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{analysis.name}</p>
              </div>
              <ScoreGauge score={analysis.volatility_score || 0} size="lg" />
            </div>

            <p className="text-sm text-muted-foreground mt-4 leading-relaxed">{analysis.pattern_description}</p>
          </div>

          {/* Key metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-card border border-border rounded-lg p-4 text-center">
              <TrendingUp className="w-4 h-4 text-primary mx-auto mb-1" />
              <p className="text-[10px] text-muted-foreground uppercase">Probabilidad</p>
              <p className={cn("font-mono text-lg font-bold", analysis.continuation_probability > 60 ? "text-primary" : "text-accent")}>
                {analysis.continuation_probability}%
              </p>
              <p className="text-xs text-muted-foreground capitalize">{analysis.direction}</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4 text-center">
              <Target className="w-4 h-4 text-accent mx-auto mb-1" />
              <p className="text-[10px] text-muted-foreground uppercase">R:R Ratio</p>
              <p className="font-mono text-lg font-bold text-accent">{analysis.risk_reward_ratio?.toFixed(1)}</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4 text-center">
              <AlertTriangle className="w-4 h-4 text-destructive mx-auto mb-1" />
              <p className="text-[10px] text-muted-foreground uppercase">Riesgo</p>
              <p className="font-mono text-lg font-bold capitalize">{analysis.risk_level}</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4 text-center">
              <BarChart3 className="w-4 h-4 text-chart-4 mx-auto mb-1" />
              <p className="text-[10px] text-muted-foreground uppercase">Vol Score</p>
              <p className={cn("font-mono text-lg font-bold", getScoreColor(analysis.volatility_score || 0))}>
                {analysis.volatility_score}
              </p>
            </div>
          </div>

          {/* Trade plan */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-card border border-border rounded-lg p-5">
              <h3 className="text-sm font-semibold mb-3">Plan de Trading</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-xs text-muted-foreground">Entry</span>
                  <span className="font-mono text-sm font-semibold">${analysis.entry_price?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-xs text-muted-foreground">Target</span>
                  <span className="font-mono text-sm font-semibold text-primary">${analysis.target_price?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-xs text-muted-foreground">Stop Loss</span>
                  <span className="font-mono text-sm font-semibold text-destructive">${analysis.stop_loss?.toFixed(2)}</span>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Soportes</p>
                  <div className="flex gap-1.5">
                    {analysis.support_levels?.map((l, i) => (
                      <Badge key={i} variant="outline" className="font-mono text-xs border-primary/30 text-primary">${l?.toFixed(2)}</Badge>
                    ))}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Resistencias</p>
                  <div className="flex gap-1.5">
                    {analysis.resistance_levels?.map((l, i) => (
                      <Badge key={i} variant="outline" className="font-mono text-xs border-destructive/30 text-destructive">${l?.toFixed(2)}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Historical comps */}
            <div className="bg-card border border-border rounded-lg p-5">
              <h3 className="text-sm font-semibold mb-3">Setups Similares Históricos</h3>
              <div className="space-y-3">
                {analysis.historical_comparisons?.map((comp, i) => (
                  <div key={i} className="p-3 bg-secondary/50 rounded-md">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm font-semibold">{comp.ticker}</span>
                      <Badge variant="outline" className="text-[10px]">{comp.similarity}% similar</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{comp.date}</p>
                    <p className="text-xs mt-1">{comp.outcome}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-card border border-border rounded-lg p-5">
            <h3 className="text-sm font-semibold mb-3">Resumen del Análisis</h3>
            <div className="text-sm text-muted-foreground leading-relaxed prose prose-invert prose-sm max-w-none">
              <ReactMarkdown>{analysis.analysis_summary || ''}</ReactMarkdown>
            </div>
          </div>
        </div>
      )}

      {!analysis && !isAnalyzing && (
        <div className="bg-card border border-border rounded-lg p-16 text-center">
          <Brain className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Ingresa un ticker para obtener un análisis completo con IA</p>
          <p className="text-xs text-muted-foreground mt-1">Incluye clasificación de patrones, comparación histórica y probabilidades</p>
        </div>
      )}
    </div>
  );
}