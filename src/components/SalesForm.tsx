import { useRef, useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  User, Calendar, Clock, Trash2, RefreshCw, Calculator, Check, AlertCircle,
} from 'lucide-react';
import { formatAmount, formatDate, formatTime } from '@/lib/storage';
import { findTeamByCode, findPlayCode, isValidPlayCode, PLAY_CODES } from '@/lib/playCodes';

interface SalesFormProps {
  currentTime: Date;
  modeTab: 'teaser' | 'teaserIF';
  setModeTab: (v: 'teaser' | 'teaserIF') => void;
  equipo: string;
  setEquipo: (v: string) => void;
  jugada: string;
  setJugada: (v: string) => void;
  cantidad: string;
  setCantidad: (v: string) => void;
  language: 'es' | 'en';
  setLanguage: (v: 'es' | 'en') => void;
  selectedPlaysCount: number;
  pago: number;
  ganancia: number;
  processingTicket: boolean;
  successTicket: string | null;
  showConfirmClear: boolean;
  setShowConfirmClear: (v: boolean) => void;
  onProcessTicket: () => void;
  onClearAll: () => void;
  onCalc: () => void;
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export default function SalesForm({
  currentTime,
  modeTab,
  setModeTab,
  equipo,
  setEquipo,
  jugada,
  setJugada,
  cantidad,
  setCantidad,
  language,
  setLanguage,
  selectedPlaysCount,
  pago,
  ganancia,
  processingTicket,
  successTicket,
  showConfirmClear,
  setShowConfirmClear,
  onProcessTicket,
  onClearAll,
  onCalc,
}: SalesFormProps) {
  const jugadaInputRef = useRef<HTMLInputElement>(null);
  const [internalEquipo, setInternalEquipo] = useState(equipo);
  const [internalJugada, setInternalJugada] = useState(jugada);
  const [internalCantidad, setInternalCantidad] = useState(cantidad);
  // Team lookup: shows found team name below input
  const [foundTeam, setFoundTeam] = useState<string | null>(null);
  const [teamError, setTeamError] = useState(false);
  // Play code lookup: shows description below input
  const [foundPlay, setFoundPlay] = useState<string | null>(null);
  const [playError, setPlayError] = useState(false);

  // Sync with parent when values come from external (like clicking a line)
  useEffect(() => { setInternalEquipo(equipo); }, [equipo]);
  useEffect(() => { setInternalJugada(jugada); }, [jugada]);

  const handleEquipoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only digits, max 4 characters
    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
    setInternalEquipo(val);
    setEquipo(val);
    setTeamError(false);

    // If 4 digits entered, look up team
    if (val.length === 4) {
      const teamName = findTeamByCode(val);
      if (teamName) {
        setFoundTeam(teamName);
        setTeamError(false);
        // Auto-focus jugada after short delay
        setTimeout(() => jugadaInputRef.current?.focus(), 150);
      } else {
        setFoundTeam(null);
        setTeamError(true);
      }
    } else {
      setFoundTeam(null);
    }
  };

  const handleJugadaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase();
    setInternalJugada(val);
    setJugada(val);
    setPlayError(false);

