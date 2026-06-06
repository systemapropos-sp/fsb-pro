import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Ticket } from '@/lib/storage';
import { updateTicketStatus, formatAmount } from '@/lib/storage';
import { motion, AnimatePresence } from 'framer-motion';
import TicketReceipt from '@/components/TicketReceipt';
import {
  CreditCard,
  Pencil,
  X,
  CheckCircle,
  AlertTriangle,
  Clock,
  CheckCircle2,
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────
type StatusFilter = 'todos' | 'ganador' | 'perdedor' | 'pendiente' | 'cancelado';

const STATUS_FILTERS: { key: StatusFilter; label: string }[] = [
  { key: 'todos',     label: 'Todos' },
  { key: 'ganador',   label: 'Ganadores' },
  { key: 'perdedor',  label: 'Perdedores' },
  { key: 'pendiente', label: 'Pendientes' },
  { key: 'cancelado', label: 'Cancelados' },
];

// ── Seed 7 pending winner tickets ──────────────────────────
const PENDING_TICKETS: Ticket[] = [
  {
    id: 'MMW-003-029340799',
    seller: 'sportmmwmaster',
    date: '2026-04-06T17:24:00',
    plays: [],
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
    plays: [],
    amount: 675.00,
    payout: 1175.00,
    profit: 500.00,
    status: 'ganador',
    createdAt: new Date('2026-04-07T12:58:00').getTime(),
  },
  {
    id: 'MMW-003-029358140',
    seller: 'mmw03',
    date: '2026-04-07T19:06:00',
    plays: [],
    amount: 550.00,
    payout: 1050.00,
    profit: 500.00,
    status: 'ganador',
    createdAt: new Date('2026-04-07T19:06:00').getTime(),
  },
  {
    id: 'MMW-003-029360124',
    seller: 'mmw03',
    date: '2026-04-07T22:38:00',
    plays: [],
    amount: 550.00,
    payout: 1050.00,
    profit: 500.00,
    status: 'ganador',
    createdAt: new Date('2026-04-07T22:38:00').getTime(),
  },
  {
    id: 'MMW-003-029365743',
    seller: 'mmw03',
    date: '2026-04-08T14:50:00',
    plays: [],
    amount: 435.00,
    payout: 935.00,
    profit: 500.00,
    status: 'ganador',
    createdAt: new Date('2026-04-08T14:50:00').getTime(),
  },
  {
    id: 'MMW-003-029374254',
    seller: 'mmw03',
    date: '2026-04-09T12:52:00',
    plays: [],
    amount: 550.00,
    payout: 1028.00,
    profit: 478.00,
    status: 'ganador',
    createdAt: new Date('2026-04-09T12:52:00').getTime(),
  },
  {
    id: 'MMW-003-029379969',
    seller: 'mmw03',
    date: '2026-04-09T19:04:00',
    plays: [],
    amount: 300.00,
    payout: 2939.00,
    profit: 2639.00,
    status: 'ganador',
    createdAt: new Date('2026-04-09T19:04:00').getTime(),
  },
];

// ── Helpers ────────────────────────────────────────────────
function getDaysPending(dateStr: string): number {
  const ticketDate = new Date(dateStr);
  const now = new Date('2026-04-10T12:00:00'); // Reference date
  const diffMs = now.getTime() - ticketDate.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

function getDiasColor(days: number): string {
  if (days <= 1) return 'text-text-tertiary';
  if (days <= 3) return 'text-accent-amber';
  return 'text-accent-red';
}

// ── Main Component ─────────────────────────────────────────
export default function Pendientes() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [activeFilter, setActiveFilter] = useState<StatusFilter>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [payingId, setPayingId] = useState<string | null>(null);
  const [allPaid, setAllPaid] = useState(false);

  // Load pending winning tickets from localStorage
  const loadPending = useCallback(() => {
    const stored = localStorage.getItem('fsb_tickets');
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Ticket[];
        // Show tickets with status=ganador that haven't been paid yet
        const pendingWinners = parsed.filter((t: Ticket) => t.status === 'ganador' && !t.paidAt);
        setTickets(pendingWinners);
        setAllPaid(pendingWinners.length === 0);
      } catch {
        setTickets([]);
        setAllPaid(true);
      }
    } else {
      // Seed initial demo data
      localStorage.setItem('fsb_tickets', JSON.stringify(PENDING_TICKETS));
      setTickets(PENDING_TICKETS);
      setAllPaid(false);
    }
  }, []);

  useEffect(() => {
    loadPending();

    // Listen for changes (ticket created, paid, etc)
    window.addEventListener('fsb:ticketCreated', loadPending);
    window.addEventListener('focus', loadPending);

    return () => {
      window.removeEventListener('fsb:ticketCreated', loadPending);
      window.removeEventListener('focus', loadPending);
    };
  }, [loadPending]);

  // Filtered tickets
  const filteredTickets = useMemo(() => {
    let result = tickets;
    if (activeFilter !== 'todos') {
      result = result.filter((t) => t.status === activeFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter((t) => t.id.toLowerCase().includes(q));
    }
    return result;
  }, [tickets, activeFilter, searchQuery]);

  // Status counts (dynamic from actual tickets)
  const statusCounts = useMemo(
    () => ({
      todos: tickets.length,
      ganador: tickets.filter((t) => t.status === 'ganador').length,
      perdedor: tickets.filter((t) => t.status === 'perdedor').length,
      pendiente: tickets.filter((t) => t.status === 'pendiente').length,
      cancelado: tickets.filter((t) => t.status === 'cancelado').length,
    }),
    [tickets]
  );

  // Summary
  const summary = useMemo(() => {
    const montoTotal = tickets.reduce((s, t) => s + t.amount, 0);
    const premioTotal = tickets.reduce((s, t) => s + t.payout, 0);
    return { montoTotal, premioTotal };
  }, [tickets]);

  // Pay single ticket
  const handlePay = useCallback(
    (id: string, payout: number) => {
      if (!confirm(`Confirmar pago de ${formatAmount(payout)}?`)) return;
      setPayingId(id);
      setTimeout(() => {
        updateTicketStatus(id, 'pagado');
        setTickets((prev) => prev.filter((t) => t.id !== id));
        setPayingId(null);
        // If all paid
        setTimeout(() => {
          setTickets((prev) => {
            if (prev.length === 0) setAllPaid(true);
            return prev;
          });
        }, 50);
      }, 300);
    },
    []
  );

  // Pay all tickets
  const handlePayAll = useCallback(() => {
    if (
      !confirm(
        `Esta seguro de pagar todos los tickets pendientes? Total: ${formatAmount(summary.premioTotal)}`
      )
    )
      return;
    setAllPaid(true);
    tickets.forEach((t) => updateTicketStatus(t.id, 'pagado'));
    setTickets([]);
  }, [tickets, summary.premioTotal]);

  // Format date
  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString('es-DO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
      className="px-4 md:px-6 lg:px-8 py-5 space-y-5"
    >
      {/* ── Page Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-xl md:text-2xl lg:text-3xl font-semibold text-text-primary">Pendientes de Pago</h1>
        <p className="text-sm text-text-tertiary mt-1">Tickets ganadores que requieren pago</p>
      </motion.div>

      {/* ── Summary Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number], delay: 0.1 }}
        className={`gradient-panel border rounded-lg p-6 transition-colors duration-500 ${
          allPaid
            ? 'border-l-4 border-l-accent-green bg-accent-green/5'
            : 'border-l-4 border-l-accent-amber bg-accent-amber/5 border-border-subtle'
        }`}
      >
        {allPaid ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <CheckCircle size={48} className="text-accent-green" />
            </motion.div>
            <div>
              <h2 className="text-lg md:text-xl text-accent-green font-semibold">
                Todos los tickets estan pagados
              </h2>
              <p className="text-sm text-text-tertiary mt-1">No hay pagos pendientes</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3 md:space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <Clock size={20} className="text-accent-amber" />
              <span className="text-sm text-text-tertiary">Tickets Pendientes:</span>
              <motion.span
                key={tickets.length}
                initial={{ scale: 1.3 }}
                animate={{ scale: 1 }}
                className="text-xl md:text-2xl font-bold text-accent-amber"
              >
                {tickets.length}
              </motion.span>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <span className="text-body-lg text-text-tertiary">Monto Total Pendiente:</span>
              <motion.span
                key={summary.premioTotal}
                initial={{ scale: 1.05 }}
                animate={{ scale: 1 }}
                className="text-2xl md:text-3xl lg:text-4xl font-bold text-accent-amber font-mono"
              >
                {formatAmount(summary.premioTotal)}
              </motion.span>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-2 border-t border-border-subtle gap-1">
              <span className="text-sm text-text-tertiary">Monto apostado total:</span>
              <span className="font-mono text-mono text-text-primary font-semibold">
                {formatAmount(summary.montoTotal)}
              </span>
            </div>
          </div>
        )}
      </motion.div>

      {/* ── Status Filter Pills ── */}
      {!allPaid && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex items-center gap-2 overflow-x-auto flex-nowrap pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap md:overflow-visible"
        >
          {STATUS_FILTERS.map((filter) => {
            const isActive = activeFilter === filter.key;
            const count = statusCounts[filter.key];
            return (
              <button
                key={filter.key}
                onClick={() => setActiveFilter(filter.key)}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 border ${
                  isActive
                    ? filter.key === 'ganador'
                      ? 'bg-accent-green/15 text-accent-green border-accent-green/30'
                      : filter.key === 'perdedor'
                      ? 'bg-accent-red/15 text-accent-red border-accent-red/30'
                      : filter.key === 'pendiente'
                      ? 'bg-accent-amber/15 text-accent-amber border-accent-amber/30'
                      : filter.key === 'cancelado'
                      ? 'bg-text-tertiary/10 text-text-tertiary border-text-tertiary/30'
                      : 'bg-accent-blue/15 text-accent-blue border-accent-blue/30'
                    : 'bg-transparent text-text-muted border-border-default hover:text-text-secondary'
                }`}
              >
                {filter.label}
                <span
                  className={`min-w-[20px] h-5 flex items-center justify-center rounded-full text-[10px] font-bold ${
                    isActive
                      ? filter.key === 'ganador'
                        ? 'bg-accent-green/25 text-accent-green'
                        : filter.key === 'perdedor'
                        ? 'bg-accent-red/25 text-accent-red'
                        : filter.key === 'pendiente'
                        ? 'bg-accent-amber/25 text-accent-amber'
                        : filter.key === 'cancelado'
                        ? 'bg-text-tertiary/20 text-text-tertiary'
                        : 'bg-accent-blue/25 text-accent-blue'
                      : 'bg-white/5 text-text-muted'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </motion.div>
      )}

      {/* ── Search ── */}
      {!allPaid && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-text-secondary">Search:</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por numero de ticket..."
            className="input-standard px-3 h-12 md:h-10 text-sm w-full sm:w-[260px]"
          />
        </div>
      )}

      {/* ── Data Table ── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.2 }}
        className="gradient-panel border border-border-subtle rounded-lg overflow-hidden"
      >
        <div className="hidden sm:block overflow-x-auto">
          <table className="min-w-[640px] w-full text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="bg-[rgba(17,24,39,0.95)] backdrop-blur-lg">
                <th className="px-3 py-3 text-center text-xs font-semibold text-text-secondary uppercase tracking-wider w-[5%]">
                  #
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Ticket
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-3 py-3 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Monto
                </th>
                <th className="px-3 py-3 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Premio
                </th>
                <th className="px-3 py-3 text-center text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Dias
                </th>
                <th className="px-3 py-3 text-center text-xs font-semibold text-text-secondary uppercase tracking-wider w-[140px]">
                  Accion
                </th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {filteredTickets.length > 0 ? (
                  filteredTickets.map((ticket, index) => {
                    const daysPending = getDaysPending(ticket.date);
                    const diasClass = getDiasColor(daysPending);
                    return (
                      <motion.tr
                        key={ticket.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{
                          duration: 0.3,
                          delay: index * 0.04,
                        }}
                        className={`border-b border-border-subtle transition-colors hover:bg-[rgba(148,163,184,0.04)] ${
                          index % 2 === 1 ? 'bg-[rgba(148,163,184,0.02)]' : ''
                        }`}
                      >
                        <td className="px-3 py-2.5 text-center text-text-tertiary text-xs">
                          {index + 1}
                        </td>
                        <td className="px-3 py-2.5 font-mono text-sm text-accent-blue">
                          {ticket.id}
                        </td>
                        <td className="px-3 py-2.5 text-text-secondary text-xs whitespace-nowrap">
                          {fmtDate(ticket.date)}
                        </td>
                        <td className="px-3 py-2.5 text-text-secondary text-xs">{ticket.seller}</td>
                        <td className="px-3 py-2.5 text-right font-mono text-mono text-text-primary">
                          {formatAmount(ticket.amount)}
                        </td>
                        <td className="px-3 py-2.5 text-right font-mono text-mono font-semibold text-accent-green">
                          {formatAmount(ticket.payout)}
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <span className={`text-xs font-medium ${diasClass} inline-flex items-center gap-1`}>
                            {daysPending >= 4 && <AlertTriangle size={12} />}
                            {daysPending}d
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          {payingId === ticket.id && (
                            <div className="my-3 rounded-lg border border-dashed overflow-hidden" style={{ borderColor: 'rgba(255,193,7,0.3)', background: '#FFFFFF' }}>
                              <TicketReceipt ticket={ticket} copyLabel="*** COPIA ***" />
                            </div>
                          )}
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handlePay(ticket.id, ticket.payout)}
                              disabled={payingId === ticket.id}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md gradient-winner text-white text-xs font-bold hover:shadow-winner transition-all active:scale-[0.97] disabled:opacity-50"
                            >
                              <CreditCard size={14} />
                              {payingId === ticket.id ? '...' : 'PAGAR'}
                            </button>
                            <button
                              title="Editar"
                              className="p-1.5 rounded-md bg-white/[0.04] text-text-secondary hover:bg-white/[0.1] transition-colors"
                            >
                              <Pencil size={13} />
                            </button>
                            <button
                              title="Cancelar"
                              className="p-1.5 rounded-md bg-accent-red/10 text-accent-red hover:bg-accent-red/20 transition-colors"
                            >
                              <X size={13} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-16 text-center">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center gap-3"
                      >
                        <CheckCircle2 size={64} className="text-accent-green/30" />
                        <p className="text-body-lg text-text-tertiary">No hay pagos pendientes</p>
                        <p className="text-sm text-text-muted">
                          Todos los tickets ganadores han sido pagados
                        </p>
                      </motion.div>
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

          {/* Mobile Card View */}
          <div className="sm:hidden space-y-3 mt-3">
            <AnimatePresence>
              {filteredTickets.length > 0 ? (
                filteredTickets.map((ticket) => {
                  const daysPending = getDaysPending(ticket.date);
                  return (
                    <motion.div
                      key={ticket.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-white/[0.03] border border-border-subtle rounded-lg p-4 space-y-3"
                    >
                      {/* Ticket ID + Days */}
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-bold text-text-primary">{ticket.id}</p>
                          <p className="text-xs text-text-tertiary mt-0.5">{fmtDate(ticket.date)}</p>
                        </div>
                        <span className={`text-xs font-mono ${getDiasColor(daysPending)}`}>
                          {daysPending}d
                        </span>
                      </div>

                      {/* Amount + Payout */}
                      <div className="flex items-center justify-between py-2 border-y border-border-subtle/50">
                        <div>
                          <p className="text-xs text-text-tertiary">Apuesta</p>
                          <p className="text-sm font-mono font-semibold text-text-primary">{formatAmount(ticket.amount)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-text-tertiary">Premio</p>
                          <p className="text-lg font-mono font-bold text-accent-amber">{formatAmount(ticket.payout)}</p>
                        </div>
                      </div>

                      {/* Ticket Receipt */}
                      {payingId === ticket.id && (
                        <div className="my-3 rounded-lg border border-dashed overflow-hidden" style={{ borderColor: 'rgba(255,193,7,0.3)', background: '#FFFFFF' }}>
                          <TicketReceipt ticket={ticket} copyLabel="*** COPIA ***" />
                        </div>
                      )}

                      {/* Pay Button */}
                      <button
                        onClick={() => handlePay(ticket.id, ticket.payout)}
                        disabled={payingId === ticket.id}
                        className="w-full h-14 rounded-md bg-gradient-to-r from-accent-green to-accent-green-bright text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-accent-green/20 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50"
                      >
                        {payingId === ticket.id ? (
                          <span>Pagando...</span>
                        ) : (
                          <>
                            <CreditCard size={16} /> Pagar {formatAmount(ticket.payout)}
                          </>
                        )}
                      </button>
                    </motion.div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <CheckCircle2 size={32} className="mx-auto text-accent-green/40 mb-2" />
                  <p className="text-sm text-text-tertiary">No hay tickets pendientes</p>
                </div>
              )}
            </AnimatePresence>
          </div>
      </motion.div>

      {/* ── Pay All Button ── */}
      {!allPaid && tickets.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex justify-center pt-2 pb-4"
        >
          <button
            onClick={handlePayAll}
            className="flex items-center justify-center gap-2 w-full max-w-[400px] h-[52px] gradient-winner text-white text-sm font-bold tracking-wider rounded-md hover:shadow-winner hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <CreditCard size={18} />
            PAGAR TODOS LOS TICKETS
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}
