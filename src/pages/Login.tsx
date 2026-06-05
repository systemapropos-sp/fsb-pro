import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Eye, EyeOff, ExternalLink, Check } from 'lucide-react';
import { loginWithPin, loginWithPassword, isRateLimited, formatCountdown } from '@/lib/storage';

function PinInput({
  pin,
  onPinChange,
  onSubmit,
  error,
  success,
}: {
  pin: string[];
  onPinChange: (newPin: string[]) => void;
  onSubmit: () => void;
  error: boolean;
  success: boolean;
}) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const [displayValues, setDisplayValues] = useState<(string | null)[]>([null, null, null, null]);
  const timeoutsRef = useRef<number[]>([]);

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  useEffect(() => {
    pin.forEach((digit, i) => {
      if (digit && !displayValues[i]) {
        setDisplayValues((prev) => { const next = [...prev]; next[i] = digit; return next; });
        const timeout = window.setTimeout(() => {
          setDisplayValues((prev) => { const next = [...prev]; next[i] = 'dot'; return next; });
        }, 500);
        timeoutsRef.current[i] = timeout;
      } else if (!digit && displayValues[i]) {
        setDisplayValues((prev) => { const next = [...prev]; next[i] = null; return next; });
        if (timeoutsRef.current[i]) clearTimeout(timeoutsRef.current[i]);
      }
    });
    return () => { timeoutsRef.current.forEach((t) => clearTimeout(t)); };
  }, [pin]);

  const handleChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    if (!digit) return;
    const newPin = [...pin];
    newPin[index] = digit;
    onPinChange(newPin);
    if (index < 3) { inputsRef.current[index + 1]?.focus(); }
    else { inputsRef.current[index]?.blur(); setTimeout(() => onSubmit(), 200); }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const newPin = [...pin];
      if (pin[index]) { newPin[index] = ''; onPinChange(newPin); }
      else if (index > 0) { newPin[index - 1] = ''; onPinChange(newPin); inputsRef.current[index - 1]?.focus(); }
    }
    if (e.key === 'Enter' && pin.every((d) => d)) onSubmit();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    if (pasted.length === 4) {
      onPinChange(pasted.split(''));
      inputsRef.current[3]?.focus();
      setTimeout(() => onSubmit(), 300);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <label className="text-xs font-medium text-muted uppercase tracking-[0.05em]">
        Ingrese su PIN de 4 digitos
      </label>
      <div className="flex gap-3" onPaste={handlePaste}>
        {[0, 1, 2, 3].map((i) => (
          <motion.div key={i}
            animate={error ? { x: [0, -8, 8, -4, 4, 0] } : success ? { scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 0.4 }}>
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-xl font-semibold transition-all duration-200 ${
              success ? 'border-2 border-matador-green bg-matador-green/10 shadow-green' :
              error ? 'border-2 border-accent-red bg-accent-red/10' :
              pin[i] ? 'border-2 border-matador-green bg-matador-green/5' :
              'border-2 border-gray-300 bg-white'
            } ${i === pin.findIndex((d) => !d) && !success ? 'shadow-[0_0_0_4px_rgba(124,179,66,0.2)] border-matador-green' : ''}`}>
              {displayValues[i] === 'dot' ? (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-2 h-2 rounded-full bg-main" />
              ) : displayValues[i] ? (
                <motion.span initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1.1, opacity: 1 }} transition={{ duration: 0.15 }} className="text-main">
                  {displayValues[i]}
                </motion.span>
              ) : (
                <span className="text-gray-300">-</span>
              )}
              <input ref={(el) => { inputsRef.current[i] = el; }} type="text" inputMode="numeric" maxLength={1}
                value={pin[i] || ''} onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)} className="absolute w-14 h-14 opacity-0 cursor-pointer" disabled={success} />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function RateLimitOverlay({ remainingMs }: { remainingMs: number }) {
  const [countdown, setCountdown] = useState(remainingMs);
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => { if (prev <= 1000) { clearInterval(interval); return 0; } return prev - 1000; });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}
      className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/90 backdrop-blur-xl rounded-xl border border-accent-amber/30">
      <Lock size={48} className="text-accent-amber mb-4" />
      <h3 className="text-lg text-main font-semibold mb-2">Demasiados intentos fallidos</h3>
      <p className="text-sm text-accent-amber mb-1">Por favor espere para reintentar.</p>
      <p className="text-xl text-accent-amber font-mono">{formatCountdown(countdown)}</p>
    </motion.div>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const [pin, setPin] = useState<string[]>(['', '', '', '']);
  const [usePassword, setUsePassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rateLimitRemaining, setRateLimitRemaining] = useState(0);

  const checkRateLimit = useCallback(() => {
    const { limited, remainingMs } = isRateLimited();
    if (limited) setRateLimitRemaining(remainingMs);
    return limited;
  }, []);

  useEffect(() => { checkRateLimit(); }, [checkRateLimit]);
  useEffect(() => { if (error) { const timer = setTimeout(() => setError(false), 2000); return () => clearTimeout(timer); } }, [error]);

  const handlePinSubmit = () => {
    if (pin.some((d) => !d)) return;
    if (checkRateLimit()) return;
    setLoading(true);
    setTimeout(() => {
      const ok = loginWithPin(pin.join(''));
      if (ok) { setSuccess(true); setError(false); setTimeout(() => navigate('/'), 800); }
      else { setError(true); setErrorMsg(`PIN incorrecto.`); setPin(['', '', '', '']); checkRateLimit(); }
      setLoading(false);
    }, 400);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) return;
    if (checkRateLimit()) return;
    setLoading(true);
    setTimeout(() => {
      const ok = loginWithPassword(username, password);
      if (ok) { setSuccess(true); setError(false); setTimeout(() => navigate('/'), 800); }
      else { setError(true); setErrorMsg('Usuario o contrasena incorrectos'); checkRateLimit(); }
      setLoading(false);
    }, 400);
  };

  return (
    <div className="fixed inset-0 min-h-screen flex items-center justify-center" style={{ backgroundColor: '#ECEFF1' }}>
      {/* Login Card */}
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number], delay: 0.2 }}
        className="relative z-10 w-full max-w-[420px] mx-4">
        <div className="bg-white rounded-xl shadow-card p-8 relative overflow-hidden">
          {/* Top accent bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-matador-green via-matador-green-light to-matador-green" />

          {rateLimitRemaining > 0 && <RateLimitOverlay remainingMs={rateLimitRemaining} />}

          {/* Logo */}
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }} className="flex flex-col items-center mb-8 mt-2">
            <span className="text-[2.5rem] font-bold text-matador-green tracking-tight">FSB Pro</span>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              className="text-sm text-muted font-medium uppercase tracking-[0.08em]">
              Sistema de Banca Deportiva
            </motion.p>
          </motion.div>

          {/* PIN or Password Form */}
          <AnimatePresence mode="wait">
            {!usePassword ? (
              <motion.div key="pin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                <PinInput pin={pin} onPinChange={setPin} onSubmit={handlePinSubmit} error={error} success={success} />
              </motion.div>
            ) : (
              <motion.form key="password" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs text-muted mb-1.5">Usuario</label>
                  <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                    placeholder="Nombre de usuario" className="w-full h-10 px-3 rounded-lg border border-light bg-white text-sm focus:outline-none focus:border-matador-green focus:ring-1 focus:ring-matador-green/30 transition-all" autoFocus />
                </div>
                <div className="relative">
                  <label className="block text-xs text-muted mb-1.5">Contrasena</label>
                  <input type={showPassword ? 'text' : 'password'} value={password}
                    onChange={(e) => setPassword(e.target.value)} placeholder="********"
                    className="w-full h-10 px-3 pr-10 rounded-lg border border-light bg-white text-sm focus:outline-none focus:border-matador-green focus:ring-1 focus:ring-matador-green/30 transition-all" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-[2.1rem] text-muted hover:text-main transition-colors">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Error Message */}
          <AnimatePresence>
            {error && errorMsg && (
              <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="text-xs text-accent-red text-center mt-3">{errorMsg}</motion.p>
            )}
          </AnimatePresence>

          {/* Toggle */}
          <div className="flex items-center gap-3 mt-5 mb-5">
            <button type="button" onClick={() => { setUsePassword(!usePassword); setError(false); setErrorMsg(''); }}
              className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none"
              style={{ backgroundColor: usePassword ? '#7CB342' : '#E0E0E0' }}>
              <span className="inline-block h-[18px] w-[18px] transform rounded-full bg-white transition-shadow shadow-sm"
                style={{ transform: usePassword ? 'translateX(18px)' : 'translateX(1px)' }} />
            </button>
            <span className="text-xs font-medium text-main">Ingresar con usuario y contrasena</span>
          </div>

          {/* Enter Button */}
          <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
            onClick={usePassword ? handlePasswordSubmit : handlePinSubmit} disabled={loading || success}
            className={`w-full h-12 rounded-lg font-semibold text-sm tracking-[0.1em] transition-all duration-200 flex items-center justify-center gap-2 ${
              success ? 'bg-matador-green text-white' : 'bg-matador-green text-white hover:bg-matador-green-hover hover:shadow-green'
            } ${loading || success ? 'cursor-default' : 'cursor-pointer'}`}>
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : success ? (
              <><Check size={20} /><span>EXITO</span></>
            ) : (
              'ENTRAR'
            )}
          </motion.button>
        </div>

        {/* Bottom Link */}
        <motion.a initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} href="#"
          className="flex items-center justify-center gap-1.5 mt-4 text-xs text-muted hover:text-main hover:underline transition-colors">
          Descarga Drivers de Printers <ExternalLink size={12} />
        </motion.a>
      </motion.div>
    </div>
  );
}
