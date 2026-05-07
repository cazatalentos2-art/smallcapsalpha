import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Activity, Loader2, Eye, EyeOff } from 'lucide-react';
import { login } from '@/lib/authService';

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login({ email: form.email, password: form.password });
    setLoading(false);
    // Pass the OTP code via state so the 2FA page can display it (until WhatsApp is wired)
    navigate('/verify-2fa', { state: { userId: result.userId, phone: result.phone, code: result.code } });
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
          <p className="text-sm text-muted-foreground">Terminal de análisis bursátil</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-lg font-bold mb-2">Iniciar sesión</h2>

            <div>
              <Label className="text-xs text-muted-foreground">Email</Label>
              <Input type="email" value={form.email} onChange={set('email')} required placeholder="juan@email.com" className="mt-1 bg-secondary border-border" />
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">Contraseña</Label>
              <div className="relative mt-1">
                <Input
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={set('password')}
                  required
                  placeholder="Tu contraseña"
                  className="bg-secondary border-border pr-10"
                />
                <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive/30 text-destructive text-xs rounded-md px-3 py-2">
                {error}
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full mt-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Continuar →
            </Button>

            <p className="text-center text-xs text-muted-foreground pt-1">
              ¿No tienes cuenta?{' '}
              <Link to="/register" className="text-primary hover:underline">Regístrate</Link>
            </p>
          </form>
        </div>

        <p className="text-center text-[10px] text-muted-foreground mt-4">
          Tras el login recibirás un código de verificación por WhatsApp
        </p>
      </div>
    </div>
  );
}