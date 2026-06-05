import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
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

/* ---------- mock data helpers ---------- */
const today = new Date();
const todayStr = formatDate(today);

const MOCK_WINNERS: TicketType[] = [
  { id: 'MMW-003-482931', seller: 'mmw03', date: todayStr, plays: [], amount: 500, payout: 950, profit: 450, status: 'ganador', createdAt: Date.now() - 86400000 },
  { id: 'MMW-003-482945', seller: 'mmw03', date: todayStr, plays: [], amount: 1200, payout: 2280, profit: 1080, status: 'ganador', createdAt: Date.now() - 72000000 },
  { id: 'MMW-003-482967', seller: 'mmw03', date: todayStr, plays: [], amount: 300, payout: 570, profit: 270, status: 'pagado', createdAt: Date.now() - 36000000, paidAt: Date.now() - 18000000 },
];

const MOCK_TX: Transaction[] = [
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
];

/* ---------- component ---------- */
export default function Ventas() {
  const [selectedDate, setSelectedDate] = useState(formatDate(today));
  const [periodFilter, setPeriodFilter] = useState<'Hoy' | 'Semana' | 'Mes'>('Hoy');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [winnerTickets] = useState<TicketType[]>(MOCK_WINNERS);
  const [searchTx, setSearchTx] = useState('');
  const [searchWinners, setSearchWinners] = useState('');

  useEffect(() => {
    const load = () => {
      const txs = getTransactions();
      setTransactions(txs.length > 0 ? txs : MOCK_TX);
    };
    load();

    // Refresh when new tickets are created (transactions are added too)
    window.addEventListener('fsb:ticketCreated', load);
    window.addEventListener('focus', load);

    return () => {
      window.removeEventListener('fsb:ticketCreated', load);
      window.removeEventListener('focus', load);
    };
  }, []);

  const filteredTransactions = useMemo(() => {
    const q = searchTx.trim().toLowerCase();
    if (!q) return transactions;
    return transactions.filter(
      (tx) =>
        tx.description.toLowerCase().includes(q) ||
        tx.type.toLowerCase().includes(q) ||
        tx.ticketId.toLowerCase().includes(q)
    );
  }, [transactions, searchTx]);

  const filteredWinners = useMemo(() => {
    const q = searchWinners.trim().toLowerCase();
    if (!q) return winnerTickets;
    return winnerTickets.filter(
      (ticket) =>
        ticket.id.toLowerCase().includes(q) ||
        ticket.seller.toLowerCase().includes(q)
    );
  }, [winnerTickets, searchWinners]);

  const runningBalance = useMemo(() => {
    let bal = 0;
    return filteredTransactions.map((tx) => {
      bal += tx.amount;
      return { ...tx, balance: bal };
    }).reverse();
  }, [filteredTransactions]);

  const dailyStats = {
    ventas: 14320.00,
    premios: 6500.00,
    neto: 7820.00,
    balanceCorte: 0.00,
    rojoCorte: -7781.00,
    balanceDia: 0.00,
    rojoDia: -7781.00,
    totalTickets: 47,
    pendientes: 12,
    perdedores: 18,
    ganadores: 8,
  };

  const weeklyData = [
    { day: 'Lun', venta: 18200.00, premios: 8200.00, neto: 10000.00, comision: 910.00, final: 9090.00, balance: 1200.00, rojo: -500.00 },
    { day: 'Mar', venta: 15400.00, premios: 7100.00, neto: 8300.00, comision: 770.00, final: 7530.00, balance: 800.00, rojo: -1200.00 },
    { day: 'Mie', venta: 21300.00, premios: 9500.00, neto: 11800.00, comision: 1065.00, final: 10735.00, balance: 2100.00, rojo: -300.00 },
    { day: 'Jue', venta: 12800.00, premios: 6200.00, neto: 6600.00, comision: 640.00, final: 5960.00, balance: -400.00, rojo: -2800.00 },
    { day: 'Vie', venta: 24500.00, premios: 11200.00, neto: 13300.00, comision: 1225.00, final: 12075.00, balance: 3500.00, rojo: -100.00 },
    { day: 'Sab', venta: 32100.00, premios: 15800.00, neto: 16300.00, comision: 1605.00, final: 14695.00, balance: 4800.00, rojo: 0.00 },
    { day: 'Dom', venta: 9870.00, premios: 5200.00, neto: 4670.00, comision: 493.50, final: 4176.50, balance: -200.00, rojo: -1500.00 },
  ];

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
            }}
            className="bg-bg-tertiary/60 border border-border-default rounded-md pl-9 pr-3 h-12 md:h-10 text-sm text-text-primary focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 outline-none transition-all w-full md:w-auto"
          />
        </div>

        <div className="flex gap-2">
          {(['Hoy', 'Semana', 'Mes'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriodFilter(p)}
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
          <button className="flex items-center gap-2 px-4 min-h-[44px] rounded-md bg-accent-blue/10 text-accent-blue text-sm font-semibold border border-accent-blue/25 hover:bg-accent-blue/20 transition-all">
            <Eye size={16} /> Ver ventas
          </button>
          <button className="flex items-center gap-2 px-4 min-h-[44px] rounded-md bg-accent-green/10 text-accent-green text-sm font-semibold border border-accent-green/25 hover:bg-accent-green/20 transition-all">
            <TicketIcon size={16} /> Vender tickets
          </button>
          <button className="flex items-center gap-2 px-4 min-h-[44px] rounded-md bg-bg-tertiary text-text-secondary text-sm font-semibold border border-border-default hover:bg-bg-quaternary transition-all">
            <Printer size={16} /> Imprimir
          </button>
          <button className="flex items-center gap-2 px-4 min-h-[44px] rounded-md bg-bg-tertiary text-text-secondary text-sm font-semibold border border-border-default hover:bg-bg-quaternary transition-all">
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
          <p className="text-2xl md:text-3xl font-bold font-mono text-accent-amber">$14,327.00</p>
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
                style={{ height: `${(d.venta / 35000) * 100}%` }}
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
            <button className="text-xs text-accent-blue hover:text-accent-blue-bright transition-colors flex items-center gap-1 min-h-[44px] shrink-0">
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
                </tr>
              ))}
              {filteredWinners.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
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
            <button className="text-xs text-accent-blue hover:text-accent-blue-bright transition-colors flex items-center gap-1 min-h-[44px] shrink-0">
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
                  </tr>
                );
              })}
              {runningBalance.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
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
            <p className="text-xl md:text-2xl font-bold font-mono text-accent-amber mt-1">$14,327.00</p>
            <p className="text-xs text-text-tertiary mt-1 hidden sm:block">7 tickets ganadores sin pagar</p>
          </div>
          <a
            href="#/pendientes"
            className="flex items-center gap-2 px-5 py-2.5 rounded-md bg-accent-blue/10 text-accent-blue text-sm font-semibold border border-accent-blue/25 hover:bg-accent-blue/20 transition-all"
          >
            Ver Detalle <ArrowRight size={16} />
          </a>
        </div>
      </motion.div>
    </motion.div>
  );
}
