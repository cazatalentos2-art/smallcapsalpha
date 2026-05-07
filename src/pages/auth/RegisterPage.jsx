import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Activity, Loader2, Eye, EyeOff, UserPlus } from 'lucide-react';
import { register } from '@/lib/authService';
import { cn } from '@/lib/utils';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirm) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (form.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (!form.phone.startsWith('+')) {
      setError('Incluye el prefijo de país en el teléfono (ej. +34612345678).');
      return;
    }

    setLoading(true);
    await register({ email: form.email, password: form.password, fullName: form.fullName, phone: form.phone });
    setSuccess(true);
    setLoading(false);
    setTimeout(() => navigate('/login'), 2000);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <Activity className="w-7 h-7 text-primary" />
            <span className="font-bold text-xl tracking-wider">
              VOLATILITY<span className="text-primary">LAB</span>
            </span>
          </div>
          <p className="text-sm text-muted-foreground">Crea tu cuenta de trading</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-8">
          {success ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <UserPlus className="w-6 h-6 text-primary" />
              </div>
              <p className="font-semibold">¡Cuenta creada!</p>
              <p className="text-sm text-muted-foreground mt-1">Redirigiendo al login...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="text-lg font-bold mb-2">Registro</h2>

              <div>
                <Label className="text-xs text-muted-foreground">Nombre completo</Label>
                <Input value={form.fullName} onChange={set('fullName')} required placeholder="Juan García" className="mt-1 bg-secondary border-border" />
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Email</Label>
                <Input type="email" value={form.email} onChange={set('email')} required placeholder="juan@email.com" className="mt-1 bg-secondary border-border" />
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">
                  Teléfono WhatsApp <span className="text-accent">(con prefijo de país)</span>
                </Label>
                <Input value={form.phone} onChange={set('phone')} required placeholder="+34612345678" className="mt-1 bg-secondary border-border font-mono" />
                <p className="text-[10px] text-muted-foreground mt-1">Se usará para la verificación en 2 pasos.</p>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Contraseña</Label>
                <div className="relative mt-1">
                  <Input type={showPw ? 'text' : 'password'} value={form.password} onChange={set('password')} required placeholder="Mínimo 8 caracteres" className="bg-secondary border-border pr-10" />
                  <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Confirmar contraseña</Label>
                <Input type={showPw ? 'text' : 'password'} value={form.confirm} onChange={set('confirm')} required placeholder="Repite la contraseña" className="mt-1 bg-secondary border-border" />
              </div>

              {error && (
                <div className="bg-destructive/10 border border-destructive/30 text-destructive text-xs rounded-md px-3 py-2">
                  {error}
                </div>
              )}

              <Button type="submit" disabled={loading} className="w-full mt-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Crear cuenta
              </Button>

              <p className="text-center text-xs text-muted-foreground pt-1">
                ¿Ya tienes cuenta?{' '}
                <Link to="/login" className="text-primary hover:underline">Inicia sesión</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}