import { useState, useCallback } from 'react';
import { Calculator, Trash2, TrendingUp, DollarSign, Wallet } from 'lucide-react';

interface BetEntry {
  id: number;
  odds: string;
  stake: string;
}

const INITIAL_ENTRIES: BetEntry[] = [
  { id: 1, odds: '', stake: '' },
  { id: 2, odds: '', stake: '' },
  { id: 3, odds: '', stake: '' },
  { id: 4, odds: '', stake: '' },
  { id: 5, odds: '', stake: '' },
];

export default function Calculadora() {
  const [entries, setEntries] = useState<BetEntry[]>(INITIAL_ENTRIES);
  const [results, setResults] = useState({ totalStake: 0, totalPayout: 0, netProfit: 0 });
  const [hasCalculated, setHasCalculated] = useState(false);

  const updateEntry = useCallback((id: number, field: 'odds' | 'stake', value: string) => {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, [field]: value } : e))
    );
    setHasCalculated(false);
  }, []);

  const addEntry = useCallback(() => {
    if (entries.length < 10) {
      setEntries((prev) => [...prev, { id: Date.now(), odds: '', stake: '' }]);
      setHasCalculated(false);
    }
  }, [entries.length]);

  const removeEntry = useCallback(
    (id: number) => {
      if (entries.length > 2) {
        setEntries((prev) => prev.filter((e) => e.id !== id));
        setHasCalculated(false);
      }
    },
    [entries.length]
  );

  const calculate = useCallback(() => {
    let totalStake = 0;
    let totalOdds = 1;
    let validEntries = 0;

    entries.forEach((e) => {
      const odds = parseFloat(e.odds);
      const stake = parseFloat(e.stake);
      if (!isNaN(odds) && !isNaN(stake) && odds > 0 && stake > 0) {
        totalOdds *= odds;
        totalStake += stake;
        validEntries++;
      }
    });

    if (validEntries >= 2) {
      const totalPayout = totalStake * totalOdds;
      const netProfit = totalPayout - totalStake;
      setResults({ totalStake, totalPayout, netProfit });
      setHasCalculated(true);
    }
  }, [entries]);

  const clearAll = useCallback(() => {
    setEntries(INITIAL_ENTRIES.map((e) => ({ ...e, id: e.id })));
    setResults({ totalStake: 0, totalPayout: 0, netProfit: 0 });
    setHasCalculated(false);
  }, []);

  return (
    <div className="p-8 bg-[#F1F5F9] min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
          <Calculator size={20} className="text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#1E293B] mb-1">Calculadora Parlay</h1>
          <p className="text-[#475569]">Calculadora de parlay con hasta 10 entradas.</p>
        </div>
      </div>

      {/* Main Card */}
      <div className="max-w-3xl mx-auto bg-white border border-gray-200 shadow-xl rounded-xl overflow-hidden">
        {/* Input Rows */}
        <div className="p-6 space-y-3">
          {entries.map((entry, idx) => (
            <div
              key={entry.id}
              className="flex items-center gap-3 p-3 bg-[#F8FAFC] border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
            >
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-[#475569]">
                {idx + 1}
              </span>
              <div className="flex-1">
                <label className="block text-xs text-[#94A3B8] mb-1">Cuota (Odds)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Ej: 1.85"
                  value={entry.odds}
                  onChange={(e) => updateEntry(entry.id, 'odds', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-[#1E293B] placeholder:text-[#94A3B8] focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs text-[#94A3B8] mb-1">Apuesta ($)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Ej: 100"
                  value={entry.stake}
                  onChange={(e) => updateEntry(entry.id, 'stake', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-[#1E293B] placeholder:text-[#94A3B8] focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all"
                />
              </div>
              <button
                onClick={() => removeEntry(entry.id)}
                disabled={entries.length <= 2}
                className="p-2 rounded-md text-[#94A3B8] hover:text-red-500 hover:bg-red-50 disabled:opacity-30 transition-colors mt-5"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}

          {entries.length < 10 && (
            <button
              onClick={addEntry}
              className="w-full py-2 border-2 border-dashed border-gray-200 rounded-lg text-sm text-[#94A3B8] hover:border-blue-300 hover:text-blue-500 transition-colors"
            >
              + Agregar entrada ({entries.length}/10)
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="px-6 pb-4 flex gap-3">
          <button
            onClick={calculate}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg hover:shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all"
          >
            <TrendingUp size={18} />
            Calcular Parlay
          </button>
          <button
            onClick={clearAll}
            className="flex items-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Trash2 size={18} />
            Limpiar
          </button>
        </div>

        {/* Results Section */}
        <div
          className={`p-6 border-t transition-all ${
            hasCalculated
              ? 'bg-green-50 border-green-300'
              : 'bg-gray-50 border-gray-200'
          }`}
        >
          <h3 className="text-sm font-semibold text-[#475569] uppercase tracking-wider mb-4">
            Resultados
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className={`p-4 rounded-lg border transition-all ${hasCalculated ? 'bg-white border-green-200' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                <Wallet size={16} className="text-[#94A3B8]" />
                <span className="text-xs text-[#94A3B8] font-medium">Apuesta Total</span>
              </div>
              <p className="text-xl font-bold text-[#1E293B]">
                ${results.totalStake.toFixed(2)}
              </p>
            </div>
            <div className={`p-4 rounded-lg border transition-all ${hasCalculated ? 'bg-white border-green-200' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                <DollarSign size={16} className="text-green-500" />
                <span className="text-xs text-green-600 font-medium">Premio Total</span>
              </div>
              <p className="text-xl font-bold text-green-600">
                ${results.totalPayout.toFixed(2)}
              </p>
            </div>
            <div className={`p-4 rounded-lg border transition-all ${hasCalculated ? 'bg-white border-green-200' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={16} className="text-blue-500" />
                <span className="text-xs text-blue-600 font-medium">Pago Neto</span>
              </div>
              <p className="text-xl font-bold text-blue-600">
                ${results.netProfit.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
