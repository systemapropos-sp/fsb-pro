import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Ticket } from '@/lib/storage';
import {
  getTickets,
  updateTicketStatus,
  formatAmount,
} from '@/lib/storage';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Calendar,
  RefreshCw,
  Download,
  Eye,
  Pencil,
  DollarSign,
  X,
  ChevronLeft,
  ChevronRight,
  TicketIcon,
  SearchX,
} from 'lucide-react';

// ── Status config ──────────────────────────────────────────
const STATUS_CONFIG = {
  pendiente: { label: 'Pendiente', className: 'badge-pendiente' },
  ganador:   { label: 'Ganador',   className: 'badge-ganador' },
  perdedor:  { label: 'Perdedor',  className: 'badge-perdedor' },
  cancelado: { label: 'Cancelado', className: 'badge-cancelado' },
  pagado:    { label: 'Pagado',    className: 'badge-pagado' },
} as const;

type StatusFilter = 'todos' | 'ganador' | 'perdedor' | 'pendiente' | 'cancelado';

const STATUS_FILTERS: { key: StatusFilter; label: string }[] = [
  { key: 'todos',     label: 'Todos' },
  { key: 'ganador',   label: 'Ganadores' },
  { key: 'perdedor',  label: 'Perdedores' },
  { key: 'pendiente', label: 'Pendientes' },
  { key: 'cancelado', label: 'Cancelados' },
];

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

// ── Seed mock data ─────────────────────────────────────────
function seedMockTickets(): Ticket[] {
  const statuses: Ticket['status'][] = ['pendiente', 'ganador', 'perdedor', 'cancelado', 'pagado'];
  const tickets: Ticket[] = [];
  const baseDate = new Date('2026-04-06T12:00:00');

  const sellers = ['mmw03', 'sportmmwmaster', 'admin01', 'vendedor02'];

  for (let i = 1; i <= 15; i++) {
    const status = statuses[i % statuses.length];
    const amount = [100, 200, 300, 500, 675, 800, 1000, 1500, 2000, 3000, 50, 75, 150, 400, 550][i - 1];
    const payoutMultiplier = [2.5, 2.0, 1.8, 3.0, 1.5, 2.2, 1.75, 2.8, 1.9, 2.05, 3.5, 2.4, 1.6, 2.1, 1.85][i - 1];

    tickets.push({
      id: `MMW-003-${(29340799 + i * 10001).toString().padStart(6, '0')}`,
      seller: sellers[i % sellers.length],
      date: new Date(baseDate.getTime() + i * 3600000 * (i % 5 + 1)).toISOString(),
      plays: [],
      amount,
      payout: +(amount * payoutMultiplier).toFixed(2),
      profit: +(amount * payoutMultiplier - amount).toFixed(2),
      status,
      createdAt: baseDate.getTime() + i * 3600000,
      paidAt: status === 'pagado' ? baseDate.getTime() + i * 3600000 + 7200000 : undefined,
    });
  }

  // Save to localStorage
  localStorage.setItem('fsb_tickets', JSON.stringify(tickets));
  return tickets;
}

function loadTickets(): Ticket[] {
  const stored = getTickets();
  if (stored.length === 0) {
    return seedMockTickets();
  }
  return stored;
}

