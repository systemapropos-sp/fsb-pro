import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Printer,
  RefreshCw,
  Grid3X3,
} from 'lucide-react';
import { formatTime } from '@/lib/storage';

/* ---------- types ---------- */
interface LineRow {
  id: string;
  sport: string;
  period: string;
  time: string;
  awayCode: string;
  awayTeam: string;
  homeCode: string;
  homeTeam: string;
  /* A juego (spread) */
  spreadAway: string;
  spreadHome: string;
  spreadPrice: number;
  /* Money line */
  mlAway: number;
  mlHome: number;
  /* Total combinado */
  totalPoints: number;
  totalOverPrice: number;
  totalUnderPrice: number;
  /* Equipo solo (team total) */
  awayTeamPoints: number;
  homeTeamPoints: number;
  awayTeamOverPrice: number;
  awayTeamUnderPrice: number;
  homeTeamOverPrice: number;
  homeTeamUnderPrice: number;
}

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

/* ---------- filters ---------- */
const SPORTS = ['NBA', 'MLB', 'NFL', 'WNBA', 'CFL', 'Soccer'];

const PERIODS = [
  'Juego Completo',
  'Primera Mitad',
  'Segunda Mitad',
  'Periodo #1',
  'Periodo #2',
  'Periodo #3',
  'Periodo #4',
  'Resumen',
];

/* ---------- mock data ---------- */
const MOCK_LINES: LineRow[] = [
  {
    id: 'line-nba-1',
    sport: 'NBA', period: 'Juego Completo',
    time: '08:30 PM',
    awayCode: 'NYK', awayTeam: 'New York Knicks',
    homeCode: 'SAS', homeTeam: 'San Antonio Spurs',
    spreadAway: '+6.5', spreadHome: '-6.5', spreadPrice: -110,
    mlAway: 185, mlHome: -230,
    totalPoints: 215.0, totalOverPrice: -110, totalUnderPrice: -110,
    awayTeamPoints: 104.5, homeTeamPoints: 110.5,
    awayTeamOverPrice: -120, awayTeamUnderPrice: -120,
    homeTeamOverPrice: -115, homeTeamUnderPrice: -115,
  },
  {
    id: 'line-nba-2',
    sport: 'NBA', period: 'Juego Completo',
    time: '07:00 PM',
    awayCode: 'LAL', awayTeam: 'Los Angeles Lakers',
    homeCode: 'GSW', homeTeam: 'Golden State Warriors',
    spreadAway: '+3.5', spreadHome: '-3.5', spreadPrice: -110,
    mlAway: 135, mlHome: -165,
    totalPoints: 228.5, totalOverPrice: -110, totalUnderPrice: -110,
    awayTeamPoints: 112.0, homeTeamPoints: 116.5,
    awayTeamOverPrice: -125, awayTeamUnderPrice: -115,
    homeTeamOverPrice: -120, homeTeamUnderPrice: -120,
  },
  {
    id: 'line-nba-3',
    sport: 'NBA', period: 'Juego Completo',
    time: '09:00 PM',
    awayCode: 'BOS', awayTeam: 'Boston Celtics',
    homeCode: 'MIA', homeTeam: 'Miami Heat',
    spreadAway: '-4.5', spreadHome: '+4.5', spreadPrice: -110,
    mlAway: -190, mlHome: 155,
    totalPoints: 218.0, totalOverPrice: -110, totalUnderPrice: -110,
    awayTeamPoints: 111.5, homeTeamPoints: 106.5,
    awayTeamOverPrice: -115, awayTeamUnderPrice: -125,
    homeTeamOverPrice: -120, homeTeamUnderPrice: -120,
  },
  {
    id: 'line-nba-4',
    sport: 'NBA', period: 'Juego Completo',
    time: '08:00 PM',
    awayCode: 'PHX', awayTeam: 'Phoenix Suns',
    homeCode: 'DEN', homeTeam: 'Denver Nuggets',
    spreadAway: '+5.0', spreadHome: '-5.0', spreadPrice: -110,
    mlAway: 175, mlHome: -220,
    totalPoints: 224.5, totalOverPrice: -110, totalUnderPrice: -110,
    awayTeamPoints: 109.5, homeTeamPoints: 115.0,
    awayTeamOverPrice: -120, awayTeamUnderPrice: -120,
    homeTeamOverPrice: -115, homeTeamUnderPrice: -125,
  },
  {
    id: 'line-nba-5',
    sport: 'NBA', period: 'Juego Completo',
    time: '07:30 PM',
    awayCode: 'DAL', awayTeam: 'Dallas Mavericks',
    homeCode: 'LAC', homeTeam: 'LA Clippers',
    spreadAway: '+2.5', spreadHome: '-2.5', spreadPrice: -110,
    mlAway: 120, mlHome: -145,
    totalPoints: 221.0, totalOverPrice: -110, totalUnderPrice: -110,
    awayTeamPoints: 108.5, homeTeamPoints: 112.5,
    awayTeamOverPrice: -125, awayTeamUnderPrice: -115,
    homeTeamOverPrice: -120, homeTeamUnderPrice: -120,
  },
  {
    id: 'line-nba-6',
    sport: 'NBA', period: 'Juego Completo',
    time: '06:00 PM',
    awayCode: 'MIL', awayTeam: 'Milwaukee Bucks',
    homeCode: 'PHI', homeTeam: 'Philadelphia 76ers',
    spreadAway: '-3.0', spreadHome: '+3.0', spreadPrice: -110,
    mlAway: -155, mlHome: 130,
    totalPoints: 219.5, totalOverPrice: -110, totalUnderPrice: -110,
    awayTeamPoints: 112.0, homeTeamPoints: 107.5,
    awayTeamOverPrice: -120, awayTeamUnderPrice: -120,
    homeTeamOverPrice: -120, homeTeamUnderPrice: -120,
  },
];

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

