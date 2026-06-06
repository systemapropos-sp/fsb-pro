import { useRef, useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  User, Calendar, Clock, Trash2, RefreshCw, Calculator, Check, AlertCircle,
  ChevronDown, UserCircle,
} from 'lucide-react';
import { formatAmount, formatDate, formatTime, getContacts } from '@/lib/storage';
import { findTeamByCode, findPlayCode, isValidPlayCode, PLAY_CODES } from '@/lib/playCodes';
import TicketReceipt from './TicketReceipt';
import type { Ticket, Contact } from '@/lib/storage';

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
  onAddPlayFromForm?: (teamCode: string, playCode: string) => void;
  createdTicket?: Ticket | null;
  onCustomerChange?: (id: string | null, name: string | null) => void;
  selectedCustomerId?: string | null;
  isCredit?: boolean;
  setIsCredit?: (v: boolean) => void;
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
  onAddPlayFromForm,
  createdTicket,
  onCustomerChange,
  selectedCustomerId,
  isCredit,
  setIsCredit,
}: SalesFormProps) {
  const equipoInputRef = useRef<HTMLInputElement>(null);
  const jugadaInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [internalEquipo, setInternalEquipo] = useState(equipo);
  const [internalJugada, setInternalJugada] = useState(jugada);
  const [internalCantidad, setInternalCantidad] = useState(cantidad);
  // Team lookup: shows found team name below input
  const [foundTeam, setFoundTeam] = useState<string | null>(null);
  const [teamError, setTeamError] = useState(false);
  // Play code lookup: shows description below input
  const [foundPlay, setFoundPlay] = useState<string | null>(null);
  const [playError, setPlayError] = useState(false);
  // Customer dropdown
  const [customers, setCustomers] = useState<Contact[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // Load customers
  useEffect(() => {
    setCustomers(getContacts().filter((c) => c.isActive !== false));
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);
  const creditAvailable = selectedCustomer ? selectedCustomer.creditLimit - selectedCustomer.creditUsed : 0;

  // Sync with parent when values come from external (like clicking a line)
  useEffect(() => { setInternalEquipo(equipo); }, [equipo]);
  useEffect(() => { setInternalJugada(jugada); }, [jugada]);

  // Keyboard: Enter to process/jump, Escape to clear
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClearAll();
        return;
      }
      if (e.key === 'Enter') {
        const active = document.activeElement;
        if (active === equipoInputRef.current && internalEquipo.length === 4) {
          jugadaInputRef.current?.focus();
        } else if (active === jugadaInputRef.current && foundPlay) {
          // Enter on jugada with valid play → focus cantidad
          const cantidadInput = document.querySelector('input[placeholder="50.00"]') as HTMLInputElement;
          cantidadInput?.focus();
        } else if (active?.getAttribute('placeholder') === '50.00' && selectedPlaysCount > 0 && parseFloat((active as HTMLInputElement).value) > 0) {
          onProcessTicket();
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [internalEquipo, foundPlay, selectedPlaysCount, onClearAll, onProcessTicket]);

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
        // AUTO-ADD: if we have a valid team + valid play, add to Jugadas Seleccionadas
        if (internalEquipo.length === 4 && foundTeam && onAddPlayFromForm) {
          onAddPlayFromForm(internalEquipo, val);
          // Clear inputs for next entry
          setInternalEquipo('');
          setEquipo('');
          setFoundTeam(null);
          setInternalJugada('');
          setJugada('');
          setFoundPlay(null);
          // Return focus to equipo for next entry
          setTimeout(() => equipoInputRef.current?.focus(), 100);
        }
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
          <User size={14} style={{ color: '#555555' }} className="shrink-0" />
          <span className="text-xs" style={{ color: '#555555', width: 60 }}>Vendedor:</span>
          <span className="text-sm font-bold font-mono" style={{ color: '#191919' }}>mmw03</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar size={14} style={{ color: '#555555' }} className="shrink-0" />
          <span className="text-xs" style={{ color: '#555555', width: 60 }}>Fecha:</span>
          <span className="text-xs" style={{ color: '#333333' }}>{formatDate(currentTime)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock size={14} style={{ color: '#555555' }} className="shrink-0" />
          <span className="text-xs" style={{ color: '#555555', width: 60 }}>Hora:</span>
          <span className="text-xs font-mono" style={{ color: '#333333' }}>{formatTime(currentTime)}</span>
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
              color: modeTab === key ? '#191919' : '#555555',
              border: modeTab === key ? '1px solid rgba(0,176,255,0.3)' : '1px solid transparent',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Customer Selector */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm border transition-all"
          style={{
            background: selectedCustomerId ? 'rgba(41,147,234,0.08)' : '#FFFFFF',
            borderColor: selectedCustomerId ? '#2993EA' : '#E0E0E0',
            color: selectedCustomerId ? '#2993EA' : '#555555',
          }}
        >
          <span className="flex items-center gap-2">
            <UserCircle size={16} />
            {selectedCustomer ? `${selectedCustomer.name} (Cred: $${creditAvailable.toFixed(0)})` : 'Seleccionar cliente...'}
          </span>
          <ChevronDown size={14} />
        </button>
        {showDropdown && (
          <div className="absolute z-20 w-full mt-1 rounded-lg border shadow-lg overflow-hidden" style={{ background: '#FFFFFF', borderColor: '#E0E0E0' }}>
            <button
              onClick={() => { onCustomerChange?.(null, null); setShowDropdown(false); }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors"
              style={{ color: '#555555' }}
            >
              Cash (sin cliente)
            </button>
            {customers.map((c) => {
              const avail = c.creditLimit - c.creditUsed;
              return (
                <button
                  key={c.id}
                  onClick={() => { onCustomerChange?.(c.id, c.name); setShowDropdown(false); }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors flex justify-between items-center"
                  style={{ color: '#191919' }}
                >
                  <span>{c.name}</span>
                  <span className="text-xs" style={{ color: avail < c.creditLimit * 0.2 ? '#E53935' : avail < c.creditLimit * 0.5 ? '#FF9800' : '#00C853' }}>
                    ${avail.toFixed(0)}/${c.creditLimit.toFixed(0)}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Cash / Credit Toggle */}
      {selectedCustomer && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCredit?.(false)}
            className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-all ${!isCredit ? 'bg-[#00C853] text-white' : 'bg-gray-100 text-gray-500'}`}
          >
            CASH
          </button>
          <button
            onClick={() => {
              if (creditAvailable <= 0) { alert('Cliente sin credito disponible'); return; }
              setIsCredit?.(true);
            }}
            className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-all ${isCredit ? 'bg-[#FF9808] text-white' : 'bg-gray-100 text-gray-500'}`}
          >
            CREDITO (${creditAvailable.toFixed(0)} disp.)
          </button>
        </div>
      )}

      {/* Compact Form Fields - 2 column grid */}
      <div className="space-y-2">
        {/* Row 1: Equipo + Jugada */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[11px] font-bold mb-1 tracking-wide" style={{ color: '#555555' }}>EQUIPO</label>
            <input
              ref={equipoInputRef}
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
              <span className="absolute left-2 top-1/2 -translate-y-1/2 font-mono text-sm" style={{ color: '#555555' }}>$</span>
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
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 font-mono text-xs" style={{ color: '#555555' }}>$</span>
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
          style={{ background: '#F7F7F7', color: '#333333' }}
        >
          {language === 'es' ? 'ES | EN' : 'EN | ES'}
        </button>
        {showConfirmClear ? (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs" style={{ color: '#555555' }}>Seguro?</span>
            <button onClick={onClearAll} className="px-3 py-1.5 rounded text-xs font-bold text-white min-h-[32px]" style={{ background: '#E53935' }}>Si</button>
            <button onClick={() => setShowConfirmClear(false)} className="px-3 py-1.5 rounded text-xs font-bold min-h-[32px]" style={{ background: '#F7F7F7', color: '#333333' }}>No</button>
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
          color: selectedPlaysCount > 0 && cantidadNum > 0 && !processingTicket ? '#FFFFFF' : '#555555',
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

      {/* Ticket Receipt — shows after ticket creation */}
      <AnimatePresence>
        {createdTicket && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="overflow-hidden"
          >
            <div className="mt-3 rounded-lg border-2 border-dashed overflow-hidden" style={{ borderColor: '#E0E0E0', background: '#FFFFFF' }}>
              <TicketReceipt ticket={createdTicket} copyLabel="*** COPIA ***" />
            </div>
            {/* Share actions */}
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => {
                  const el = document.querySelector('.ticket-receipt');
                  if (el) {
                    const text = el.textContent || '';
                    navigator.clipboard?.writeText(text).then(() => alert('Ticket copiado al portapapeles'));
                  }
                }}
                className="flex-1 py-2 rounded-md text-xs font-bold transition-colors"
                style={{ background: 'rgba(0,176,255,0.1)', color: '#0288D1', border: '1px solid rgba(0,176,255,0.2)' }}
              >
                Copiar Texto
              </button>
              <button
                onClick={() => {
                  const el = document.querySelector('.ticket-receipt');
                  if (el) {
                    const text = encodeURIComponent(el.textContent || '');
                    window.open(`https://wa.me/?text=${text}`, '_blank');
                  }
                }}
                className="flex-1 py-2 rounded-md text-xs font-bold transition-colors"
                style={{ background: 'rgba(37,211,102,0.1)', color: '#128C7E', border: '1px solid rgba(37,211,102,0.2)' }}
              >
                WhatsApp
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