// ── Status Badge ───────────────────────────────────────────
function StatusBadge({ status }: { status: Ticket['status'] }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.className}`}>
      {status === 'pagado' && <span className="w-1.5 h-1.5 rounded-full bg-accent-green" />}
      {cfg.label}
    </span>
  );
}

// ── Main Component ─────────────────────────────────────────
export default function Tickets() {
  const [allTickets, setAllTickets] = useState<Ticket[]>([]);
  const [activeFilter, setActiveFilter] = useState<StatusFilter>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [refreshSpin, setRefreshSpin] = useState(false);

  // Load data on mount
  useEffect(() => {
    setAllTickets(loadTickets());
  }, []);

  // Set default date to today
  useEffect(() => {
    const today = new Date();
    setDateFilter(today.toISOString().split('T')[0]);
  }, []);

  // Filter & search
  const filteredTickets = useMemo(() => {
    let result = allTickets;

    // Status filter
    if (activeFilter !== 'todos') {
      result = result.filter((t) => t.status === activeFilter);
    }

    // Search by ticket number
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter((t) => t.id.toLowerCase().includes(q));
    }

    // Date filter
    if (dateFilter) {
      const filterDate = new Date(dateFilter);
      result = result.filter((t) => {
        const ticketDate = new Date(t.date);
        return (
          ticketDate.getDate() === filterDate.getDate() &&
          ticketDate.getMonth() === filterDate.getMonth() &&
          ticketDate.getFullYear() === filterDate.getFullYear()
        );
      });
    }

    return result;
  }, [allTickets, activeFilter, searchQuery, dateFilter]);

  // Pagination
  const totalEntries = filteredTickets.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / pageSize));
  const startIdx = (currentPage - 1) * pageSize;
  const endIdx = Math.min(startIdx + pageSize, totalEntries);
  const paginatedTickets = filteredTickets.slice(startIdx, endIdx);

  // Status counts
  const statusCounts = useMemo(() => {
    const counts = {
      todos: allTickets.length,
      ganador: allTickets.filter((t) => t.status === 'ganador').length,
      perdedor: allTickets.filter((t) => t.status === 'perdedor').length,
      pendiente: allTickets.filter((t) => t.status === 'pendiente').length,
      cancelado: allTickets.filter((t) => t.status === 'cancelado').length,
    };
    return counts;
  }, [allTickets]);

  // Summary
  const summary = useMemo(() => {
    const montoTotal = filteredTickets.reduce((sum, t) => sum + t.amount, 0);
    const premioTotal = filteredTickets.reduce((sum, t) => sum + t.payout, 0);
    return { montoTotal, premioTotal };
  }, [filteredTickets]);

  // Handlers
  const handleRefresh = useCallback(() => {
    setRefreshSpin(true);
    setAllTickets(loadTickets());
    setTimeout(() => setRefreshSpin(false), 500);
  }, []);

  const handleCancelTicket = useCallback(
    (id: string) => {
      if (!confirm('Esta seguro de cancelar este ticket?')) return;
      const updated = updateTicketStatus(id, 'cancelado');
      if (updated) {
        setAllTickets((prev) => prev.map((t) => (t.id === id ? { ...t, status: 'cancelado' as const } : t)));
      }
    },
    []
  );

  const handlePayTicket = useCallback(
    (id: string) => {
      if (!confirm('Confirmar pago de este ticket?')) return;
      const updated = updateTicketStatus(id, 'pagado');
      if (updated) {
        setAllTickets((prev) => prev.map((t) => (t.id === id ? { ...t, status: 'pagado' as const, paidAt: Date.now() } : t)));
      }
    },
    []
  );

  const handlePageChange = useCallback(
    (page: number) => {
      if (page >= 1 && page <= totalPages) setCurrentPage(page);
    },
    [totalPages]
  );

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, searchQuery, dateFilter, pageSize]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
      className="p-6 space-y-5"
    >
      {/* ── Page Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-h2 font-semibold text-text-primary">Gestion de Tickets</h1>
        <p className="text-sm text-text-tertiary mt-1">Administre todos los tickets del sistema</p>
      </motion.div>

      {/* ── Toolbar ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25, delay: 0.1 }}
        className="flex flex-wrap items-center justify-between gap-3"
      >
        {/* Left: Date picker */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="input-standard pl-9 pr-3 py-2 text-sm cursor-pointer"
            />
          </div>
          <button className="gradient-accent text-white text-sm font-semibold px-5 py-2 rounded-md hover:brightness-110 transition-all active:scale-[0.98]">
            Buscar tickets
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold border border-border-default text-text-secondary hover:bg-white/5 transition-all">
            <Download size={15} />
            Imprimir pendientes de pago
          </button>
        </div>

        {/* Right: Search + actions */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar por numero de ticket..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-standard pl-9 pr-3 py-2 text-sm w-[280px]"
            />
          </div>
          <button
            onClick={handleRefresh}
            className={`p-2 rounded-md bg-white/[0.04] text-text-tertiary hover:text-text-secondary hover:bg-white/[0.08] transition-all ${
              refreshSpin ? 'animate-spin-once' : ''
            }`}
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </motion.div>

      {/* ── Status Filter Pills ── */}
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.15 }}
        className="flex items-center gap-2 flex-wrap"
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
                    ? 'bg-accent-red-dim/10 text-text-tertiary border-text-tertiary/30'
                    : 'bg-accent-blue/15 text-accent-blue border-accent-blue/30'
                  : 'bg-transparent text-text-muted border-border-default hover:text-text-secondary hover:border-text-tertiary/40'
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

      {/* ── Summary Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="gradient-panel border border-border-subtle rounded-lg p-4 flex items-center justify-between"
      >
        <div className="flex items-center gap-6">
          <div>
            <span className="text-sm text-text-tertiary mr-2">Monto total:</span>
            <span className="font-mono text-mono text-text-primary font-semibold">
              {formatAmount(summary.montoTotal)}
            </span>
          </div>
          <div className="w-px h-6 bg-border-default" />
          <div>
            <span className="text-sm text-text-tertiary mr-2">Total de premios:</span>
            <span className="font-mono text-mono text-accent-green font-semibold">
              {formatAmount(summary.premioTotal)}
            </span>
          </div>
        </div>
        <div className="text-xs text-text-muted">
          {filteredTickets.length} ticket{filteredTickets.length !== 1 ? 's' : ''} encontrado
          {filteredTickets.length !== 1 ? 's' : ''}
        </div>
      </motion.div>

      {/* ── Search Box ── */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-text-secondary">Search:</span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar por numero..."
          className="input-standard px-3 py-1.5 text-sm w-[220px]"
        />
      </div>

      {/* ── Data Table ── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.25 }}
        className="gradient-panel border border-border-subtle rounded-lg overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            {/* Table Header */}
            <thead className="sticky top-0 z-10">
              <tr className="bg-[rgba(17,24,39,0.95)] backdrop-blur-lg">
                <th className="px-3 py-3 text-center text-xs font-semibold text-text-secondary uppercase tracking-wider w-[5%]">
                  #
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Numero
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Fecha de creacion
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-3 py-3 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Monto
                </th>
                <th className="px-3 py-3 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Pago
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Cancelado por
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Fecha cancelado
                </th>
                <th className="px-3 py-3 text-center text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-3 py-3 text-center text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Pagado
                </th>
                <th className="px-3 py-3 text-center text-xs font-semibold text-text-secondary uppercase tracking-wider w-[140px]">
                  Acciones
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              <AnimatePresence mode="wait">
                {paginatedTickets.length > 0 ? (
                  paginatedTickets.map((ticket, index) => (
                    <motion.tr
                      key={ticket.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15, delay: index * 0.025 }}
                      className={`border-b border-border-subtle transition-colors hover:bg-[rgba(148,163,184,0.04)] ${
                        index % 2 === 1 ? 'bg-[rgba(148,163,184,0.02)]' : ''
                      }`}
                    >
                      <td className="px-3 py-2.5 text-center text-text-tertiary text-xs">
                        {startIdx + index + 1}
                      </td>
                      <td className="px-3 py-2.5 font-mono text-sm text-accent-blue cursor-pointer hover:underline">
                        {ticket.id}
                      </td>
                      <td className="px-3 py-2.5 text-text-secondary text-xs whitespace-nowrap">
                        {new Date(ticket.date).toLocaleDateString('es-DO', {
                          day: '2-digit',
                          month: '2-digit',
                          year: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="px-3 py-2.5 text-text-secondary text-xs">{ticket.seller}</td>
                      <td className="px-3 py-2.5 text-right font-mono text-mono text-text-primary">
                        {formatAmount(ticket.amount)}
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono text-mono text-accent-green">
                        {formatAmount(ticket.payout)}
                      </td>
                      <td className="px-3 py-2.5 text-text-muted text-xs">
                        {ticket.status === 'cancelado' ? 'Sistema' : '-'}
                      </td>
                      <td className="px-3 py-2.5 text-text-muted text-xs">
                        {ticket.status === 'cancelado'
                          ? new Date(ticket.createdAt + 3600000).toLocaleDateString('es-DO', {
                              day: '2-digit',
                              month: '2-digit',
                              year: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : '-'}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <StatusBadge status={ticket.status} />
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        {ticket.status === 'pagado' ? (
                          <span className="text-accent-green text-xs font-semibold">Si</span>
                        ) : (
                          <span className="text-text-muted text-xs">No</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            title="Ver ticket"
                            className="p-1.5 rounded-md bg-white/[0.04] text-accent-blue hover:bg-white/[0.1] transition-colors"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            title="Editar ticket"
                            className="p-1.5 rounded-md bg-white/[0.04] text-text-secondary hover:bg-white/[0.1] hover:text-text-primary transition-colors"
                          >
                            <Pencil size={14} />
                          </button>
                          {ticket.status === 'ganador' && (
                            <button
                              title="Pagar ticket"
                              onClick={() => handlePayTicket(ticket.id)}
                              className="p-1.5 rounded-md bg-accent-green/10 text-accent-green hover:bg-accent-green/20 transition-colors"
                            >
                              <DollarSign size={14} />
                            </button>
                          )}
                          {ticket.status === 'pendiente' && (
                            <button
                              title="Cancelar ticket"
                              onClick={() => handleCancelTicket(ticket.id)}
                              className="p-1.5 rounded-md bg-accent-red/10 text-accent-red hover:bg-accent-red/20 transition-colors"
                            >
                              <X size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={11} className="px-6 py-16 text-center">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center gap-3"
                      >
                        {searchQuery || dateFilter || activeFilter !== 'todos' ? (
                          <>
                            <SearchX size={48} className="text-text-muted/30" />
                            <p className="text-sm text-text-tertiary">No se encontraron tickets</p>
                            <button
                              onClick={() => {
                                setSearchQuery('');
                                setDateFilter('');
                                setActiveFilter('todos');
                              }}
                              className="mt-2 text-xs text-accent-blue hover:text-accent-blue-bright font-medium border border-accent-blue/30 px-4 py-2 rounded-md hover:bg-accent-blue/10 transition-all"
                            >
                              Limpiar filtros
                            </button>
                          </>
                        ) : (
                          <>
                            <TicketIcon size={64} className="text-text-muted/20" />
                            <p className="text-body-lg text-text-tertiary">No hay tickets</p>
                            <p className="text-sm text-text-muted">
                              Los tickets apareceran aqui cuando se procesen
                            </p>
                          </>
                        )}
                      </motion.div>
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
        {totalEntries > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border-subtle">
            <div className="text-xs text-text-tertiary">
              Showing {totalEntries > 0 ? startIdx + 1 : 0} to {endIdx} of {totalEntries} entries
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-1.5 rounded-md text-text-muted hover:text-text-secondary hover:bg-white/[0.05] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`min-w-[32px] h-8 flex items-center justify-center rounded-md text-xs font-medium transition-all ${
                    page === currentPage
                      ? 'bg-accent-blue/20 text-accent-blue'
                      : 'text-text-muted hover:text-text-secondary hover:bg-white/[0.05]'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-md text-text-muted hover:text-text-secondary hover:bg-white/[0.05] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-tertiary">Show</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="input-standard py-1 px-2 text-xs w-[60px]"
              >
                {PAGE_SIZE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <span className="text-xs text-text-tertiary">entries</span>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
