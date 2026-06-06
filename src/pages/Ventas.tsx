import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Eye,
  Ticket as TicketIcon,
  Printer,
  BarChart3,
  TrendingUp,
  ArrowRight,
  Receipt,
  ChevronRight,
  Search,
  X,
} from 'lucide-react';
import {
  getTransactions,
  formatAmount,
  formatDate,
} from '@/lib/storage';
import type { Transaction, Ticket as TicketType } from '@/lib/storage';
import TicketReceipt from '@/components/TicketReceipt';

const containerAnim = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemAnim = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
};

/* ---------- date helpers ---------- */
const today = new Date();
const todayStr = formatDate(today);

function parseFormattedDate(dateStr: string): Date {
  const [day, month, year] = dateStr.split('/').map(Number);
  return new Date(year, month - 1, day);
}

function getDateDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return formatDate(d);
}

const yesterdayStr = getDateDaysAgo(1);
const threeDaysAgoStr = getDateDaysAgo(3);
const fiveDaysAgoStr = getDateDaysAgo(5);
const sixDaysAgoStr = getDateDaysAgo(6);
const sevenDaysAgoStr = getDateDaysAgo(7);
const tenDaysAgoStr = getDateDaysAgo(10);
const twelveDaysAgoStr = getDateDaysAgo(12);
const fifteenDaysAgoStr = getDateDaysAgo(15);
const twentyDaysAgoStr = getDateDaysAgo(20);
const twentyFiveDaysAgoStr = getDateDaysAgo(25);

/* ---------- richer mock data ---------- */
const MOCK_WINNERS: TicketType[] = [
  { id: 'MMW-003-482931', seller: 'mmw03', date: todayStr, plays: [], amount: 500, payout: 950, profit: 450, status: 'ganador', createdAt: Date.now() - 86400000 },
  { id: 'MMW-003-482945', seller: 'mmw03', date: todayStr, plays: [], amount: 1200, payout: 2280, profit: 1080, status: 'ganador', createdAt: Date.now() - 72000000 },
  { id: 'MMW-003-482967', seller: 'mmw03', date: todayStr, plays: [], amount: 300, payout: 570, profit: 270, status: 'pagado', createdAt: Date.now() - 36000000, paidAt: Date.now() - 18000000 },
  { id: 'MMW-003-482978', seller: 'sportmmwmaster', date: yesterdayStr, plays: [], amount: 800, payout: 1520, profit: 720, status: 'ganador', createdAt: Date.now() - 172800000 },
  { id: 'MMW-003-482989', seller: 'admin01', date: threeDaysAgoStr, plays: [], amount: 2000, payout: 3800, profit: 1800, status: 'pagado', createdAt: Date.now() - 259200000, paidAt: Date.now() - 250000000 },
];

