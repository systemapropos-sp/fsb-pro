import { useState, useEffect, useRef, useCallback } from 'react';
import type { Ticket } from '@/lib/storage';
import { getTicketById, updateTicketStatus, formatAmount } from '@/lib/storage';
import { motion, AnimatePresence } from 'framer-motion';
import TicketReceipt from '@/components/TicketReceipt';
import {
  Search,
  CreditCard,
  CheckCircle,
  Ticket as TicketIcon,
  AlertCircle,
  Info,
  X,
} from 'lucide-react';

// ── Confetti particle type ─────────────────────────────────
interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  angle: number;
  velocity: number;
  opacity: number;
}

// ── Recent payment entry ───────────────────────────────────
interface RecentPayment {
  ticketId: string;
  amount: number;
  payout: number;
  paidAt: number;
}

const INITIAL_RECENT: RecentPayment[] = [
  { ticketId: 'MMW-003-029300154', amount: 500.00, payout: 1200.00, paidAt: Date.now() - 3600000 },
  { ticketId: 'MMW-003-029295871', amount: 250.00, payout: 625.00, paidAt: Date.now() - 7200000 },
  { ticketId: 'MMW-003-029288432', amount: 1000.00, payout: 2500.00, paidAt: Date.now() - 10800000 },
  { ticketId: 'MMW-003-029280765', amount: 150.00, payout: 375.00, paidAt: Date.now() - 14400000 },
];

