import React, { useState } from 'react';
import api from '@/api/api';
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
  const [form, setForm] = useState({
    ticker: '',
    condition_type: 'score_above',
    threshold: 80,
    channel: 'email'
  });

  const queryClient = useQueryClient();

  const { data: alerts = [] } = useQuery({
    queryKey: ['alerts'],
    queryFn: async () => {
      const res = await api.get('alerts.php');
      return Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
    }
  });

  const handleCreate = async () => {
    if (!form.ticker.trim()) return;

    try {
      await api.post('alerts.php', {
        ticker: form.ticker.toUpperCase(),
        condition_type: form.condition_type,
        threshold: parseFloat(form.threshold),
        channel: form.channel,
        is_active: true,
      });

      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      setOpen(false);
      setForm({
        ticker: '',
        condition_type: 'score_above',
        threshold: 80,
        channel: 'email'
      });
      toast.success('Alerta creada');
    } catch (error) {
      toast.error(error.message || 'No se pudo crear la alerta');
    }
  };

  const toggleActive = async (alert) => {
    try {
      await api.put(`alerts.php?id=${alert.id}`, {
        is_active: !alert.is_active
      });

      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      toast.success('Estado de alerta actualizado');
    } catch (error) {
      toast.error(error.message || 'No se pudo actualizar la alerta');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`alerts.php?id=${id}`);
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      toast.success('Alerta eliminada');
    } catch (error) {
      toast.error(error.message || 'No se pudo eliminar la alerta');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Alertas</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {alerts.filter(a => a.is_active).length} alertas activas
          </p>
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
                <Select
                  value={form.condition_type}
                  onValueChange={(v) => setForm(f => ({ ...f, condition_type: v }))}
                >
                  <SelectTrigger className="mt-1 bg-secondary">
                    <SelectValue />
                  </SelectTrigger>
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
                <Select
                  value={form.channel}
                  onValueChange={(v) => setForm(f => ({ ...f, channel: v }))}
                >
                  <SelectTrigger className="mt-1 bg-secondary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="in_app">In-App</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleCreate} className="w-full text-xs">
                Crear Alerta
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {alerts.length === 0 && (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <Bell className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No tienes alertas configuradas</p>
        </div>
      