const MOCK_TX: Transaction[] = [
  // Today
  { id: 'tx-1', ticketId: 'MMW-003-482931', type: 'venta', amount: 500, date: todayStr, seller: 'mmw03', description: 'Venta de ticket', createdAt: Date.now() - 90000000 },
  { id: 'tx-2', ticketId: 'MMW-003-482945', type: 'venta', amount: 1200, date: todayStr, seller: 'mmw03', description: 'Venta de ticket', createdAt: Date.now() - 85000000 },
  { id: 'tx-3', ticketId: '-', type: 'pago', amount: -950, date: todayStr, seller: 'mmw03', description: 'Pago a ganador', createdAt: Date.now() - 80000000 },
  { id: 'tx-4', ticketId: 'MMW-003-483001', type: 'venta', amount: 2500, date: todayStr, seller: 'mmw03', description: 'Venta de ticket', createdAt: Date.now() - 70000000 },
  { id: 'tx-5', ticketId: '-', type: 'pago', amount: -1800, date: todayStr, seller: 'mmw03', description: 'Cobro a cliente', createdAt: Date.now() - 65000000 },
  { id: 'tx-6', ticketId: '-', type: 'cancelacion', amount: -500, date: todayStr, seller: 'mmw03', description: 'Cancelacion de ticket', createdAt: Date.now() - 50000000 },
  { id: 'tx-7', ticketId: 'MMW-003-483025', type: 'venta', amount: 800, date: todayStr, seller: 'mmw03', description: 'Resultados de ventas', createdAt: Date.now() - 40000000 },
  { id: 'tx-8', ticketId: '-', type: 'pago', amount: -3200, date: todayStr, seller: 'mmw03', description: 'Recarga de cliente', createdAt: Date.now() - 30000000 },
  { id: 'tx-9', ticketId: 'MMW-003-483048', type: 'venta', amount: 1500, date: todayStr, seller: 'mmw03', description: 'Venta de ticket', createdAt: Date.now() - 20000000 },
  { id: 'tx-10', ticketId: 'MMW-003-483052', type: 'venta', amount: 2000, date: todayStr, seller: 'mmw03', description: 'Venta de ticket', createdAt: Date.now() - 10000000 },
  // Yesterday
  { id: 'tx-11', ticketId: 'MMW-003-483101', type: 'venta', amount: 3500, date: yesterdayStr, seller: 'sportmmwmaster', description: 'Venta de ticket', createdAt: Date.now() - 100000000 },
  { id: 'tx-12', ticketId: '-', type: 'pago', amount: -2100, date: yesterdayStr, seller: 'sportmmwmaster', description: 'Pago premio', createdAt: Date.now() - 99000000 },
  { id: 'tx-13', ticketId: 'MMW-003-483115', type: 'venta', amount: 900, date: yesterdayStr, seller: 'admin01', description: 'Apuesta directa', createdAt: Date.now() - 98000000 },
  { id: 'tx-14', ticketId: 'MMW-003-483128', type: 'venta', amount: 4500, date: yesterdayStr, seller: 'mmw03', description: 'Parlay combinado', createdAt: Date.now() - 97000000 },
  { id: 'tx-15', ticketId: '-', type: 'cancelacion', amount: -750, date: yesterdayStr, seller: 'mmw03', description: 'Cancelacion por error', createdAt: Date.now() - 96000000 },
  // 3 days ago
  { id: 'tx-16', ticketId: 'MMW-003-483201', type: 'venta', amount: 1800, date: threeDaysAgoStr, seller: 'vendedor02', description: 'Venta de ticket', createdAt: Date.now() - 200000000 },
  { id: 'tx-17', ticketId: '-', type: 'pago', amount: -3400, date: threeDaysAgoStr, seller: 'vendedor02', description: 'Pago multiple', createdAt: Date.now() - 199000000 },
  { id: 'tx-18', ticketId: 'MMW-003-483215', type: 'venta', amount: 600, date: threeDaysAgoStr, seller: 'mmw03', description: 'Apuesta MLB', createdAt: Date.now() - 198000000 },
  // 5 days ago
  { id: 'tx-19', ticketId: 'MMW-003-483301', type: 'venta', amount: 4200, date: fiveDaysAgoStr, seller: 'sportmmwmaster', description: 'Venta NBA finales', createdAt: Date.now() - 300000000 },
  { id: 'tx-20', ticketId: '-', type: 'pago', amount: -1500, date: fiveDaysAgoStr, seller: 'sportmmwmaster', description: 'Cobro semanal', createdAt: Date.now() - 299000000 },
  { id: 'tx-21', ticketId: '-', type: 'cancelacion', amount: -300, date: fiveDaysAgoStr, seller: 'admin01', description: 'Cancelacion duplicado', createdAt: Date.now() - 298000000 },
  { id: 'tx-22', ticketId: 'MMW-003-483318', type: 'venta', amount: 1100, date: fiveDaysAgoStr, seller: 'mmw03', description: 'Apuesta NFL', createdAt: Date.now() - 297000000 },
  // 6 days ago
  { id: 'tx-23', ticketId: 'MMW-003-483401', type: 'venta', amount: 5500, date: sixDaysAgoStr, seller: 'mmw03', description: 'Parlay grande', createdAt: Date.now() - 350000000 },
  { id: 'tx-24', ticketId: '-', type: 'pago', amount: -4200, date: sixDaysAgoStr, seller: 'mmw03', description: 'Pago parlay ganador', createdAt: Date.now() - 349000000 },
  // 7 days ago
  { id: 'tx-25', ticketId: 'MMW-003-483502', type: 'venta', amount: 750, date: sevenDaysAgoStr, seller: 'vendedor02', description: 'Apuesta rapida', createdAt: Date.now() - 400000000 },
  // 10 days ago
  { id: 'tx-26', ticketId: 'MMW-003-483601', type: 'venta', amount: 3200, date: tenDaysAgoStr, seller: 'mmw03', description: 'Venta de ticket', createdAt: Date.now() - 500000000 },
  { id: 'tx-27', ticketId: '-', type: 'pago', amount: -2800, date: tenDaysAgoStr, seller: 'mmw03', description: 'Liquidacion diaria', createdAt: Date.now() - 499000000 },
  // 12 days ago
  { id: 'tx-28', ticketId: 'MMW-003-483701', type: 'venta', amount: 4800, date: twelveDaysAgoStr, seller: 'sportmmwmaster', description: 'Parlay combinado NBA', createdAt: Date.now() - 600000000 },
  { id: 'tx-29', ticketId: '-', type: 'cancelacion', amount: -1200, date: twelveDaysAgoStr, seller: 'sportmmwmaster', description: 'Cancelacion cliente', createdAt: Date.now() - 599000000 },
  // 15 days ago
  { id: 'tx-30', ticketId: 'MMW-003-483801', type: 'venta', amount: 2200, date: fifteenDaysAgoStr, seller: 'admin01', description: 'Apuesta MLB', createdAt: Date.now() - 700000000 },
  { id: 'tx-31', ticketId: '-', type: 'pago', amount: -5600, date: fifteenDaysAgoStr, seller: 'admin01', description: 'Pago acumulado', createdAt: Date.now() - 699000000 },
  // 20 days ago
  { id: 'tx-32', ticketId: 'MMW-003-483901', type: 'venta', amount: 1500, date: twentyDaysAgoStr, seller: 'mmw03', description: 'Venta de ticket', createdAt: Date.now() - 800000000 },
  // 25 days ago
  { id: 'tx-33', ticketId: 'MMW-003-484001', type: 'venta', amount: 3800, date: twentyFiveDaysAgoStr, seller: 'vendedor02', description: 'Apuesta especial', createdAt: Date.now() - 900000000 },
  { id: 'tx-34', ticketId: '-', type: 'pago', amount: -1900, date: twentyFiveDaysAgoStr, seller: 'vendedor02', description: 'Cobro parcial', createdAt: Date.now() - 899000000 },
];

