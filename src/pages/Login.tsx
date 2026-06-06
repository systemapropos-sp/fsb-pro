import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Eye, EyeOff, ExternalLink, Check } from 'lucide-react';
import { loginWithPin, loginWithPassword, isRateLimited, formatCountdown } from '@/lib/storage';
import { createSession, logAudit, sanitizeInput } from '@/lib/security';

function PinInput({
  pin,
  onPinChange,
  onSubmit,
  error,
  success,
}: {
  pin: string[];
  onPinChange: (newPin: string[]) => void;
  onSubmit: (submittedPin: string[]) => void;
  error: boolean;
  success: boolean;
}) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const [displayValues, setDisplayValues] = useState<(string | null)[]>([
    null,
    null,
    null,
    null,
  ]);
  const timeoutsRef = useRef<number[]>([]);

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  useEffect(() => {
    // Sync display values with pin
    pin.forEach((digit, i) => {
      if (digit && !displayValues[i]) {
        setDisplayValues((prev) => {
          const next = [...prev];
          next[i] = digit;
          return next;
        });
        // Convert to dot after 500ms
        const timeout = window.setTimeout(() => {
          setDisplayValues((prev) => {
            const next = [...prev];
            next[i] = 'dot';
            return next;
          });
        }, 500);
        timeoutsRef.current[i] = timeout;
      } else if (!digit && displayValues[i]) {
        setDisplayValues((prev) => {
          const next = [...prev];
          next[i] = null;
          return next;
        });
        if (timeoutsRef.current[i]) {
          clearTimeout(timeoutsRef.current[i]);
        }
      }
    });
    return () => {
      timeoutsRef.current.forEach((t) => clearTimeout(t));
    };
  }, [pin]);

  const handleChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    if (!digit) return;

    const newPin = [...pin];
    newPin[index] = digit;
    onPinChange(newPin);

    if (index < 3) {
      inputsRef.current[index + 1]?.focus();
    } else {
      // Auto-submit when 4th digit is entered — pass PIN directly to avoid async state issue
      inputsRef.current[index]?.blur();
      onSubmit(newPin);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const newPin = [...pin];
      if (pin[index]) {
        newPin[index] = '';
        onPinChange(newPin);
      } else if (index > 0) {
        newPin[index - 1] = '';
        onPinChange(newPin);
        inputsRef.current[index - 1]?.focus();
      }
    }
    if (e.key === 'Enter' && pin.every((d) => d)) {
      onSubmit(pin);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    if (pasted.length === 4) {
      const newPin = pasted.split('');
      onPinChange(newPin);
      inputsRef.current[3]?.focus();
      onSubmit(newPin);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <label className="text-xs font-medium text-[#94A3B8] uppercase tracking-[0.05em]">
        Ingrese su PIN de 4 digitos
      </label>
      <div className="flex gap-3" onPaste={handlePaste}>
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            animate={
              error
                ? { x: [0, -8, 8, -4, 4, 0] }
                : success
                  ? { scale: [1, 1.05, 1] }
                  : {}
            }
            transition={{ duration: 0.4 }}
          >
            <div
              className={`w-14 h-14 rounded-pin flex items-center justify-center text-h2 font-semibold transition-all duration-200 ${
                success
                  ? 'border-2 border-accent-green bg-accent-green/10 shadow-[0_0_16px_rgba(34,197,94,0.3)]'
                  : error
                    ? 'border-2 border-accent-red bg-accent-red/10'
                    : pin[i]
                      ? 'border-2 border-accent-green bg-accent-green/5'
                      : 'border-2 border-gray-300 bg-white'
              } ${
                i === pin.findIndex((d) => !d) && !success
                  ? 'shadow-[0_0_0_4px_rgba(59,130,246,0.2)] border-accent-blue'
                  : ''
              }`}
            >
              {displayValues[i] === 'dot' ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-2 h-2 rounded-full bg-[#1E293B]"
                />
              ) : displayValues[i] ? (
                <motion.span
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1.1, opacity: 1 }}
                  transition={{ duration: 0.15 }}
                  className="text-[#1E293B]"
                >
                  {displayValues[i]}
                </motion.span>
              ) : (
                <span className="text-[#CBD5E1]/50">-</span>
              )}
              <input
                ref={(el) => {
                  inputsRef.current[i] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={pin[i] || ''}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className="absolute w-14 h-14 opacity-0 cursor-pointer"
                disabled={success}
              />
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
      setCountdown((prev) => {
        if (prev <= 1000) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
      className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/90 backdrop-blur-xl rounded-xl border border-accent-amber/30 animate-pulse-glow"
    >
      <Lock size={48} className="text-accent-amber mb-4" />
      <h3 className="text-h4 text-[#1E293B] font-semibold mb-2">
        Demasiados intentos fallidos
      </h3>
      <p className="text-body text-accent-amber mb-1">
        Por favor espere para reintentar.
      </p>
      <p className="text-mono-lg text-accent-amber font-mono">
        {formatCountdown(countdown)}
      </p>
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
  const [attempts, setAttempts] = useState(0);
  const [rateLimitRemaining, setRateLimitRemaining] = useState(0);

  const checkRateLimit = useCallback(() => {
    const { limited, remainingMs } = isRateLimited();
    if (limited) {
      setRateLimitRemaining(remainingMs);
    }
    return limited;
  }, []);

  useEffect(() => {
    checkRateLimit();
  }, [checkRateLimit]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handlePinSubmit = (submittedPin?: string[]) => {
    const pinToCheck = submittedPin || pin;
    if (pinToCheck.some((d) => !d)) return;
    if (checkRateLimit()) return;

    setLoading(true);
    const pinStr = pinToCheck.join('');

    setTimeout(() => {
      const ok = loginWithPin(pinStr);
      if (ok) {
        setSuccess(true);
        setError(false);
        createSession('mmw03');
        logAudit({ action: 'LOGIN', userId: 'mmw03', details: 'Login via PIN' });
        setTimeout(() => navigate('/'), 800);
      } else {
        setError(true);
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        setErrorMsg(`PIN incorrecto. Intento ${newAttempts} de 5.`);
        setPin(['', '', '', '']);
        checkRateLimit();
      }
      setLoading(false);
    }, 400);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) return;
    if (checkRateLimit()) return;

    setLoading(true);
    setTimeout(() => {
      const safeUser = sanitizeInput(username);
      const ok = loginWithPassword(safeUser, password);
      if (ok) {
        setSuccess(true);
        setError(false);
        createSession(safeUser);
        logAudit({ action: 'LOGIN', userId: safeUser, details: 'Login via password' });
        setTimeout(() => navigate('/'), 800);
      } else {
        setError(true);
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        setErrorMsg('Usuario o contrasena incorrectos');
        checkRateLimit();
      }
      setLoading(false);
    }, 400);
  };

  // Background particles
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: Math.random() * 18,
    duration: 15 + Math.random() * 10,
    size: 2 + Math.random() * 2,
  }));

  return (
    <div className="fixed inset-0 min-h-[100dvh] flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center animate-bg-zoom"
        style={{ backgroundImage: 'url(/login-bg.jpg)' }}
      />
      {/* White overlay for light theme */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-white/85 via-white/90 to-[#F1F5F9]/95"
      />

      {/* Diagonal lines */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(-45deg, transparent, transparent 100px, rgba(59,130,246,0.5) 100px, rgba(59,130,246,0.5) 101px)',
        }}
      />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full animate-float-up"
            style={{
              left: p.left,
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: 'rgba(59,130,246,0.2)',
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
            }}
          />
        ))}
      </div>

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.6,
          ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
          delay: 0.2,
        }}
        className="relative z-10 w-full max-w-[420px] mx-4"
      >
        <div className="bg-white/90 backdrop-blur-xl rounded-xl border border-gray-200 p-9 shadow-xl relative overflow-hidden">
          {rateLimitRemaining > 0 && (
            <RateLimitOverlay remainingMs={rateLimitRemaining} />
          )}

          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.5,
              ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
              delay: 0.3,
            }}
            className="flex flex-col items-center mb-8"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[2.5rem] font-bold text-accent-blue tracking-tight">
                FSB Pro
              </span>
            </div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-sm text-[#94A3B8] font-medium uppercase tracking-[0.08em]"
            >
              Sistema de Banca Deportiva
            </motion.p>
          </motion.div>

          {/* PIN or Password Form */}
          <AnimatePresence mode="wait">
            {!usePassword ? (
              <motion.div
                key="pin"
                initial={{ opacity: 0, height: 'auto' }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <PinInput
                  pin={pin}
                  onPinChange={setPin}
                  onSubmit={handlePinSubmit}
                  error={error}
                  success={success}
                />
              </motion.div>
            ) : (
              <motion.form
                key="password"
                initial={{ opacity: 0, height: 'auto' }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2, delay: 0.1 }}
                onSubmit={handlePasswordSubmit}
                className="flex flex-col gap-4"
              >
                <div>
                  <label className="block text-xs text-[#94A3B8] mb-1.5">
                    Usuario
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Nombre de usuario"
                    className="input-standard w-full"
                    autoFocus
                  />
                </div>
                <div className="relative">
                  <label className="block text-xs text-[#94A3B8] mb-1.5">
                    Contrasena
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="********"
                    className="input-standard w-full pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-[2.1rem] text-[#94A3B8] hover:text-[#475569] transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Error Message */}
          <AnimatePresence>
            {error && errorMsg && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-xs text-accent-red text-center mt-3"
              >
                {errorMsg}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Toggle */}
          <div className="flex items-center gap-3 mt-5 mb-5">
            <button
              type="button"
              onClick={() => {
                setUsePassword(!usePassword);
                setError(false);
                setErrorMsg('');
              }}
              className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              style={{
                backgroundColor: usePassword ? '#22C55E' : '#CBD5E1',
              }}
            >
              <span
                className="inline-block h-[18px] w-[18px] transform rounded-full bg-white transition-transform shadow-sm"
                style={{
                  transform: usePassword ? 'translateX(18px)' : 'translateX(1px)',
                }}
              />
            </button>
            <span className="text-xs font-medium text-[#475569]">
              Ingresar con usuario y contrasena
            </span>
          </div>

          {/* Enter Button */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            onClick={usePassword ? handlePasswordSubmit : () => handlePinSubmit()}
            disabled={loading || success}
            className={`w-full h-12 rounded-md font-semibold text-sm tracking-[0.1em] transition-all duration-200 flex items-center justify-center gap-2 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm ${
              success
                ? 'bg-accent-green text-white'
                : 'gradient-accent text-white hover:brightness-110'
            } ${loading || success ? 'cursor-default' : 'cursor-pointer'}`}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : success ? (
              <>
                <Check size={20} />
                <span>EXITO</span>
              </>
            ) : (
              'ENTRAR'
            )}
          </motion.button>
        </div>

        {/* Bottom Link */}
        <motion.a
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          href="#"
          className="flex items-center justify-center gap-1.5 mt-4 text-xs text-[#94A3B8] hover:text-[#475569] hover:underline transition-colors"
        >
          Descarga Drivers de Printers
          <ExternalLink size={12} />
        </motion.a>
      </motion.div>
    </div>
  );
}
