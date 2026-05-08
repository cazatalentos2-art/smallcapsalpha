import React, { useState } from 'react';
import api from '@/api/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star, Trash2, Plus, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

export default function WatchlistPage() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    ticker: '',
    name: '',
    notes: '',
    target_price: '',
    stop_loss: ''
  });

  const queryClient = useQueryClient();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['watchlist'],
    queryFn: async () => {
      const res = await api.get('watchlist.php');
      return Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
    },
  });

  const handleAdd = async () => {
    if (!form.ticker.trim()) return;

    try {
      await api.post('watchlist.php', {
        ticker: form.ticker.toUpperCase(),
        name: form.name,
        notes: form.notes,
        target_price: form.target_price ? parseFloat(form.target_price) : null,
        stop_loss: form.stop_loss ? parseFloat(form.stop_loss) : null,
      });

      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
      setForm({
        ticker: '',
        name: '',
        notes: '',
        target_price: '',
        stop_loss: ''
      });
      setOpen(false);
      toast.success('Ticker añadido al watchlist');
    } catch (error) {
      toast.error(error.message || 'No se pudo añadir al watchlist');
    }
  };

  const handleRemove = async (id) => {
    try {
      await api.delete(`watchlist.php?id=${id}`);
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
      toast.success('Eliminado del watchlist');
    } catch (error) {
      toast.error(error.message || 'No se pudo eliminar del watchlist');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Watchlist</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{items.length} tickers guardados</p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="text-xs">
              <Plus className="w-3.5 h-3.5 mr-1.5" /> Añadir
            </Button>
          </DialogTrigger>

          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle>Añadir al Watchlist</DialogTitle>
            </DialogHeader>

            <div className="space-y-3 pt-2">
              <div>
                <Label className="text-xs">Ticker *</Label>
                <Input
                  value={form.ticker}
                  onChange={(e) => setForm((f) => ({ ...f, ticker: e.target.value.toUpperCase() }))}
                  placeholder="AAPL"
                  className="mt-1 font-mono bg-secondary"
                />
              </div>

              <div>
                <Label className="text-xs">Nombre</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Apple Inc"
                  className="mt-1 bg-secondary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Target Price</Label>
                  <Input
                    type="number"
                    value={form.target_price}
                    onChange={(e) => setForm((f) => ({ ...f, target_price: e.target.value }))}
                    placeholder="0.00"
                    className="mt-1 font-mono bg-secondary"
                  />
                </div>

                <div>
                  <Label className="text-xs">Stop Loss</Label>
                  <Input
                    type="number"
                    value={form.stop_loss}
                    onChange={(e) => setForm((f) => ({ ...f, stop_loss: e.target.value }))}
                    placeholder="0.00"
                    className="mt-1 font-mono bg-secondary"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs">Notas</Label>
                <Textarea
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  placeholder="Notas sobre la posición..."
                  className="mt-1 bg-secondary h-20"
                />
              </div>

              <Button onClick={handleAdd} className="w-full text-xs">
                Guardar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-3">
        {items.length === 0 && !isLoading && (
          <div className="bg-card border border-border rounded-lg p-12 text-center">
            <Star className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Tu watchlist está vacía</p>
            <p className="text-xs text-muted-foreground mt-1">
              Añade tickers desde el dashboard o el botón de arriba
            </p>
          </div>
        )}

        {items.map((item) => (
          <div
            key={item.id}
            className="bg-card border border-border rounded-lg p-4 flex items-center justify-between hover:border-primary/30 transition-colors group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
                <Star className="w-4 h-4 text-accent fill-accent" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <Link
                    to={`/stock/${item.ticker}`}
                    className="font-mono font-bold text-sm hover:text-primary transition-colors"
                  >
                    {item.ticker}
                  </Link>

                  <Link to={`/stock/${item.ticker}`}>
                    <ExternalLink className="w-3 h-3 text-muted-foreground hover:text-foreground" />
                  </Link>
                </div>

                <p className="text-xs text-muted-foreground">{item.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              {item.target_price && (
                <div className="text-right hidden sm:block">
                  <p className="text-[10px] text-muted-foreground">TARGET</p>
                  <p className="font-mono text-xs text-primary">${item.target_price}</p>
                </div>
              )}

              {item.stop_loss && (
                <div className="text-right hidden sm:block">
                  <p className="text-[10px] text-muted-foreground">STOP</p>
                  <p className="font-mono text-xs text-destructive">${item.stop_loss}</p>
                </div>
              )}

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleRemove(item.id)}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}