/* ---------- component ---------- */
export default function Ventas() {
  const [selectedDate, setSelectedDate] = useState(formatDate(today));
  const [periodFilter, setPeriodFilter] = useState<'Hoy' | 'Semana' | 'Mes'>('Hoy');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [winnerTickets] = useState<TicketType[]>(MOCK_WINNERS);
  const [searchTx, setSearchTx] = useState('');
  const [searchWinners, setSearchWinners] = useState('');
  const [viewingTicket, setViewingTicket] = useState<TicketType | null>(null);
  const [detailTx, setDetailTx] = useState<Transaction & { balance: number } | null>(null);

  useEffect(() => {
    const load = () => {
      const txs = getTransactions();
      setTransactions(txs.length > 0 ? txs : MOCK_TX);
    };
    load();

    window.addEventListener('fsb:ticketCreated', load);
    window.addEventListener('focus', load);

    return () => {
      window.removeEventListener('fsb:ticketCreated', load);
      window.removeEventListener('focus', load);
    };
  }, []);

  /* ---- period filter handler ---- */
  const handlePeriodFilter = useCallback((p: 'Hoy' | 'Semana' | 'Mes') => {
    setPeriodFilter(p);
    const now = new Date();
    if (p === 'Hoy') {
      setSelectedDate(formatDate(now));
    } else if (p === 'Semana') {
      const weekAgo = new Date(now.getTime() - 7 * 86400000);
      setSelectedDate(formatDate(weekAgo));
    } else if (p === 'Mes') {
      const monthAgo = new Date(now.getTime() - 30 * 86400000);
      setSelectedDate(formatDate(monthAgo));
    }
  }, []);

  /* ---- filtered transactions ---- */
  const filteredTransactions = useMemo(() => {
    let result = transactions;

    // Filter by date based on period selection
    if (periodFilter === 'Hoy' && selectedDate) {
      result = result.filter((t) => t.date === selectedDate);
    } else if (periodFilter === 'Semana' && selectedDate) {
      const start = parseFormattedDate(selectedDate);
      const now = new Date();
      result = result.filter((t) => {
        const d = parseFormattedDate(t.date);
        return d >= start && d <= now;
      });
    } else if (periodFilter === 'Mes' && selectedDate) {
      const start = parseFormattedDate(selectedDate);
      const now = new Date();
      result = result.filter((t) => {
        const d = parseFormattedDate(t.date);
        return d >= start && d <= now;
      });
    }

    // Filter by search
    if (searchTx.trim()) {
      const q = searchTx.trim().toLowerCase();
      result = result.filter(
        (t) =>
          t.description.toLowerCase().includes(q) ||
          t.type.toLowerCase().includes(q) ||
          t.ticketId.toLowerCase().includes(q)
      );
    }

    return result;
  }, [transactions, selectedDate, searchTx, periodFilter]);

  /* ---- filtered winners ---- */
  const filteredWinners = useMemo(() => {
    let result = winnerTickets;

    // Filter winners by the same date range
    if (periodFilter === 'Hoy' && selectedDate) {
      result = result.filter((t) => t.date === selectedDate);
    } else if (periodFilter === 'Semana' && selectedDate) {
      const start = parseFormattedDate(selectedDate);
      const now = new Date();
      result = result.filter((t) => {
        const d = parseFormattedDate(t.date);
        return d >= start && d <= now;
      });
    } else if (periodFilter === 'Mes' && selectedDate) {
      const start = parseFormattedDate(selectedDate);
      const now = new Date();
      result = result.filter((t) => {
        const d = parseFormattedDate(t.date);
        return d >= start && d <= now;
      });
    }

    const q = searchWinners.trim().toLowerCase();
    if (!q) return result;
    return result.filter(
      (ticket) =>
        ticket.id.toLowerCase().includes(q) ||
        ticket.seller.toLowerCase().includes(q)
    );
  }, [winnerTickets, searchWinners, selectedDate, periodFilter]);

  /* ---- running balance ---- */
  const runningBalance = useMemo(() => {
    let bal = 0;
    return filteredTransactions.map((tx) => {
      bal += tx.amount;
      return { ...tx, balance: bal };
    }).reverse();
  }, [filteredTransactions]);

  /* ---- computed stats from filtered data ---- */
  const dailyStats = useMemo(() => {
    const ventas = filteredTransactions
      .filter((t) => t.type === 'venta')
      .reduce((sum, t) => sum + t.amount, 0);
    const premios = Math.abs(
      filteredTransactions
        .filter((t) => t.type === 'pago')
        .reduce((sum, t) => sum + t.amount, 0)
    );
    const cancelaciones = Math.abs(
      filteredTransactions
        .filter((t) => t.type === 'cancelacion')
        .reduce((sum, t) => sum + t.amount, 0)
    );
    const neto = ventas - premios - cancelaciones;
    const totalTickets = filteredTransactions.filter((t) => t.type === 'venta').length;
    const pendientes = filteredWinners.filter((t) => t.status === 'ganador').length;
    const perdedores = 0; // not tracked in tx
    const ganadores = filteredWinners.length;

    return {
      ventas,
      premios,
      neto,
      balanceCorte: 0,
      rojoCorte: -cancelaciones,
      balanceDia: neto,
      rojoDia: neto >= 0 ? 0 : neto,
      totalTickets,
      pendientes,
      perdedores,
      ganadores,
    };
  }, [filteredTransactions, filteredWinners]);

  /* ---- weekly data (from all transactions) ---- */
  const weeklyData = useMemo(() => {
    const days = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];
    const now = new Date();
    return days.map((day, i) => {
      const d = new Date(now.getTime() - (6 - i) * 86400000);
      const dStr = formatDate(d);
      const dayTxs = transactions.filter((t) => t.date === dStr);
      const venta = dayTxs
        .filter((t) => t.type === 'venta')
        .reduce((s, t) => s + t.amount, 0);
      const premios = Math.abs(
        dayTxs.filter((t) => t.type === 'pago').reduce((s, t) => s + t.amount, 0)
      );
      const neto = venta - premios;
      const comision = venta * 0.05;
      const final = neto - comision;
      const balance = final;
      const rojo = neto < 0 ? neto : 0;
      return { day, venta, premios, neto, comision, final, balance, rojo };
    });
  }, [transactions]);

  const weeklyTotals = {
    venta: weeklyData.reduce((s, d) => s + d.venta, 0),
    premios: weeklyData.reduce((s, d) => s + d.premios, 0),
    neto: weeklyData.reduce((s, d) => s + d.neto, 0),
    comision: weeklyData.reduce((s, d) => s + d.comision, 0),
    final: weeklyData.reduce((s, d) => s + d.final, 0),
    balance: weeklyData.reduce((s, d) => s + d.balance, 0),
    rojo: weeklyData.reduce((s, d) => s + d.rojo, 0),
  };

  const typeBadge = (type: string) => {
    switch (type) {
      case 'venta':
        return 'bg-accent-blue/15 text-accent-blue border border-accent-blue/30';
      case 'pago':
        return 'bg-accent-green/15 text-accent-green border border-accent-green/30';
      case 'cancelacion':
        return 'bg-accent-red/15 text-accent-red border border-accent-red/30';
      default:
        return 'bg-bg-quaternary text-text-secondary';
    }
  };

  const typeLabel = (type: string) => {
    switch (type) {
      case 'venta': return 'Venta';
      case 'pago': return 'Pago';
      case 'cancelacion': return 'Cancelacion';
      default: return type;
    }
  };

  /* ---- view transaction detail ---- */
  const handleViewTx = useCallback((tx: Transaction & { balance: number }) => {
    setDetailTx(tx);
  }, []);

  /* ---- print ---- */
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  return (
    <motion.div
      variants={containerAnim}
      initial="hidden"
      animate="show"
      className="px-4 md:px-6 lg:px-8 py-5 space-y-5"
    >
      {/* ====== Page Header ====== */}
      <motion.div variants={itemAnim} className="border-b border-border-subtle pb-4">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-semibold text-text-primary">Reportes de Ventas</h1>
        <p className="text-xs text-text-tertiary mt-1 hidden sm:block">Inicio / Ventas</p>
      </motion.div>

      {/* ====== Date Selector & Action Buttons ====== */}
      <motion.div variants={itemAnim} className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-4">
        <div className="relative">
          <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
          <input
            type="date"
            value={selectedDate.split('/').reverse().join('-')}
            onChange={(e) => {
              const d = new Date(e.target.value);
              setSelectedDate(formatDate(d));
              setPeriodFilter('Hoy');
            }}
            className="bg-bg-tertiary/60 border border-border-default rounded-md pl-9 pr-3 h-12 md:h-10 text-sm text-text-primary focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 outline-none transition-all w-full md:w-auto"
          />
        </div>

        <div className="flex gap-2">
          {(['Hoy', 'Semana', 'Mes'] as const).map((p) => (
            <button
              key={p}
              onClick={() => handlePeriodFilter(p)}
              className={`px-4 py-2 min-h-[44px] rounded-full text-sm font-medium transition-all duration-200 ${
                periodFilter === p
                  ? 'bg-accent-blue/15 text-accent-blue border border-accent-blue/30'
                  : 'text-text-muted hover:text-text-secondary hover:bg-white/5 border border-transparent'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 w-full md:w-auto md:ml-auto">
          <button
            onClick={() => alert(`Mostrando transacciones: ${periodFilter}${selectedDate ? ` desde ${selectedDate}` : ''}`)}
            className="flex items-center gap-2 px-4 min-h-[44px] rounded-md bg-accent-blue/10 text-accent-blue text-sm font-semibold border border-accent-blue/25 hover:bg-accent-blue/20 transition-all"
          >
            <Eye size={16} /> Ver ventas
          </button>
          <button
            onClick={() => window.location.hash = '#/jugadas'}
            className="flex items-center gap-2 px-4 min-h-[44px] rounded-md bg-accent-green/10 text-accent-green text-sm font-semibold border border-accent-green/25 hover:bg-accent-green/20 transition-all"
          >
            <TicketIcon size={16} /> Vender tickets
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 min-h-[44px] rounded-md bg-bg-tertiary text-text-secondary text-sm font-semibold border border-border-default hover:bg-bg-quaternary transition-all"
          >
            <Printer size={16} /> Imprimir
          </button>
          <button
            onClick={() => alert('Resumen de la semana anterior')}
            className="flex items-center gap-2 px-4 min-h-[44px] rounded-md bg-bg-tertiary text-text-secondary text-sm font-semibold border border-border-default hover:bg-bg-quaternary transition-all"
          >
            <BarChart3 size={16} /> Resumen semana anterior
          </button>
        </div>
      </motion.div>

      {/* ====== Bank Name Banner ====== */}
      <motion.div
        variants={itemAnim}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-gradient-to-r from-accent-amber/10 to-transparent border-l-4 border-accent-amber rounded-lg px-4 md:px-5 py-4 gap-3"
      >
        <div>
          <h2 className="text-lg md:text-xl lg:text-2xl text-text-primary font-bold">SPORT MMW 03</h2>
          <p className="text-xs text-text-tertiary mt-0.5">Banca deportiva activa</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-text-tertiary uppercase tracking-wider">Monto Pendiente</p>
          <p className="text-2xl md:text-3xl font-bold font-mono text-accent-amber">{formatAmount(dailyStats.neto)}</p>
        </div>
      </motion.div>

      {/* ====== Summary Cards (4-Card Grid) ====== */}
      <motion.div variants={itemAnim} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {/* Card 1: Ventas del Dia */}
        <div className="gradient-card rounded-lg border border-border-subtle p-4 md:p-5 relative overflow-hidden">
          <TrendingUp size={24} className="text-accent-blue absolute top-4 right-4" />
          <p className="text-xs text-text-tertiary uppercase tracking-wider">Ventas del Dia</p>
          <p className="text-xl md:text-2xl font-bold font-mono text-text-primary mt-2">{formatAmount(dailyStats.ventas)}</p>
          <p className="text-xs text-accent-green mt-1 flex items-center gap-1">
            <TrendingUp size={12} /> +8.5% vs ayer
          </p>
          {/* Mini sparkline */}
          <svg className="mt-3 w-full h-8" viewBox="0 0 120 30" preserveAspectRatio="none">
            <polyline
              fill="none"
              stroke="#22C55E"
              strokeWidth="2"
              points="0,25 17,20 34,22 51,12 68,15 85,8 102,10 120,5"
            />
            <polygon
              fill="rgba(34,197,94,0.1)"
              points="0,30 0,25 17,20 34,22 51,12 68,15 85,8 102,10 120,5 120,30"
            />
          </svg>
        </div>

        {/* Card 2: Balance del Dia */}
        <div className="gradient-card rounded-lg border border-border-subtle p-4 md:p-5 relative overflow-hidden">
          <BarChart3 size={24} className="text-accent-cyan absolute top-4 right-4" />
          <p className="text-xs text-text-tertiary uppercase tracking-wider">Balance del Dia</p>
          <p className="text-xl md:text-2xl font-bold font-mono text-accent-green mt-2">{formatAmount(dailyStats.neto)}</p>
          <p className="text-xs text-accent-green mt-1 flex items-center gap-1">
            <TrendingUp size={12} /> +12.3% vs ayer
          </p>
        </div>

        {/* Card 3: Ventas de la Semana */}
        <div className="gradient-card rounded-lg border border-border-subtle p-4 md:p-5 relative overflow-hidden">
          <Receipt size={24} className="text-accent-purple absolute top-4 right-4" />
          <p className="text-xs text-text-tertiary uppercase tracking-wider">Ventas de la Semana</p>
          <p className="text-xl md:text-2xl font-bold font-mono text-text-primary mt-2">{formatAmount(weeklyTotals.venta)}</p>
          {/* Mini bar chart */}
          <div className="flex items-end gap-1 mt-3 h-8">
            {weeklyData.map((d, i) => (
              <div
                key={i}
                className="flex-1 bg-accent-purple/40 rounded-t-sm"
                style={{ height: `${Math.max(5, (d.venta / 35000) * 100)}%` }}
              />
            ))}
          </div>
        </div>

        {/* Card 4: Balance de la Semana */}
        <div className="gradient-card rounded-lg border border-border-subtle p-4 md:p-5 relative overflow-hidden">
          <TrendingUp size={24} className="text-accent-amber absolute top-4 right-4" />
          <p className="text-xs text-text-tertiary uppercase tracking-wider">Balance de la Semana</p>
          <p className="text-xl md:text-2xl font-bold font-mono text-accent-amber mt-2">{formatAmount(weeklyTotals.final)}</p>
          <p className="text-xs text-accent-amber mt-1">Comisiones: {formatAmount(weeklyTotals.comision)}</p>
        </div>
      </motion.div>

      {/* ====== Daily Balance Card ====== */}
      <motion.div variants={itemAnim} className="gradient-panel rounded-lg border border-border-subtle overflow-hidden">
        <div className="px-5 py-3 border-b border-border-subtle flex items-center justify-between">
          <h3 className="text-base md:text-lg font-semibold text-text-primary">Balance Diario</h3>
          <span className="text-xs text-text-tertiary">{selectedDate}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <tbody>
              <tr className="border-b border-border-subtle hover:bg-white/[0.02]">
                <td className="px-5 py-2.5 text-sm text-text-secondary">Ventas</td>
                <td className="px-5 py-2.5 text-sm font-mono text-text-primary text-right">{formatAmount(dailyStats.ventas)}</td>
              </tr>
              <tr className="border-b border-border-subtle hover:bg-white/[0.02]">
                <td className="px-5 py-2.5 text-sm text-text-secondary">Premios</td>
                <td className="px-5 py-2.5 text-sm font-mono text-accent-red text-right">{formatAmount(dailyStats.premios)}</td>
              </tr>
              <tr className="border-b border-border-subtle hover:bg-white/[0.02]">
                <td className="px-5 py-2.5 text-sm text-text-secondary font-medium">Neto</td>
                <td className="px-5 py-2.5 text-sm font-mono text-accent-green text-right font-medium">{formatAmount(dailyStats.neto)}</td>
              </tr>
              <tr className="border-b border-border-subtle hover:bg-white/[0.02]">
                <td className="px-5 py-2.5 text-sm text-text-secondary">Balance al corte</td>
                <td className="px-5 py-2.5 text-sm font-mono text-text-primary text-right">{formatAmount(dailyStats.balanceCorte)}</td>
              </tr>
              <tr className="border-b border-border-subtle hover:bg-white/[0.02]">
                <td className="px-5 py-2.5 text-sm text-text-secondary">Rojo al corte</td>
                <td className="px-5 py-2.5 text-sm font-mono text-accent-red text-right">{formatAmount(dailyStats.rojoCorte)}</td>
              </tr>
              <tr className="border-b border-border-subtle hover:bg-white/[0.02]">
                <td className="px-5 py-2.5 text-sm text-text-secondary">Balance al dia</td>
                <td className="px-5 py-2.5 text-sm font-mono text-text-primary text-right">{formatAmount(dailyStats.balanceDia)}</td>
              </tr>
              <tr className="border-b border-border-subtle hover:bg-white/[0.02]">
                <td className="px-5 py-2.5 text-sm text-text-secondary">Rojo al dia</td>
                <td className="px-5 py-2.5 text-sm font-mono text-accent-red text-right">{formatAmount(dailyStats.rojoDia)}</td>
              </tr>
              <tr className="border-b border-border-subtle hover:bg-white/[0.02]">
                <td className="px-5 py-2.5 text-sm text-text-secondary">Total de tickets</td>
                <td className="px-5 py-2.5 text-sm font-mono text-text-primary text-right">{dailyStats.totalTickets}</td>
              </tr>
              <tr className="border-b border-border-subtle hover:bg-white/[0.02]">
                <td className="px-5 py-2.5 text-sm text-text-secondary">Pendientes</td>
                <td className="px-5 py-2.5 text-sm font-mono text-accent-amber text-right">{dailyStats.pendientes}</td>
              </tr>
              <tr className="border-b border-border-subtle hover:bg-white/[0.02]">
                <td className="px-5 py-2.5 text-sm text-text-secondary">Perdedores</td>
                <td className="px-5 py-2.5 text-sm font-mono text-accent-red text-right">{dailyStats.perdedores}</td>
              </tr>
              <tr className="hover:bg-white/[0.02]">
                <td className="px-5 py-2.5 text-sm text-text-secondary">Ganadores</td>
                <td className="px-5 py-2.5 text-sm font-mono text-accent-green text-right">{dailyStats.ganadores}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* ====== Weekly Balance Card ====== */}
      <motion.div variants={itemAnim} className="gradient-panel rounded-lg border border-border-subtle overflow-hidden">
        <div className="px-5 py-3 border-b border-border-subtle flex items-center justify-between">
          <h3 className="text-base md:text-lg font-semibold text-text-primary">Balance Semanal</h3>
          <span className="text-xs text-text-tertiary">Semana actual</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-bg-secondary/80">
                <th className="px-4 py-2.5 text-left text-xs text-text-secondary font-semibold uppercase tracking-wider">Concepto</th>
                {weeklyData.map((d) => (
                  <th key={d.day} className="px-3 py-2.5 text-center text-xs text-text-secondary font-semibold uppercase tracking-wider">{d.day}</th>
                ))}
                <th className="px-4 py-2.5 text-right text-xs text-accent-blue font-semibold uppercase tracking-wider">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border-subtle hover:bg-white/[0.02]">
                <td className="px-4 py-2.5 text-sm text-text-secondary">Venta</td>
                {weeklyData.map((d, i) => (
                  <td key={i} className="px-3 py-2.5 text-sm font-mono text-text-primary text-center">{formatAmount(d.venta)}</td>
                ))}
                <td className="px-4 py-2.5 text-sm font-mono text-accent-green text-right font-medium">{formatAmount(weeklyTotals.venta)}</td>
              </tr>
              <tr className="border-b border-border-subtle hover:bg-white/[0.02]">
                <td className="px-4 py-2.5 text-sm text-text-secondary">Premios</td>
                {weeklyData.map((d, i) => (
                  <td key={i} className="px-3 py-2.5 text-sm font-mono text-accent-red text-center">{formatAmount(d.premios)}</td>
                ))}
                <td className="px-4 py-2.5 text-sm font-mono text-accent-red text-right font-medium">{formatAmount(weeklyTotals.premios)}</td>
              </tr>
              <tr className="border-b border-border-subtle hover:bg-white/[0.02]">
                <td className="px-4 py-2.5 text-sm text-text-secondary font-medium">Venta neta</td>
                {weeklyData.map((d, i) => (
                  <td key={i} className="px-3 py-2.5 text-sm font-mono text-text-primary text-center">{formatAmount(d.neto)}</td>
                ))}
                <td className="px-4 py-2.5 text-sm font-mono text-accent-green text-right font-medium">{formatAmount(weeklyTotals.neto)}</td>
              </tr>
              <tr className="border-b border-border-subtle hover:bg-white/[0.02]">
                <td className="px-4 py-2.5 text-sm text-text-secondary">Comision</td>
                {weeklyData.map((d, i) => (
                  <td key={i} className="px-3 py-2.5 text-sm font-mono text-text-secondary text-center">{formatAmount(d.comision)}</td>
                ))}
                <td className="px-4 py-2.5 text-sm font-mono text-text-secondary text-right">{formatAmount(weeklyTotals.comision)}</td>
              </tr>
              <tr className="border-b border-border-subtle hover:bg-white/[0.02]">
                <td className="px-4 py-2.5 text-sm text-text-secondary font-medium">Final</td>
                {weeklyData.map((d, i) => (
                  <td key={i} className="px-3 py-2.5 text-sm font-mono text-text-primary text-center">{formatAmount(d.final)}</td>
                ))}
                <td className="px-4 py-2.5 text-sm font-mono text-accent-green text-right font-medium">{formatAmount(weeklyTotals.final)}</td>
              </tr>
              <tr className="border-b border-border-subtle hover:bg-white/[0.02]">
                <td className="px-4 py-2.5 text-sm text-text-secondary">Balance al dia</td>
                {weeklyData.map((d, i) => (
                  <td key={i} className={`px-3 py-2.5 text-sm font-mono text-center ${d.balance >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>{formatAmount(d.balance)}</td>
                ))}
                <td className={`px-4 py-2.5 text-sm font-mono text-right font-medium ${weeklyTotals.balance >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>{formatAmount(weeklyTotals.balance)}</td>
              </tr>
              <tr className="hover:bg-white/[0.02]">
                <td className="px-4 py-2.5 text-sm text-text-secondary">Rojo al dia</td>
                {weeklyData.map((d, i) => (
                  <td key={i} className={`px-3 py-2.5 text-sm font-mono text-center ${d.rojo >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>{formatAmount(d.rojo)}</td>
                ))}
                <td className={`px-4 py-2.5 text-sm font-mono text-right font-medium ${weeklyTotals.rojo >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>{formatAmount(weeklyTotals.rojo)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* ====== Winner Tickets Table ====== */}
      <motion.div variants={itemAnim} className="gradient-panel rounded-lg border border-border-subtle overflow-hidden">
        <div className="px-5 py-3 border-b border-border-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h3 className="text-base md:text-lg font-semibold text-text-primary">Tickets Ganadores</h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-accent-green/15 text-accent-green border border-accent-green/30">
              {filteredWinners.length}
            </span>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
              <input
                type="text"
                value={searchWinners}
                onChange={(e) => setSearchWinners(e.target.value)}
                placeholder="Buscar ticket o vendedor..."
                className="input-standard pl-9 pr-3 h-12 md:h-10 text-sm w-full sm:w-[280px]"
              />
              {searchWinners && (
                <button
                  onClick={() => setSearchWinners('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <button
              onClick={() => alert(`Total ganadores pendientes: ${filteredWinners.filter(w => w.status === 'ganador').length}`)}
              className="text-xs text-accent-blue hover:text-accent-blue-bright transition-colors flex items-center gap-1 min-h-[44px] shrink-0"
            >
              Ver todos <ChevronRight size={14} />
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-bg-secondary/80">
                <th className="px-4 py-2.5 text-left text-xs text-text-secondary font-semibold uppercase tracking-wider">Numero</th>
                <th className="px-4 py-2.5 text-left text-xs text-text-secondary font-semibold uppercase tracking-wider">Fecha</th>
                <th className="px-4 py-2.5 text-left text-xs text-text-secondary font-semibold uppercase tracking-wider">Usuario</th>
                <th className="px-4 py-2.5 text-right text-xs text-text-secondary font-semibold uppercase tracking-wider">Monto</th>
                <th className="px-4 py-2.5 text-right text-xs text-text-secondary font-semibold uppercase tracking-wider">A pagar</th>
                <th className="px-4 py-2.5 text-center text-xs text-text-secondary font-semibold uppercase tracking-wider">Estado</th>
                <th className="px-4 py-2.5 text-center text-xs text-text-secondary font-semibold uppercase tracking-wider">Accion</th>
              </tr>
            </thead>
            <tbody>
              {filteredWinners.map((ticket, i) => (
                <tr
                  key={ticket.id}
                  className={`border-b border-border-subtle hover:bg-white/[0.04] transition-colors ${i % 2 === 1 ? 'bg-white/[0.02]' : ''}`}
                >
                  <td className="px-4 py-2.5 text-sm font-mono text-accent-blue">{ticket.id}</td>
                  <td className="px-4 py-2.5 text-sm text-text-secondary">{ticket.date}</td>
                  <td className="px-4 py-2.5 text-sm text-text-secondary">{ticket.seller}</td>
                  <td className="px-4 py-2.5 text-sm font-mono text-text-primary text-right">{formatAmount(ticket.amount)}</td>
                  <td className="px-4 py-2.5 text-sm font-mono text-accent-green text-right">{formatAmount(ticket.payout)}</td>
                  <td className="px-4 py-2.5 text-center">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      ticket.status === 'pagado'
                        ? 'bg-accent-green/15 text-accent-green border border-accent-green/30'
                        : 'bg-accent-amber/15 text-accent-amber border border-accent-amber/30'
                    }`}>
                      {ticket.status === 'pagado' ? 'Pagado' : 'Pendiente'}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <button
                      onClick={() => setViewingTicket(ticket)}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-accent-blue/10 text-accent-blue text-xs font-semibold border border-accent-blue/25 hover:bg-accent-blue/20 transition-all"
                    >
                      <Eye size={12} /> Ver Ticket
                    </button>
                  </td>
                </tr>
              ))}
              {filteredWinners.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <Receipt size={48} className="mx-auto text-text-muted/30 mb-3" />
                    <p className="text-body-lg text-text-tertiary">
                      {searchWinners ? 'No se encontraron resultados' : 'No hay tickets ganadores'}
                    </p>
                    <p className="text-sm text-text-muted mt-1">
                      {searchWinners ? 'Intente con otro termino de busqueda' : 'Los tickets ganadores apareceran aqui'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* ====== Transaction History Table ====== */}
      <motion.div variants={itemAnim} className="gradient-panel rounded-lg border border-border-subtle overflow-hidden">
        <div className="px-5 py-3 border-b border-border-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base md:text-lg font-semibold text-text-primary">Historial de Transacciones</h3>
            <p className="text-xs text-text-tertiary mt-0.5">Ultimas {runningBalance.length} transacciones</p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
              <input
                type="text"
                value={searchTx}
                onChange={(e) => setSearchTx(e.target.value)}
                placeholder="Buscar por concepto, tipo o ticket..."
                className="input-standard pl-9 pr-3 h-12 md:h-10 text-sm w-full sm:w-[280px]"
              />
              {searchTx && (
                <button
                  onClick={() => setSearchTx('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <button
              onClick={() => alert(`Total transacciones filtradas: ${filteredTransactions.length}`)}
              className="text-xs text-accent-blue hover:text-accent-blue-bright transition-colors flex items-center gap-1 min-h-[44px] shrink-0"
            >
              Ver todas <ArrowRight size={14} />
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-bg-secondary/80">
                <th className="px-4 py-2.5 text-left text-xs text-text-secondary font-semibold uppercase tracking-wider">Concepto</th>
                <th className="px-4 py-2.5 text-left text-xs text-text-secondary font-semibold uppercase tracking-wider">Fecha</th>
                <th className="px-4 py-2.5 text-right text-xs text-text-secondary font-semibold uppercase tracking-wider">Anterior</th>
                <th className="px-4 py-2.5 text-right text-xs text-text-secondary font-semibold uppercase tracking-wider">Debito</th>
                <th className="px-4 py-2.5 text-right text-xs text-text-secondary font-semibold uppercase tracking-wider">Credito</th>
                <th className="px-4 py-2.5 text-right text-xs text-text-secondary font-semibold uppercase tracking-wider">Balance</th>
                <th className="px-4 py-2.5 text-center text-xs text-text-secondary font-semibold uppercase tracking-wider">Accion</th>
              </tr>
            </thead>
            <tbody>
              {runningBalance.map((tx, i) => {
                const prevBal = i > 0 ? runningBalance[i - 1].balance : 0;
                const isDebit = tx.amount < 0;
                return (
                  <tr
                    key={tx.id}
                    className={`border-b border-border-subtle hover:bg-white/[0.04] transition-colors ${i % 2 === 1 ? 'bg-white/[0.02]' : ''}`}
                  >
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${typeBadge(tx.type)}`}>
                          {typeLabel(tx.type)}
                        </span>
                        <span className="text-sm text-text-secondary">{tx.description}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-sm font-mono text-text-tertiary">{tx.date}</td>
                    <td className="px-4 py-2.5 text-sm font-mono text-text-secondary text-right">{formatAmount(prevBal)}</td>
                    <td className="px-4 py-2.5 text-sm font-mono text-accent-red text-right">{isDebit ? formatAmount(Math.abs(tx.amount)) : '-'}</td>
                    <td className="px-4 py-2.5 text-sm font-mono text-accent-green text-right">{!isDebit ? formatAmount(tx.amount) : '-'}</td>
                    <td className={`px-4 py-2.5 text-sm font-mono text-right font-medium ${tx.balance >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
                      {formatAmount(tx.balance)}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <button
                        onClick={() => handleViewTx(tx)}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-accent-blue/10 text-accent-blue text-xs font-semibold border border-accent-blue/25 hover:bg-accent-blue/20 transition-all"
                      >
                        <Eye size={12} /> Ver
                      </button>
                    </td>
                  </tr>
                );
              })}
              {runningBalance.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <Receipt size={48} className="mx-auto text-text-muted/30 mb-3" />
                    <p className="text-body-lg text-text-tertiary">
                      {searchTx ? 'No se encontraron resultados' : 'No hay transacciones'}
                    </p>
                    <p className="text-sm text-text-muted mt-1">
                      {searchTx ? 'Intente con otro termino de busqueda' : 'Las transacciones apareceran aqui'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* ====== Pending Amounts Summary ====== */}
      <motion.div
        variants={itemAnim}
        className="gradient-panel rounded-lg border border-border-subtle border-l-4 border-l-accent-amber overflow-hidden"
      >
        <div className="px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-text-tertiary">Pendientes de Pago</p>
            <p className="text-xl md:text-2xl font-bold font-mono text-accent-amber mt-1">
              {formatAmount(filteredWinners.filter(w => w.status === 'ganador').reduce((s, w) => s + w.payout, 0))}
            </p>
            <p className="text-xs text-text-tertiary mt-1 hidden sm:block">{filteredWinners.filter(w => w.status === 'ganador').length} tickets ganadores sin pagar</p>
          </div>
          <a
            href="#/pendientes"
            className="flex items-center gap-2 px-5 py-2.5 rounded-md bg-accent-blue/10 text-accent-blue text-sm font-semibold border border-accent-blue/25 hover:bg-accent-blue/20 transition-all"
          >
            Ver Detalle <ArrowRight size={16} />
          </a>
        </div>
      </motion.div>

      {/* ====== Transaction Detail Modal ====== */}
      <AnimatePresence>
        {detailTx && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.7)' }}
            onClick={() => setDetailTx(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-bg-primary border border-border-subtle rounded-xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-text-primary">Detalle de Transaccion</h3>
                <button onClick={() => setDetailTx(null)} className="p-1 rounded hover:bg-white/5">
                  <X size={18} className="text-text-muted" />
                </button>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-text-tertiary">ID</span>
                  <span className="text-sm font-mono text-text-primary">{detailTx.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-text-tertiary">Ticket</span>
                  <span className="text-sm font-mono text-accent-blue">{detailTx.ticketId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-text-tertiary">Tipo</span>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${typeBadge(detailTx.type)}`}>
                    {typeLabel(detailTx.type)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-text-tertiary">Descripcion</span>
                  <span className="text-sm text-text-secondary">{detailTx.description}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-text-tertiary">Fecha</span>
                  <span className="text-sm font-mono text-text-secondary">{detailTx.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-text-tertiary">Monto</span>
                  <span className={`text-sm font-mono font-semibold ${detailTx.amount >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
                    {formatAmount(Math.abs(detailTx.amount))}
                  </span>
                </div>
                <div className="flex justify-between border-t border-border-subtle pt-3">
                  <span className="text-sm text-text-tertiary font-medium">Balance acumulado</span>
                  <span className={`text-sm font-mono font-bold ${detailTx.balance >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
                    {formatAmount(detailTx.balance)}
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ====== Ticket Receipt Modal ====== */}
      <AnimatePresence>
        {viewingTicket && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.7)' }}
            onClick={() => setViewingTicket(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-[400px] w-full max-h-[90vh] overflow-y-auto rounded-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center p-3 rounded-t-xl" style={{ background: '#FFFFFF' }}>
                <span className="text-sm font-bold text-black">Ticket {viewingTicket.id}</span>
                <button onClick={() => setViewingTicket(null)} className="p-1 rounded hover:bg-gray-100">
                  <X size={16} className="text-gray-500" />
                </button>
              </div>
              <TicketReceipt ticket={viewingTicket} copyLabel="*** COPIA ***" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