    // Look up play code
    if (val.length >= 1) {
      const play = findPlayCode(val);
      if (play) {
        setFoundPlay(play.description);
        setPlayError(false);
      } else if (val.length >= 2 && !isValidPlayCode(val)) {
        // Check if any code starts with this prefix
        const hasPrefix = PLAY_CODES.some(p => p.code.toUpperCase().startsWith(val));
        if (!hasPrefix) {
          setFoundPlay(null);
          setPlayError(true);
        }
      }
    } else {
      setFoundPlay(null);
    }
  };

  const handleCantidadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9.]/g, '');
    setInternalCantidad(val);
    setCantidad(val);
  };

  const cantidadNum = parseFloat(internalCantidad) || 0;

  return (
    <div className="flex flex-col gap-2 p-2 md:p-3">
      {/* Seller Info */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <User size={14} style={{ color: '#ABABAB' }} className="shrink-0" />
          <span className="text-xs" style={{ color: '#ABABAB', width: 60 }}>Vendedor:</span>
          <span className="text-sm font-bold font-mono" style={{ color: '#191919' }}>mmw03</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar size={14} style={{ color: '#ABABAB' }} className="shrink-0" />
          <span className="text-xs" style={{ color: '#ABABAB', width: 60 }}>Fecha:</span>
          <span className="text-xs" style={{ color: '#767676' }}>{formatDate(currentTime)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock size={14} style={{ color: '#ABABAB' }} className="shrink-0" />
          <span className="text-xs" style={{ color: '#ABABAB', width: 60 }}>Hora:</span>
          <span className="text-xs font-mono" style={{ color: '#767676' }}>{formatTime(currentTime)}</span>
        </div>
      </div>

      <div className="border-t" style={{ borderColor: '#E0E0E0' }} />

      {/* Mode Tabs */}
      <div className="flex gap-1 p-1 rounded-md" style={{ background: '#F7F7F7' }}>
        {[
          { key: 'teaser' as const, label: 'Teaser' },
          { key: 'teaserIF' as const, label: 'Teaser IF' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setModeTab(key)}
            className="flex-1 py-2 px-4 rounded-sm text-sm font-bold transition-all duration-200 min-h-[36px]"
            style={{
              background: modeTab === key ? 'rgba(0,176,255,0.1)' : 'transparent',
              color: modeTab === key ? '#191919' : '#ABABAB',
              border: modeTab === key ? '1px solid rgba(0,176,255,0.3)' : '1px solid transparent',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Compact Form Fields - 2 column grid */}
      <div className="space-y-2">
        {/* Row 1: Equipo + Jugada */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[11px] font-bold mb-1 tracking-wide" style={{ color: '#555555' }}>EQUIPO</label>
            <input
              type="text"
              inputMode="numeric"
              value={internalEquipo}
              onChange={handleEquipoChange}
              placeholder="2001"
              className="input-standard w-full h-9 text-sm font-bold font-mono"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 700,
                borderColor: foundTeam ? '#00C853' : teamError ? '#E53935' : '#E0E0E0',
                background: foundTeam ? 'rgba(0,200,83,0.06)' : teamError ? 'rgba(229,57,53,0.06)' : '#F8FAFC',
              }}
              autoComplete="off"
              spellCheck={false}
              maxLength={4}
            />
            {/* Team found indicator */}
            <div className="h-4 mt-0.5">
              {foundTeam && (
                <div className="flex items-center gap-1 text-[10px] font-bold" style={{ color: '#00C853' }}>
                  <Check size={10} /> {foundTeam}
                </div>
              )}
              {teamError && internalEquipo.length === 4 && (
                <div className="flex items-center gap-1 text-[10px] font-bold" style={{ color: '#E53935' }}>
                  <AlertCircle size={10} /> No existe
                </div>
              )}
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-bold mb-1 tracking-wide" style={{ color: '#555555' }}>JUGADA</label>
            <input
              type="text"
              ref={jugadaInputRef}
              value={internalJugada}
              onChange={handleJugadaChange}
              placeholder="M"
              className="input-standard w-full h-9 text-sm font-semibold uppercase"
              style={{
                borderColor: foundPlay ? '#00C853' : playError ? '#E53935' : '#E0E0E0',
                background: foundPlay ? 'rgba(0,200,83,0.06)' : playError ? 'rgba(229,57,53,0.06)' : '#F8FAFC',
              }}
              autoComplete="off"
              spellCheck={false}
            />
            {/* Play description indicator */}
            <div className="h-4 mt-0.5">
              {foundPlay && (
                <div className="text-[10px] font-bold truncate" style={{ color: '#00C853' }}>
                  {foundPlay}
                </div>
              )}
              {playError && internalJugada.length >= 2 && (
                <div className="text-[10px] font-bold" style={{ color: '#E53935' }}>
                  Invalido
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Row 2: #Jug.Reg + Cantidad */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[11px] font-bold mb-1 tracking-wide" style={{ color: '#555555' }}>#JUG.REG</label>
            <input
              type="text"
              readOnly
              value={selectedPlaysCount.toString()}
              className="w-full h-9 rounded-md border px-2.5 text-sm font-bold font-mono"
              style={{ borderColor: '#E0E0E0', background: 'rgba(0,176,255,0.05)', color: '#191919' }}
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold mb-1 tracking-wide" style={{ color: '#555555' }}>CANTIDAD</label>
            <div className="relative">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 font-mono text-sm" style={{ color: '#ABABAB' }}>$</span>
              <input
                type="text"
                inputMode="decimal"
                value={internalCantidad}
                onChange={handleCantidadChange}
                placeholder="0.00"
                className="input-standard w-full h-9 pl-6 pr-2 text-right font-mono text-sm font-bold"
                autoComplete="off"
              />
            </div>
          </div>
        </div>

        {/* Row 3: Pago + Ganancia */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[11px] font-bold mb-1 tracking-wide" style={{ color: '#555555' }}>PAGO</label>
            <div className="w-full h-9 rounded-md border px-2.5 text-right font-mono text-sm flex items-center justify-end" style={{ borderColor: '#E0E0E0', background: '#F7F7F7', color: '#00C853' }}>
              {formatAmount(pago)}
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-bold mb-1 tracking-wide" style={{ color: '#555555' }}>GANANCIA</label>
            <div className="w-full h-9 rounded-md border px-2.5 text-right font-mono text-sm flex items-center justify-end" style={{ borderColor: '#E0E0E0', background: '#F7F7F7', color: '#00C853' }}>
              {formatAmount(ganancia)}
            </div>
          </div>
        </div>

        {/* IF Fields */}
        <AnimatePresence>
          {modeTab === 'teaserIF' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2 border-t pt-2"
              style={{ borderColor: 'rgba(139,92,246,0.3)' }}
            >
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-bold mb-1" style={{ color: '#8B5CF6' }}>MONTO IF</label>
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 font-mono text-xs" style={{ color: '#ABABAB' }}>$</span>
                    <input type="text" inputMode="decimal" placeholder="0" className="input-standard w-full h-8 pl-5 pr-1 text-right font-mono text-xs" />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold mb-1" style={{ color: '#8B5CF6' }}>PAGO IF</label>
                  <div className="w-full h-8 rounded-md border px-1 text-right font-mono text-xs flex items-center justify-end" style={{ borderColor: 'rgba(139,92,246,0.3)', background: 'rgba(139,92,246,0.05)', color: '#8B5CF6' }}>$0</div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold mb-1" style={{ color: '#8B5CF6' }}>GAN. IF</label>
                  <div className="w-full h-8 rounded-md border px-1 text-right font-mono text-xs flex items-center justify-end" style={{ borderColor: 'rgba(139,92,246,0.3)', background: 'rgba(139,92,246,0.05)', color: '#8B5CF6' }}>$0</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 pt-2">
        <button
          onClick={onCalc}
          className="flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-bold border transition-colors min-h-[36px]"
          style={{ background: 'rgba(0,176,255,0.08)', color: '#0288D1', borderColor: 'rgba(0,176,255,0.25)' }}
        >
          <Calculator size={14} />
          Calc
        </button>
        <button
          onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
          className="px-3 py-2 rounded-md text-xs font-bold transition-colors min-h-[36px]"
          style={{ background: '#F7F7F7', color: '#767676' }}
        >
          {language === 'es' ? 'ES | EN' : 'EN | ES'}
        </button>
        {showConfirmClear ? (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs" style={{ color: '#ABABAB' }}>Seguro?</span>
            <button onClick={onClearAll} className="px-3 py-1.5 rounded text-xs font-bold text-white min-h-[32px]" style={{ background: '#E53935' }}>Si</button>
            <button onClick={() => setShowConfirmClear(false)} className="px-3 py-1.5 rounded text-xs font-bold min-h-[32px]" style={{ background: '#F7F7F7', color: '#767676' }}>No</button>
          </div>
        ) : (
          <button
            onClick={() => selectedPlaysCount > 0 && setShowConfirmClear(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-bold transition-colors min-h-[36px]"
            style={{ color: '#E53935' }}
          >
            <Trash2 size={14} />
            Eliminar
          </button>
        )}
      </div>

      {/* Process Ticket Button */}
      <button
        onClick={onProcessTicket}
        disabled={selectedPlaysCount === 0 || cantidadNum <= 0 || processingTicket}
        className="w-full mt-1 py-3 rounded-lg text-sm font-bold transition-all duration-200 min-h-[52px]"
        style={{
          background: selectedPlaysCount > 0 && cantidadNum > 0 && !processingTicket
            ? 'linear-gradient(135deg, #22C55E, #16A34A)'
            : 'rgba(0,0,0,0.08)',
          color: selectedPlaysCount > 0 && cantidadNum > 0 && !processingTicket ? '#FFFFFF' : '#ABABAB',
          boxShadow: selectedPlaysCount > 0 && cantidadNum > 0 && !processingTicket
            ? '0 4px 16px rgba(34,197,94,0.3)'
            : 'none',
          cursor: selectedPlaysCount > 0 && cantidadNum > 0 && !processingTicket ? 'pointer' : 'not-allowed',
        }}
      >
        {processingTicket ? (
          <span className="flex items-center justify-center gap-2">
            <RefreshCw size={16} className="animate-spin" />
            Procesando...
          </span>
        ) : successTicket ? (
          <span className="flex items-center justify-center gap-2">
            <CheckIcon />
            Ticket #{successTicket}
          </span>
        ) : (
          'PROCESAR TICKET'
        )}
      </button>
    </div>
  );
}