function PriceCell({ value }: { value: number }) {
  return (
    <button className="inline-block px-2 py-1 rounded text-mono text-text-secondary transition-all hover:bg-accent-blue/10 hover:text-accent-blue-bright cursor-pointer">
      {value}
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
      <span className="text-mono text-text-primary font-medium">{points.toFixed(1)}</span>
      <button className="px-2 py-0.5 rounded text-xs font-mono text-accent-green transition-all hover:bg-accent-green/10 cursor-pointer">
        O {overPrice}
      </button>
      <button className="px-2 py-0.5 rounded text-xs font-mono text-accent-red transition-all hover:bg-accent-red/10 cursor-pointer">
        U {underPrice}
      </button>
    </div>
  );
}

function TeamTotalCell({ points, overPrice, underPrice }: { points: number; overPrice: number; underPrice: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-mono text-text-secondary">{points.toFixed(1)}</span>
      <div className="flex flex-col gap-0.5">
        <button className="px-1.5 py-0 rounded text-[10px] font-mono text-accent-green transition-all hover:bg-accent-green/10 cursor-pointer leading-tight">
          O {overPrice}
        </button>
        <button className="px-1.5 py-0 rounded text-[10px] font-mono text-accent-red transition-all hover:bg-accent-red/10 cursor-pointer leading-tight">
          U {underPrice}
        </button>
      </div>
    </div>
  );
}