// ── Main Component ─────────────────────────────────────────
export default function Pagar() {
  const [codeInput, setCodeInput] = useState('');
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [searchState, setSearchState] = useState<'idle' | 'searching' | 'found' | 'notfound' | 'paid' | 'alreadyPaid'>('idle');
  const [errorShake, setErrorShake] = useState(false);
  const [recentPayments, setRecentPayments] = useState<RecentPayment[]>(INITIAL_RECENT);
  const [particles, setParticles] = useState<Particle[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Seed mock tickets into localStorage if empty
  useEffect(() => {
    const existing = localStorage.getItem('fsb_tickets');
    if (!existing || JSON.parse(existing).length === 0) {
      const seedTickets: Ticket[] = [
        {
          id: 'MMW-003-029340799',
          seller: 'sportmmwmaster',
          date: '2026-04-06T17:24:00',
          plays: [
            { id: 'p1', team: 'Lakers', teamCode: 'LAL', playType: 'Directa', detail: 'Lakers ML', line: 0, player: '', points: 0, odds: -150, isIF: false },
            { id: 'p2', team: 'Warriors', teamCode: 'GSW', playType: 'Directa', detail: 'Warriors +4.5', line: 4.5, player: '', points: 0, odds: -110, isIF: false },
          ],
          amount: 3000.00,
          payout: 6150.00,
          profit: 3150.00,
          status: 'ganador',
          createdAt: new Date('2026-04-06T17:24:00').getTime(),
        },
        {
          id: 'MMW-003-029349174',
          seller: 'mmw03',
          date: '2026-04-07T12:58:00',
          plays: [
            { id: 'p3', team: 'Celtics', teamCode: 'BOS', playType: 'Directa', detail: 'Celtics ML', line: 0, player: '', points: 0, odds: -120, isIF: false },
          ],
          amount: 675.00,
          payout: 1175.00,
          profit: 500.00,
          status: 'ganador',
          createdAt: new Date('2026-04-07T12:58:00').getTime(),
        },
      ];
      localStorage.setItem('fsb_tickets', JSON.stringify(seedTickets));
    }
  }, []);

  // Generate confetti particles
  const generateConfetti = useCallback(() => {
    const colors = ['#22C55E', '#3B82F6', '#06B6D4', '#F59E0B', '#8B5CF6', '#EF4444'];
    const newParticles: Particle[] = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: 50 + (Math.random() - 0.5) * 20,
      y: 50,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 4 + Math.random() * 6,
      angle: (Math.random() * 360),
      velocity: 5 + Math.random() * 15,
      opacity: 1,
    }));
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 1200);
  }, []);

  // Search for ticket
  const handleSearch = useCallback(() => {
    const rawCode = codeInput.trim();
    if (!rawCode) {
      setErrorShake(true);
      setTimeout(() => setErrorShake(false), 500);
      return;
    }

    setSearchState('searching');

    // Format: try both full ID and partial
    const fullCode = rawCode.startsWith('MMW') ? rawCode : `MMW-003-${rawCode}`;

    setTimeout(() => {
      const found = getTicketById(fullCode);
      if (!found) {
        setSearchState('notfound');
        setErrorShake(true);
        setTimeout(() => setErrorShake(false), 500);
        setTimeout(() => setSearchState('idle'), 2500);
        return;
      }

      if (found.status === 'pagado' || found.paidAt) {
        setTicket(found);
        setSearchState('alreadyPaid');
        return;
      }

      setTicket(found);
      setSearchState('found');
    }, 400);
  }, [codeInput]);

  // Handle enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  // Confirm payment
  const handleConfirmPayment = useCallback(() => {
    if (!ticket) return;
    setSearchState('searching');

    setTimeout(() => {
      const updated = updateTicketStatus(ticket.id, 'pagado');
      if (updated) {
        setSearchState('paid');
        generateConfetti();
        // Add to recent payments
        setRecentPayments((prev) => [
          {
            ticketId: ticket.id,
            amount: ticket.amount,
            payout: ticket.payout,
            paidAt: Date.now(),
          },
          ...prev.slice(0, 9),
        ]);
        // Reset after 3 seconds
        setTimeout(() => {
          setCodeInput('');
          setTicket(null);
          setSearchState('idle');
        }, 3500);
      }
    }, 500);
  }, [ticket, generateConfetti]);

  // Reset form
  const handleReset = () => {
    setCodeInput('');
    setTicket(null);
    setSearchState('idle');
  };

  // Format date
  const fmtDate = (ts: number) =>
    new Date(ts).toLocaleDateString('es-DO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const fmtTime = (ts: number) =>
    new Date(ts).toLocaleTimeString('es-DO', {
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
      className="px-4 md:px-6 lg:px-8 py-5 space-y-5 md:space-y-6 relative"
    >
      {/* ── Confetti Overlay ── */}
      <AnimatePresence>
        {particles.length > 0 && (
          <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden">
            {particles.map((p) => (
              <motion.div
                key={p.id}
                initial={{ x: `${p.x}vw`, y: `${p.y}vh`, opacity: 1, scale: 1, rotate: 0 }}
                animate={{
                  x: `${p.x + Math.cos((p.angle * Math.PI) / 180) * p.velocity * 3}vw`,
                  y: `${p.y + Math.sin((p.angle * Math.PI) / 180) * p.velocity * 3 + 40}vh`,
                  opacity: 0,
                  scale: 0.2,
                  rotate: 720,
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
                style={{
                  position: 'absolute',
                  width: p.size,
                  height: p.size,
                  backgroundColor: p.color,
                  borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* ── Page Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-xl md:text-2xl lg:text-3xl font-semibold text-text-primary">Pagar Ticket</h1>
        <p className="text-sm text-text-tertiary mt-1">
          Ingrese el codigo del ticket para procesar el pago
        </p>
      </motion.div>

      {/* ── Search Card ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number], delay: 0.1 }}
        className="max-w-[480px] mx-auto gradient-card border border-border-subtle rounded-xl p-5 md:p-8 shadow-modal w-full"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, delay: 0.2, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="flex justify-center mb-6"
        >
          <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-accent-green/10 flex items-center justify-center">
            <CreditCard size={32} className="text-accent-green" />
          </div>
        </motion.div>

        {/* Label */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="text-center text-xs text-text-tertiary font-medium uppercase tracking-wider mb-3"
        >
          Codigo de Ticket
        </motion.p>

        {/* Input */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className={`relative mb-5 ${errorShake ? 'animate-shake' : ''}`}
        >
          <div className="flex items-center bg-[#EDEDED] border-2 border-border-default rounded-lg overflow-hidden focus-within:border-accent-green focus-within:shadow-[0_0_0_4px_rgba(34,197,94,0.2)] transition-all h-14 md:h-12">
            <span className="pl-4 pr-1 font-mono text-lg md:text-xl text-text-tertiary select-none whitespace-nowrap">
              MMW-003-
            </span>
            <input
              ref={inputRef}
              type="text"
              value={codeInput}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                setCodeInput(val);
              }}
              onKeyDown={handleKeyDown}
              placeholder="______"
              maxLength={6}
              disabled={searchState === 'paid'}
              className="flex-1 bg-transparent py-3.5 pr-4 font-mono text-lg md:text-xl text-text-primary text-center placeholder:text-text-tertiary/50 outline-none border-none disabled:opacity-50"
            />
          </div>
        </motion.div>

        {/* Search Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {searchState === 'idle' || searchState === 'notfound' ? (
            <button
              onClick={handleSearch}
              className="w-full h-14 md:h-12 gradient-accent text-white text-sm font-bold tracking-wider rounded-md hover:shadow-accent active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Search size={16} />
              BUSCAR Y PAGAR
            </button>
          ) : searchState === 'searching' ? (
            <button
              disabled
              className="w-full h-14 md:h-12 gradient-accent text-white text-sm font-bold tracking-wider rounded-md opacity-70 flex items-center justify-center gap-2"
            >
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Buscando...
            </button>
          ) : searchState === 'found' || searchState === 'alreadyPaid' ? (
            <button
              onClick={handleReset}
              className="w-full h-14 md:h-12 bg-bg-tertiary text-text-secondary text-sm font-bold tracking-wider rounded-md hover:bg-bg-quaternary transition-all flex items-center justify-center gap-2"
            >
              <X size={16} />
              LIMPIAR
            </button>
          ) : null}
        </motion.div>

        {/* Error: Not Found */}
        <AnimatePresence>
          {searchState === 'notfound' && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4 p-3 rounded-md bg-accent-red/10 border border-accent-red/20 text-center text-sm"
            >
              <p className="text-sm text-accent-red flex items-center justify-center gap-2">
                <AlertCircle size={16} />
                Ticket no encontrado
              </p>
              <p className="text-xs text-text-muted mt-1">Verifique el codigo e intente de nuevo</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Already Paid */}
        <AnimatePresence>
          {searchState === 'alreadyPaid' && ticket && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4 p-3 rounded-md bg-accent-blue/10 border border-accent-blue/20 text-center text-sm"
            >
              <p className="text-sm text-accent-blue flex items-center justify-center gap-2">
                <Info size={16} />
                Este ticket ya fue pagado
              </p>
              <p className="text-xs text-text-muted mt-1">
                {ticket.paidAt ? `Pagado el ${fmtDate(ticket.paidAt)}` : 'Pagado anteriormente'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Ticket Details (when found) ── */}
        <AnimatePresence>
          {searchState === 'found' && ticket && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="mt-4 md:mt-6 space-y-3 md:space-y-4 overflow-hidden"
            >
              {/* Divider */}
              <div className="border-t border-border-subtle" />

              <TicketReceipt ticket={ticket} copyLabel="*** ORIGINAL ***" />

              {/* Share buttons */}
              <div className="flex gap-2 mt-3">
                <button onClick={() => { const el = document.querySelector('.ticket-receipt'); if (el) { navigator.clipboard?.writeText(el.textContent || '').then(() => alert('Ticket copiado')); } }} className="flex-1 py-2 rounded-md text-xs font-bold" style={{ background: 'rgba(0,176,255,0.1)', color: '#0288D1', border: '1px solid rgba(0,176,255,0.2)' }}>Copiar Texto</button>
                <button onClick={() => { const el = document.querySelector('.ticket-receipt'); if (el) { window.open(`https://wa.me/?text=${encodeURIComponent(el.textContent || '')}`, '_blank'); } }} className="flex-1 py-2 rounded-md text-xs font-bold" style={{ background: 'rgba(37,211,102,0.1)', color: '#128C7E', border: '1px solid rgba(37,211,102,0.2)' }}>WhatsApp</button>
              </div>

              {/* Plays list */}
              {ticket.plays.length > 0 && (
                <div>
                  <p className="text-xs text-text-tertiary uppercase tracking-wider mb-2">Jugadas</p>
                  <div className="space-y-2">
                    {ticket.plays.map((play) => (
                      <div
                        key={play.id}
                        className="bg-bg-primary/50 rounded-md p-3 border border-border-subtle"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-text-primary font-medium">{play.team}</span>
                          <span className="text-xs text-accent-blue">{play.playType}</span>
                        </div>
                        <p className="text-xs text-text-secondary mt-1">{play.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Confirm Payment Button */}
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                onClick={handleConfirmPayment}
                className="w-full h-14 gradient-winner text-white text-sm font-bold tracking-wider rounded-md hover:shadow-winner hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <CreditCard size={18} />
                CONFIRMAR PAGO DE {formatAmount(ticket.payout)}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Paid Success State ── */}
        <AnimatePresence>
          {searchState === 'paid' && ticket && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="mt-6 overflow-hidden"
            >
              <div className="border-t border-border-subtle mb-4" />
              <div className="bg-accent-green/5 border-2 border-accent-green/30 rounded-xl p-6 text-center relative overflow-hidden">
                {/* Paid stamp overlay effect */}
                <div className="absolute top-2 right-2 opacity-10 pointer-events-none">
                  <span className="text-6xl font-black text-accent-green rotate-[-15deg] block tracking-tighter">
                    PAGADO
                  </span>
                </div>

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  className="w-16 h-16 rounded-full bg-accent-green/20 flex items-center justify-center mx-auto mb-3"
                >
                  <CheckCircle size={36} className="text-accent-green" />
                </motion.div>

                <h3 className="text-h3 text-accent-green font-bold mb-1">Pago Exitoso</h3>
                <p className="font-mono text-mono text-accent-green font-semibold">
                  {formatAmount(ticket.payout)}
                </p>
                <p className="text-xs text-text-tertiary mt-2">
                  Ticket {ticket.id}
                </p>
                <p className="text-xs text-text-muted mt-1">
                  Redirigiendo en un momento...
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Recent Payments Table ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="gradient-panel border border-border-subtle rounded-lg overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-border-subtle">
          <h3 className="text-h3 text-text-primary font-semibold">Ultimos Tickets Pagados</h3>
          <p className="text-xs text-text-tertiary mt-0.5">Hoy</p>
        </div>

        <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
          <table className="min-w-[640px] md:min-w-0 w-full text-sm">
            <thead>
              <tr className="bg-[#EDEDED]">
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Ticket
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Hora
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Monto
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Premio
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {recentPayments.map((rp, index) => (
                  <motion.tr
                    key={`${rp.ticketId}-${rp.paidAt}`}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25, delay: index * 0.03 }}
                    className={`border-b border-border-subtle hover:bg-[rgba(148,163,184,0.04)] ${
                      index % 2 === 1 ? 'bg-[rgba(148,163,184,0.02)]' : ''
                    }`}
                  >
                    <td className="px-4 py-2.5 font-mono text-sm text-accent-blue">
                      {rp.ticketId}
                    </td>
                    <td className="px-4 py-2.5 text-text-secondary text-xs">
                      {fmtTime(rp.paidAt)}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-mono text-text-primary">
                      {formatAmount(rp.amount)}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-mono font-semibold text-accent-green">
                      {formatAmount(rp.payout)}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold badge-pagado">
                        Pagado
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>

              {recentPayments.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <TicketIcon size={48} className="text-text-muted/20" />
                      <p className="text-sm text-text-tertiary">No hay pagos recientes</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
