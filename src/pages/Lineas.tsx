import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Printer,
  RefreshCw,
  Grid3X3,
} from 'lucide-react';
import { fetchStoredGames, type StoredGame } from '@/lib/sportsApi';

/* ---------- filters ---------- */
// Deportes que sí trae la automatización (SPORT_MAP en scripts/fetch-odds.mjs).
// NFL/CFL no tienen fuente de datos todavía — se muestran vacíos si se agregan aquí.
const SPORTS = ['MLB', 'NBA', 'WNBA', 'Soccer'];

const PERIODS = ['Juego Completo'];

/* ---------- easing ---------- */
const easeSpring = [0.16, 1, 0.3, 1] as [number, number, number, number];

const containerAnim = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemAnim = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: easeSpring } },
};

/* ---------- helpers ---------- */
function OddsCell({ value }: { value: number }) {
  const isPositive = value >= 0;
  return (
    <button
      className={`inline-block px-2 py-1 rounded text-mono font-medium transition-all hover:bg-accent-blue/10 hover:text-accent-blue-bright cursor-pointer ${
        isPositive ? 'text-accent-green' : 'text-accent-red'
      }`}
    >
      {isPositive ? `+${value}` : value}
    </button>
  );
}

function SpreadCell({ value, price }: { value: string; price: number }) {
  return (
    <button className="inline-flex items-center gap-1 px-2 py-1 rounded transition-all hover:bg-accent-blue/10 cursor-pointer group">
      <span className="text-mono font-medium text-text-primary group-hover:text-accent-blue-bright">{value}</span>
      <span className="text-mono text-text-tertiary text-xs group-hover:text-accent-blue">{price}</span>
    </button>
  );
}

function TotalCell({ points, overPrice, underPrice }: { points: number; overPrice: number; underPrice: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs md:text-sm font-mono text-text-primary font-medium">{points.toFixed(1)}</span>
      <button className="px-2 py-1 min-h-[44px] min-w-[60px] rounded text-xs font-mono text-accent-green transition-all hover:bg-accent-green/10 cursor-pointer flex items-center justify-center">
        O {overPrice}
      </button>
      <button className="px-2 py-1 min-h-[44px] min-w-[60px] rounded text-xs font-mono text-accent-red transition-all hover:bg-accent-red/10 cursor-pointer flex items-center justify-center">
        U {underPrice}
      </button>
    </div>
  );
}

function EmptyCell() {
  return <span className="text-xs text-text-muted">—</span>;
}

