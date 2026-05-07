import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Bell, Plus, Trash2, Zap, BarChart3, TrendingUp, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const conditionLabels = {
  score_above: { label: 'Score >', icon: Zap, color: 'text-primary' },
  rvol_above: { label: 'RVOL >', icon: BarChart3, color: 'text-accent' },
  volume_spike: { label: 'Vol Spike', icon: TrendingUp, color: 'text-chart-4' },
  breakout: { label: 'Breakout', icon: Target, color: 'text-chart-5' },
  custom: { label: 'Custom', icon: Bell, color: 'text-muted-foreground' },
};

export default function AlertsPage() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ ticker: '', condition_type: 'score_above', threshold: 80, channel: 'email' });
  const queryClient = useQueryClient();

  const { data: alerts = [] } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => base44.entities.Alert.list(),
  });

  const handleCreate = async () => {
    if (!form.ticker.trim()) return;
    await base44.entities.Alert.create({
      ticker: form.ticker.toUpperCase(),
      condition_type: form.condition_type,
      threshold: parseFloat(form.threshold),
      channel: form.channel,
      is_active: true,
    });
    queryClient.invalidateQueries({ queryKey: ['alerts'] });
    setOpen(false);
    setForm({ ticker: '', condition_type: 'score_above', threshold: 80, channel: 'email' });
    toast.success('Alerta creada');
  };

  const toggleActive = async (alert) => {
    await base44.entities.Alert.update(alert.id, { is_active: !alert.is_active });
    queryClient.invalidateQueries({ queryKey: ['alerts'] });
  };

  const handleDelete = async (id) => {
    await base44.entities.Alert.delete(id);
    queryClient.invalidateQueries({ queryKey: ['alerts'] });
    toast.success('Alerta eliminada');
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Alertas</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{alerts.filter(a => a.is_active).length} alertas activas</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="text-xs">
              <Plus className="w-3.5 h-3.5 mr-1.5" /> Nueva Alerta
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle>Crear Alerta</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 pt-2">
              <div>
                <Label className="text-xs">Ticker</Label>
                <Input
                  value={form.ticker}
                  onChange={(e) => setForm(f => ({ ...f, ticker: e.target.value.toUpperCase() }))}
                  placeholder="AAPL"
                  className="mt-1 font-mono bg-secondary"
                />
              </div>
              <div>
                <Label className="text-xs">Condición</Label>
                <Select value={form.condition_type} onValueChange={(v) => setForm(f => ({ ...f, condition_type: v }))}>
                  <SelectTrigger className="mt-1 bg-secondary"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="score_above">Score por encima de</SelectItem>
                    <SelectItem value="rvol_above">RVOL por encima de</SelectItem>
                    <SelectItem value="volume_spike">Spike de Volumen</SelectItem>
                    <SelectItem value="breakout">Ruptura de Resistencia</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Umbral</Label>
                <Input
                  type="number"
                  value={form.threshold}
                  onChange={(e) => setForm(f => ({ ...f, threshold: e.target.value }))}
                  className="mt-1 font-mono bg-secondary"
                />
              </div>
              <div>
                <Label className="text-xs">Canal</Label>
                <Select value={form.channel} onValueChange={(v) => setForm(f => ({ ...f, channel: v }))}>
                  <SelectTrigger className="mt-1 bg-secondary"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="in_app">In-App</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleCreate} className="w-full text-xs">Crear Alerta</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {alerts.length === 0 && (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <Bell className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No tienes alertas configuradas</p>
        </div>
      )}

      <div className="grid gap-3">
        {alerts.map(alert => {
          const config = conditionLabels[alert.condition_type] || conditionLabels.custom;
          const Icon = config.icon;
          return (
            <div key={alert.id} className={cn(
              "bg-card border rounded-lg p-4 flex items-center justify-between transition-all",
              alert.is_active ? "border-border" : "border-border/50 opacity-60"
            )}>
              <div className="flex items-center gap-4">
                <div className={cn("w-10 h-10 rounded-md flex items-center justify-center", 
                  alert.is_active ? "bg-primary/10" : "bg-muted"
                )}>
                  <Icon className={cn("w-4 h-4", alert.is_active ? config.color : "text-muted-foreground")} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm">{alert.ticker}</span>
                    <Badge variant="outline" className="text-[10px] border-border">
                      {config.label} {alert.threshold}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] border-border capitalize">
                      {alert.channel}
                    </Badge>
                  </div>
                  {alert.last_triggered && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Último disparo: {new Date(alert.last_triggered).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  checked={alert.is_active}
                  onCheckedChange={() => toggleActive(alert)}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => handleDelete(alert.id)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}