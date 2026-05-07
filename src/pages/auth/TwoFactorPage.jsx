import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Activity, Loader2, MessageCircle, RotateCcw, ShieldCheck } from 'lucide-react';
import { verify2FA, resend2FA } from '@/lib/authService';
import { useAppAuth } from '@/lib/AppAuthContext';
import { cn } from '@/lib/utils';

export default function TwoFactorPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login: setSession } = useAppAuth();

  // State from login
  const userId = location.state?.userId;
  const phone = location.state?.phone || '';
  const devCode = location.state?.code; // dev-only until WhatsApp is wired

  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [success, setSuccess] = useState(false);
  const [newDevCode, setNewDevCode] = useState(null);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (!userId) navigate('/login');
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (resendCooldown > 0) {
      const t = setTimeout(() => setResendCooldown(c => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendCooldown]);

  const handleDigitChange = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...digits];
    next[i] = val;
    setDigits(next);
    if (val && i < 5) inputRefs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      inputRefs.current[i - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && i > 0) inputRefs.current[i - 1]?.focus();
    if (e.key === 'ArrowRight' && i < 5) inputRefs.current[i + 1]?.focus();
  };

  const handlePaste = (e) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (text.length === 6) {
      setDigits(text.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = digits.join('');
    if (code.length < 6) { setError('Introduce los 6 dígitos.'); return; }
    setError('');
    setLoading(true);

    const { session } = await verify2FA({ userId, code });
    setSession(session);
    setSuccess(true);
    setLoading(false);
    setTimeout(() => navigate('/'), 1000);
  };

  const handleResend = async () => {
    setError('');
    const result = await resend2FA(userId);
    setNewDevCode(result.code);
    setResendCooldown(60);
    setDigits(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
  };

  const maskedPhone = phone ? phone.slice(0, -4).replace(/./g, '*') + phone.slice(-4) : '***';
  const displayCode = newDevCode || devCode;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <Activity className="w-7 h-7 text-primary" />
            <span className="font-bold text-xl tracking-wider">
              VOLATILITY<span className="text-primary">LAB</span>
            </span>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-8">
          {success ? (
            <div className="text-center py-6">
              <div className="w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-8 h-8 text-primary" />
              </div>
              <p className="font-bold text-lg">¡Verificado!</p>
              <p className="text-sm text-muted-foreground mt-1">Accediendo al terminal...</p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Icon + title */}
              <div className="text-center">
                <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-3">
                  <MessageCircle className="w-7 h-7 text-primary" />
                </div>
                <h2 className="text-lg font-bold">Verificación en 2 pasos</h2>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                  Hemos enviado un código de 6 dígitos a tu WhatsApp
                  <br />
                  <span className="font-mono text-foreground">{maskedPhone}</span>
                </p>
              </div>

              {/* DEV NOTICE — remove when WhatsApp is configured */}
              {displayCode && (
                <div className="bg-accent/10 border border-accent/30 rounded-md px-3 py-2.5 text-center">
                  <p className="text-[10px] text-accent uppercase tracking-wider font-semibold mb-1">
                    ⚠ Modo desarrollo — código temporal
                  </p>
                  <p className="font-mono text-2xl font-bold tracking-[0.3em] text-accent">{displayCode}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    (WhatsApp aún no configurado — usa este código)
                  </p>
                </div>
              )}

              {/* OTP inputs */}
              <div className="flex gap-2 justify-center" onPaste={handlePaste}>
                {digits.map((d, i) => (
                  <input
                    key={i}
                    ref={el => inputRefs.current[i] = el}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={d}
                    onChange={e => handleDigitChange(i, e.target.value)}
                    onKeyDown={e => handleKeyDown(i, e)}
                    className={cn(
                      "w-11 h-14 text-center text-xl font-mono font-bold rounded-lg border bg-secondary transition-all outline-none",
                      d ? "border-primary text-primary" : "border-border text-foreground",
                      "focus:border-primary focus:ring-1 focus:ring-primary/40"
                    )}
                  />
                ))}
              </div>

              {error && (
                <div className="bg-destructive/10 border border-destructive/30 text-destructive text-xs rounded-md px-3 py-2 text-center">
                  {error}
                </div>
              )}

              <Button
                onClick={handleVerify}
                disabled={loading || digits.join('').length < 6}
                className="w-full"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ShieldCheck className="w-4 h-4 mr-2" />}
                Verificar y acceder
              </Button>

              {/* Resend */}
              <div className="text-center">
                {resendCooldown > 0 ? (
                  <p className="text-xs text-muted-foreground">
                    Reenviar en <span className="font-mono text-foreground">{resendCooldown}s</span>
                  </p>
                ) : (
                  <button
                    onClick={handleResend}
                    className="text-xs text-primary hover:underline flex items-center gap-1 mx-auto"
                  >
                    <RotateCcw className="w-3 h-3" /> Reenviar código
                  </button>
                )}
              </div>

              <p className="text-center text-xs text-muted-foreground">
                ¿Número incorrecto?{' '}
                <a href="/login" className="text-primary hover:underline">Volver al login</a>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}