/* ---------- page ---------- */
export default function Lineas() {
  const [activeSport, setActiveSport] = useState('MLB');
  const [activePeriod, setActivePeriod] = useState('Juego Completo');
  const [gamesBySport, setGamesBySport] = useState<Record<string, StoredGame[]>>({});
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errored, setErrored] = useState(false);

  const load = useCallback(async () => {
    const file = await fetchStoredGames();
    if (file) {
      setGamesBySport(file.games || {});
      setLastUpdated(new Date(file.last_updated));
      setErrored(false);
    } else {
      setErrored(true);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const lines = gamesBySport[activeSport] || [];

  return (
    <motion.div
      variants={containerAnim}
      initial="hidden"
      animate="show"
      className="px-4 md:px-6 lg:px-8 py-5 space-y-4"
    >
      {/* ====== Page Header ====== */}
      <motion.div variants={itemAnim} className="border-b border-border-subtle pb-4">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-semibold text-text-primary">Lineas de Apuesta</h1>
        <p className="text-sm text-text-tertiary mt-1">Juegos del día — actualizado por la automatización diaria</p>
      </motion.div>

      {/* ====== Sport Filter Pills ====== */}
      <motion.div
        variants={itemAnim}
        className="flex gap-2 overflow-x-auto flex-nowrap pb-2 border-b border-border-subtle -mx-4 px-4 md:mx-0 md:px-0"
      >
        {SPORTS.map((sport) => (
          <button
            key={sport}
            onClick={() => setActiveSport(sport)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
              activeSport === sport
                ? 'bg-accent-blue/15 text-accent-blue border border-accent-blue/30'
                : 'text-text-muted hover:text-text-secondary hover:bg-white/5 border border-transparent'
            }`}
          >
            {sport}
          </button>
        ))}
      </motion.div>

      {/* ====== Period Sub-Tabs ====== */}
      <motion.div
        variants={itemAnim}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-border-subtle pb-2 gap-2"
      >
        <div className="flex gap-1 overflow-x-auto flex-nowrap -mx-4 px-4 md:mx-0 md:px-0 pb-1">
          {PERIODS.map((period) => (
            <button
              key={period}
              onClick={() => setActivePeriod(period)}
              className={`px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all duration-200 border-b-2 ${
                activePeriod === period
                  ? 'text-accent-blue border-accent-blue'
                  : 'text-text-muted border-transparent hover:text-text-secondary'
              }`}
            >
              {period}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 ml-4">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-accent-blue/10 text-accent-blue text-xs font-semibold border border-accent-blue/25 hover:bg-accent-blue/20 transition-all">
            <Grid3X3 size={14} /> TODAS
          </button>
          <button
            onClick={handleRefresh}
            className={`p-1.5 rounded-md bg-bg-tertiary text-text-secondary border border-border-default hover:bg-bg-quaternary transition-all ${
              refreshing ? 'animate-spin-once' : ''
            }`}
          >
            <RefreshCw size={14} />
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-bg-tertiary text-text-secondary text-xs font-semibold border border-border-default hover:bg-bg-quaternary transition-all">
            <Printer size={14} /> Imprimir
          </button>
        </div>
      </motion.div>

      {/* ====== Toolbar ====== */}
      <motion.div variants={itemAnim} className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${errored ? 'bg-accent-red' : 'bg-accent-green animate-pulse'}`} />
          <span className="text-xs text-text-tertiary font-mono">
            {errored
              ? 'No se pudo cargar la automatización'
              : lastUpdated
              ? `Actualizado: ${lastUpdated.toLocaleString()}`
              : 'Cargando...'}
          </span>
        </div>
        <span className="text-xs text-text-muted">
          {lines.length} juegos disponibles
        </span>
      </motion.div>

      {/* ====== Lines Table ====== */}
      {loading ? (
        <motion.div variants={itemAnim} className="flex items-center justify-center py-16">
          <RefreshCw size={20} className="animate-spin text-text-muted" />
        </motion.div>
      ) : lines.length > 0 ? (
        <motion.div variants={itemAnim} className="space-y-3">
          {lines.map((game) => {
            const ml = game.odds.ml;
            const rl = game.odds.rl;
            const ou = game.odds.ou?.[0];
            return (
              <div
                key={game.id}
                className="gradient-card rounded-lg border border-border-subtle overflow-hidden"
              >
                {/* Card Header */}
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-border-subtle bg-bg-secondary/40">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-text-primary">{game.away.name}</span>
                    <span className="text-xs text-text-tertiary">@</span>
                    <span className="text-sm font-semibold text-text-primary">{game.home.name}</span>
                  </div>
                  <span className="text-sm font-mono text-text-tertiary">{game.time}</span>
                </div>

                {/* Lines Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-bg-secondary/60">
                        <th className="px-3 py-2 text-left text-[10px] text-text-tertiary font-semibold uppercase tracking-wider w-16">Hora</th>
                        <th className="px-3 py-2 text-left text-[10px] text-text-tertiary font-semibold uppercase tracking-wider">Equipo</th>
                        <th className="px-3 py-2 text-center text-[10px] text-text-tertiary font-semibold uppercase tracking-wider">
                          A juego <span className="text-text-muted normal-case">(Gavela)</span>
                        </th>
                        <th className="px-3 py-2 text-center text-[10px] text-text-tertiary font-semibold uppercase tracking-wider">Al ML</th>
                        <th className="px-3 py-2 text-center text-[10px] text-text-tertiary font-semibold uppercase tracking-wider">
                          Total Combinado
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Away Team Row */}
                      <tr className="border-b border-border-subtle hover:bg-white/[0.03] transition-colors">
                        <td className="px-3 py-2 text-xs font-mono text-text-tertiary">{game.time}</td>
                        <td className="px-3 py-2">
                          <span className="text-sm font-semibold text-text-primary">{game.away.name}</span>
                        </td>
                        <td className="px-3 py-2 text-center">
                          {rl ? <SpreadCell value={rl[0].line} price={rl[0].odds} /> : <EmptyCell />}
                        </td>
                        <td className="px-3 py-2 text-center">
                          {ml ? <OddsCell value={ml[0]} /> : <EmptyCell />}
                        </td>
                        <td className="px-3 py-2" rowSpan={2}>
                          {ou ? (
                            <TotalCell points={ou.line} overPrice={ou.over} underPrice={ou.under} />
                          ) : (
                            <EmptyCell />
                          )}
                        </td>
                      </tr>
                      {/* Home Team Row */}
                      <tr className="hover:bg-white/[0.03] transition-colors">
                        <td className="px-3 py-2" />
                        <td className="px-3 py-2">
                          <span className="text-sm font-semibold text-text-primary">{game.home.name}</span>
                        </td>
                        <td className="px-3 py-2 text-center">
                          {rl ? <SpreadCell value={rl[1].line} price={rl[1].odds} /> : <EmptyCell />}
                        </td>
                        <td className="px-3 py-2 text-center">
                          {ml ? <OddsCell value={ml[1]} /> : <EmptyCell />}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </motion.div>
      ) : (
        <motion.div variants={itemAnim} className="flex flex-col items-center justify-center py-16">
          <div className="w-16 h-16 rounded-full bg-bg-tertiary flex items-center justify-center mb-4">
            <Grid3X3 size={32} className="text-text-muted/30" />
          </div>
          <p className="text-body-lg text-text-tertiary">No hay lineas disponibles</p>
          <p className="text-sm text-text-muted mt-1">
            {errored ? 'Revisa que el workflow diario esté subiendo datos correctamente.' : 'Seleccione otro deporte'}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
