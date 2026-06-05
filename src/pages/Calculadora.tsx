import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CountUp from 'react-countup';
import { Calculator, X, RotateCcw } from 'lucide-react';

// ------------------------------------------------------------------
// Types
// ------------------------------------------------------------------
interface BetRow {
  id: number;
  amount: string;
  odds: string;
}

interface CalculationResult {
  totalBet: number;
  totalPayout: number;
  netPayout: number;
}

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------
function americanToDecimal(american: string): number | null {
  const trimmed = american.trim();
  if (!trimmed) return null;

  const sign = trimmed[0];
  const numStr = sign === '+' || sign === '-' ? trimmed.slice(1) : trimmed;
  const num = parseFloat(numStr);

  if (isNaN(num) || num <= 0) return null;

  if (sign === '-') {
    // Negative: (100 / abs(odds)) + 1
    return 100 / num + 1;
  } else {
    // Positive or no sign: (odds / 100) + 1
    return num / 100 + 1;
  }
}

// Validate odds format: +###, -###
function isValidOdds(odds: string): boolean {
  if (!odds.trim()) return false;
  const decimal = americanToDecimal(odds);
  return decimal !== null && decimal > 0;
}

// ------------------------------------------------------------------
// Components
// ------------------------------------------------------------------

export default function Calculadora() {
  const MIN_ROWS = 2;
  const MAX_ROWS = 10;

  const [rows, setRows] = useState<BetRow[]>([
    { id: 1, amount: '', odds: '' },
    { id: 2, amount: '', odds: '' },
  ]);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [calculated, setCalculated] = useState(false);
  const nextIdRef = useRef(3);
  const resultKeyRef = useRef(0);

  // Determine visible rows: always show at least MIN_ROWS, plus any that have data,
  // plus one empty row at the bottom (up to MAX_ROWS)
  const visibleRows = (() => {
    const dataRowCount = rows.filter((r) => r.amount || r.odds).length;
    let targetCount = Math.max(MIN_ROWS, dataRowCount + 1);
    targetCount = Math.min(targetCount, MAX_ROWS);

    // Ensure we have enough row objects
    const current = [...rows];
    while (current.length < targetCount) {
      current.push({ id: nextIdRef.current++, amount: '', odds: '' });
    }
    return current.slice(0, targetCount);
  })();

  const updateRow = useCallback(
    (id: number, field: 'amount' | 'odds', value: string) => {
      setRows((prev) => {
        const existing = prev.find((r) => r.id === id);
        if (existing) {
          return prev.map((r) => (r.id === id ? { ...r, [field]: value } : r));
        }
        return [...prev, { id, amount: '', odds: '', [field]: value }];
      });
    },
    []
  );

  const removeRow = useCallback(
    (id: number) => {
      if (visibleRows.length <= MIN_ROWS) return;
      setRows((prev) => prev.filter((r) => r.id !== id));
      setResult(null);
      setCalculated(false);
    },
    [visibleRows.length]
  );

  const handleCalculate = () => {
    let totalBet = 0;
    let hasValidBet = false;
    const decimals: number[] = [];

    for (const row of visibleRows) {
      const amount = parseFloat(row.amount) || 0;
      const decimalOdds = americanToDecimal(row.odds);

      if (amount > 0 && decimalOdds !== null) {
        totalBet += amount;
        decimals.push(decimalOdds);
        hasValidBet = true;
      }
    }

    if (!hasValidBet) {
      setResult({ totalBet: 0, totalPayout: 0, netPayout: 0 });
      resultKeyRef.current++;
      setCalculated(true);
      return;
    }

    // Parlay calculation: total odds = product of all individual decimal odds
    const totalOdds = decimals.reduce((acc, d) => acc * d, 1);
    const totalPayout = totalBet * totalOdds;
    const netPayout = totalPayout - totalBet;

    setResult({
      totalBet,
      totalPayout,
      netPayout,
    });
    resultKeyRef.current++;
    setCalculated(true);
  };

  const handleClear = () => {
    setRows([
      { id: 1, amount: '', odds: '' },
      { id: 2, amount: '', odds: '' },
    ]);
    nextIdRef.current = 3;
    setResult(null);
    setCalculated(false);
  };

  const formatAmountInput = (value: string): string => {
    // Allow only numbers and one decimal point
    const cleaned = value.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('');
    }
    return cleaned;
  };

  const formatOddsInput = (value: string): string => {
    // Allow +, -, numbers, and one decimal point
    let cleaned = value.replace(/[^0-9+\-.]/g, '');
    // Ensure + or - is only at the beginning
    if (cleaned.length > 1 && (cleaned[0] === '+' || cleaned[0] === '-')) {
      cleaned = cleaned[0] + cleaned.slice(1).replace(/[+-]/g, '');
    }
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('');
    }
    return cleaned;
  };

  return (
    <div className="pt-4 pb-8 px-4 md:px-6 lg:px-8">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-4 md:mb-6"
      >
        <h1 className="text-xl md:text-2xl lg:text-3xl font-semibold text-text-primary">Calculadora Parlay</h1>
        <p className="text-sm md:text-base text-text-secondary mt-1">
          Ingrese los valores de las apuestas individuales
        </p>
      </motion.div>

      {/* Calculator Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.35,
          delay: 0.1,
          ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
        }}
        className="mx-0 md:mx-6"
      >
        <div className="gradient-card rounded-xl border border-border-subtle shadow-panel overflow-hidden max-w-[640px] w-full">
          {/* Card header */}
          <div className="flex items-center gap-3 px-4 md:px-6 py-4 md:py-5 border-b border-border-subtle">
            <Calculator size={20} className="text-accent-blue" />
            <h3 className="text-lg md:text-xl font-semibold text-text-primary">Parlay</h3>
          </div>

          {/* Table header */}
          <div className="hidden md:grid grid-cols-[28px_1fr_100px_32px] gap-2 px-4 md:px-6 py-2.5 border-b border-border-subtle">
            <span className="text-xs text-text-tertiary text-center">#</span>
            <span className="text-xs text-text-tertiary">Apuesta ($)</span>
            <span className="text-xs text-text-tertiary">Linea (Odds)</span>
            <span></span>
          </div>

          {/* Bet rows */}
          <div className="px-6 py-2">
            <AnimatePresence mode="popLayout">
              {visibleRows.map((row, index) => (
                <motion.div
                  key={row.id}
                  layout
                  initial={{ opacity: 0, height: 0, x: -10 }}
                  animate={{ opacity: 1, height: 'auto', x: 0 }}
                  exit={{ opacity: 0, height: 0, x: 10 }}
                  transition={{
                    duration: 0.2,
                    delay: index * 0.03,
                    ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
                  }}
                  className="grid grid-cols-1 md:grid-cols-[28px_1fr_100px_32px] gap-2 items-center py-2 md:py-1 border-b border-border-subtle md:border-0"
                >
                  {/* Row number */}
                  <span className="text-xs text-text-tertiary text-center font-mono hidden md:block">
                    {index + 1}
                  </span>

                  {/* Amount input */}
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary text-sm font-mono">
                      $
                    </span>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={row.amount}
                      onChange={(e) =>
                        updateRow(row.id, 'amount', formatAmountInput(e.target.value))
                      }
                      placeholder="0.00"
                      className="w-full h-12 md:h-10 pl-7 pr-2.5 py-2 rounded-sm bg-[rgba(30,41,59,0.6)] border border-border-default text-text-primary text-sm font-mono text-right placeholder:text-text-tertiary focus:border-accent-blue focus:outline-none transition-colors"
                    />
                  </div>

                  {/* Odds input */}
                  <input
                    type="text"
                    inputMode="tel"
                    value={row.odds}
                    onChange={(e) =>
                      updateRow(row.id, 'odds', formatOddsInput(e.target.value))
                    }
                    onBlur={() => {
                      // Auto-prefix + if user typed just a number
                      const val = row.odds.trim();
                      if (val && !val.startsWith('+') && !val.startsWith('-') && !isNaN(parseFloat(val))) {
                        updateRow(row.id, 'odds', '+' + val);
                      }
                    }}
                    placeholder="+000"
                    className={`w-full px-2.5 py-2 rounded-sm bg-[rgba(30,41,59,0.6)] border text-text-primary text-sm font-mono text-right placeholder:text-text-tertiary focus:outline-none transition-colors ${
                      row.odds && !isValidOdds(row.odds) && row.odds.trim() !== ''
                        ? 'border-accent-red'
                        : 'border-border-default focus:border-accent-blue'
                    }`}
                  />

                  {/* Delete button */}
                  <div className="flex justify-center">
                    {visibleRows.length > MIN_ROWS && index >= MIN_ROWS && (
                      <button
                        onClick={() => removeRow(row.id)}
                        className="w-8 h-8 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-md bg-[rgba(148,163,184,0.06)] hover:bg-accent-red/20 text-text-tertiary hover:text-accent-red transition-all opacity-100 md:opacity-0 md:hover:opacity-100 md:focus:opacity-100 cursor-pointer"
                        title="Eliminar fila"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Results summary */}
          <div className="mt-2 mx-0 bg-[rgba(17,24,39,0.8)] border-t border-border-subtle px-4 md:px-6 py-4 md:py-5">
            {/* Apuesta Total */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-text-secondary">Apuesta Total</span>
              <span className="text-base md:text-lg font-semibold text-text-primary font-mono text-right">
                {calculated && result ? (
                  <CountUp
                    key={`bet-${resultKeyRef.current}`}
                    start={0}
                    end={result.totalBet}
                    decimals={2}
                    prefix="$"
                    duration={0.6}
                    separator=","
                  />
                ) : (
                  '$0.00'
                )}
              </span>
            </div>

            {/* Premio Total */}
            <div className="flex items-center justify-between mb-2 border-l-[3px] border-accent-green pl-3 -ml-3">
              <span className="text-sm text-text-secondary">Premio Total</span>
              <motion.span
                className="text-2xl md:text-3xl font-bold text-accent-green font-mono text-right"
                animate={
                  calculated
                    ? {
                        textShadow: [
                          '0 0 0px rgba(34,197,94,0)',
                          '0 0 8px rgba(34,197,94,0.3)',
                          '0 0 0px rgba(34,197,94,0)',
                        ],
                      }
                    : {}
                }
                transition={{ duration: 0.6 }}
              >
                {calculated && result ? (
                  <CountUp
                    key={`payout-${resultKeyRef.current}`}
                    start={0}
                    end={result.totalPayout}
                    decimals={2}
                    prefix="$"
                    duration={0.6}
                    separator=","
                  />
                ) : (
                  '$0.00'
                )}
              </motion.span>
            </div>

            {/* Divider */}
            <div className="border-t border-border-subtle my-3" />

            {/* Pago Neto */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">Pago Neto</span>
              <motion.span
                className="text-h3 font-semibold text-accent-cyan font-mono text-right"
                animate={
                  calculated
                    ? {
                        textShadow: [
                          '0 0 0px rgba(6,182,212,0)',
                          '0 0 8px rgba(6,182,212,0.3)',
                          '0 0 0px rgba(6,182,212,0)',
                        ],
                      }
                    : {}
                }
                transition={{ duration: 0.6 }}
              >
                {calculated && result ? (
                  <CountUp
                    key={`net-${resultKeyRef.current}`}
                    start={0}
                    end={result.netPayout}
                    decimals={2}
                    prefix="$"
                    duration={0.6}
                    separator=","
                  />
                ) : (
                  '$0.00'
                )}
              </motion.span>
            </div>

            {/* Empty state hint */}
            {!calculated && (
              <p className="text-xs text-text-tertiary text-center mt-3">
                Ingrese las lineas y montos para calcular
              </p>
            )}
          </div>

          {/* Action buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.2 }}
            className="flex items-center justify-between px-6 py-4 gap-3"
          >
            <button
              onClick={handleClear}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-semibold text-text-muted bg-transparent hover:bg-[rgba(148,163,184,0.08)] transition-all cursor-pointer"
            >
              <RotateCcw size={16} />
              Limpiar
            </button>
            <div className="flex gap-3">
              <button
                onClick={handleCalculate}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-md text-sm font-semibold gradient-accent text-white hover:brightness-110 hover:-translate-y-px shadow-accent active:scale-[0.98] active:brightness-95 transition-all cursor-pointer"
              >
                <Calculator size={16} />
                Calcular
              </button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