/* ---------- page ---------- */
export default function Lineas() {
  const [activeSport, setActiveSport] = useState('NBA');
  const [activePeriod, setActivePeriod] = useState('Juego Completo');
  const [lines, setLines] = useState<LineRow[]>([]);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Filter mock lines by sport (period filter is visual only for demo)
    const filtered = MOCK_LINES.filter((l) => l.sport === activeSport);
    setLines(filtered.length > 0 ? filtered : []);
  }, [activeSport, activePeriod]);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setLastUpdated(new Date());
      setRefreshing(false);
    }, 500);
  };

  return (
    <motion.div
      variants={containerAnim}
      initial="hidden"
      animate="show"
      className="px-6 py-5 space-y-4"
    >
      {/* ====== Page Header ====== */}
      <motion.div variants={itemAnim} className="border-b border-border-subtle pb-4">
        <h1 className="text-h2 text-text-primary">Lineas de Apuesta</h1>
        <p className="text-sm text-text-tertiary mt-1">Todas las lineas disponibles por deporte</p>
      </motion.div>

      {/* ====== Sport Filter Pills ====== */}
      <motion.div
        variants={itemAnim}
        className="flex gap-2 overflow-x-auto pb-2 border-b border-border-subtle"
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
        className="flex items-center justify-between border-b border-border-subtle pb-2"
      >
        <div className="flex gap-1 overflow-x-auto">
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
          {/* TODAS button */}
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
          <div className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse" />
          <span className="text-xs text-text-tertiary font-mono">
            Actualizado: {formatTime(lastUpdated)}
          </span>
        </div>
        <span className="text-xs text-text-muted">
          {lines.length} juegos disponibles
        </span>
      </motion.div>

      {/* ====== Lines Table ====== */}
      {lines.length > 0 ? (
        <motion.div variants={itemAnim} className="space-y-3">
          {lines.map((game) => (
            <div
              key={game.id}
              className="gradient-card rounded-lg border border-border-subtle overflow-hidden"
            >
              {/* Card Header */}
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-border-subtle bg-bg-secondary/40">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-text-primary">{game.awayTeam}</span>
                  <span className="text-xs text-text-tertiary">@</span>
                  <span className="text-sm font-semibold text-text-primary">{game.homeTeam}</span>
                </div>
                <span className="text-sm font-mono text-text-tertiary">{game.time}</span>
              </div>

              {/* Lines Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-bg-secondary/60">
                      <th className="px-3 py-2 text-left text-[10px] text-text-tertiary font-semibold uppercase tracking-wider w-16">Hora</th>
                      <th className="px-3 py-2 text-left text-[10px] text-text-tertiary font-semibold uppercase tracking-wider w-20">Codigo</th>
                      <th className="px-3 py-2 text-left text-[10px] text-text-tertiary font-semibold uppercase tracking-wider">Equipo</th>
                      <th className="px-3 py-2 text-center text-[10px] text-text-tertiary font-semibold uppercase tracking-wider">
                        A juego <span className="text-text-muted normal-case">(Gavela)</span>
                      </th>
                      <th className="px-3 py-2 text-center text-[10px] text-text-tertiary font-semibold uppercase tracking-wider">Precio</th>
                      <th className="px-3 py-2 text-center text-[10px] text-text-tertiary font-semibold uppercase tracking-wider">Al ML</th>
                      <th className="px-3 py-2 text-center text-[10px] text-text-tertiary font-semibold uppercase tracking-wider">
                        Total Combinado
                      </th>
                      <th className="px-3 py-2 text-center text-[10px] text-text-tertiary font-semibold uppercase tracking-wider">Puntos</th>
                      <th className="px-3 py-2 text-center text-[10px] text-text-tertiary font-semibold uppercase tracking-wider">
                        Precio a mas
                      </th>
                      <th className="px-3 py-2 text-center text-[10px] text-text-tertiary font-semibold uppercase tracking-wider">
                        Precio a menos
                      </th>
                      <th className="px-3 py-2 text-center text-[10px] text-text-tertiary font-semibold uppercase tracking-wider">
                        Equipo solo
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Away Team Row */}
                    <tr className="border-b border-border-subtle hover:bg-white/[0.03] transition-colors">
                      <td className="px-3 py-2 text-xs font-mono text-text-tertiary">{game.time}</td>
                      <td className="px-3 py-2 text-xs font-mono text-accent-blue">2003</td>
                      <td className="px-3 py-2">
                        <span className="text-sm font-semibold text-text-primary">{game.awayTeam}</span>
                        <span className="ml-2 text-xs text-text-muted">({game.awayCode})</span>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <SpreadCell value={game.spreadAway} price={game.spreadPrice} />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <PriceCell value={game.spreadPrice} />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <OddsCell value={game.mlAway} />
                      </td>
                      <td className="px-3 py-2" rowSpan={2}>
                        <TotalCell
                          points={game.totalPoints}
                          overPrice={game.totalOverPrice}
                          underPrice={game.totalUnderPrice}
                        />
                      </td>
                      <td className="px-3 py-2 text-center text-mono text-text-primary">{game.awayTeamPoints.toFixed(1)}</td>
                      <td className="px-3 py-2 text-center">
                        <PriceCell value={game.awayTeamOverPrice} />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <PriceCell value={game.awayTeamUnderPrice} />
                      </td>
                      <td className="px-3 py-2">
                        <TeamTotalCell
                          points={game.awayTeamPoints}
                          overPrice={game.awayTeamOverPrice}
                          underPrice={game.awayTeamUnderPrice}
                        />
                      </td>
                    </tr>
                    {/* Home Team Row */}
                    <tr className="hover:bg-white/[0.03] transition-colors">
                      <td className="px-3 py-2" />
                      <td className="px-3 py-2 text-xs font-mono text-accent-blue">2016</td>
                      <td className="px-3 py-2">
                        <span className="text-sm font-semibold text-text-primary">{game.homeTeam}</span>
                        <span className="ml-2 text-xs text-text-muted">({game.homeCode})</span>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <SpreadCell value={game.spreadHome} price={game.spreadPrice} />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <PriceCell value={game.spreadPrice} />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <OddsCell value={game.mlHome} />
                      </td>
                      <td className="px-3 py-2 text-center text-mono text-text-primary">{game.homeTeamPoints.toFixed(1)}</td>
                      <td className="px-3 py-2 text-center">
                        <PriceCell value={game.homeTeamOverPrice} />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <PriceCell value={game.homeTeamUnderPrice} />
                      </td>
                      <td className="px-3 py-2">
                        <TeamTotalCell
                          points={game.homeTeamPoints}
                          overPrice={game.homeTeamOverPrice}
                          underPrice={game.homeTeamUnderPrice}
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </motion.div>
      ) : (
        <motion.div variants={itemAnim} className="flex flex-col items-center justify-center py-16">
          <div className="w-16 h-16 rounded-full bg-bg-tertiary flex items-center justify-center mb-4">
            <Grid3X3 size={32} className="text-text-muted/30" />
          </div>
          <p className="text-body-lg text-text-tertiary">No hay lineas disponibles</p>
          <p className="text-sm text-text-muted mt-1">Seleccione otro deporte o periodo</p>
          <p className="text-xs text-text-muted mt-0.5">Las lineas se actualizan periodicamente</p>
        </motion.div>
      )}
    </motion.div>
  );
}
