import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Filter,
  Printer,
  MapPin,
  User,
  Trophy,
  CircleDot,
} from 'lucide-react';
import { formatDate } from '@/lib/storage';

/* ---------- types ---------- */
interface InningScore {
  inning: number;
  away: number;
  home: number;
}

interface GameResult {
  id: string;
  sport: string;
  awayTeam: string;
  awayCode: string;
  homeTeam: string;
  homeCode: string;
  time: string;
  status: 'Final' | 'En Vivo' | 'Pendiente';
  inning?: string;
  outs?: number;
  innings: InningScore[];
  awayTotals: { R: number; H: number; E: number };
  homeTotals: { R: number; H: number; E: number };
  pitcherAway?: string;
  pitcherHome?: string;
  stadium?: string;
  lastPlay?: string;
}

/* ---------- easing ---------- */
const easeSpring = [0.16, 1, 0.3, 1] as [number, number, number, number];

const containerAnim = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemAnim = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: easeSpring } },
};

/* ---------- sports ---------- */
const SPORTS = ['MLB', 'NBA', 'NFL', 'WNBA', 'CFL', 'Soccer', 'Loteria'];

/* ---------- mock data ---------- */
const MOCK_GAMES: GameResult[] = [
  {
    id: 'game-1',
    sport: 'MLB',
    awayTeam: 'Giants', awayCode: 'SF',
    homeTeam: 'Cubs', homeCode: 'CHC',
    time: '02:20 PM',
    status: 'Final',
    pitcherAway: 'R Ray', pitcherHome: 'S Steele',
    stadium: 'Wrigley Field',
    innings: [
      { inning: 1, away: 1, home: 0 },
      { inning: 2, away: 0, home: 2 },
      { inning: 3, away: 2, home: 0 },
      { inning: 4, away: 0, home: 0 },
      { inning: 5, away: 1, home: 1 },
      { inning: 6, away: 0, home: 0 },
      { inning: 7, away: 3, home: 0 },
      { inning: 8, away: 0, home: 0 },
      { inning: 9, away: 0, home: 1 },
    ],
    awayTotals: { R: 7, H: 11, E: 0 },
    homeTotals: { R: 4, H: 7, E: 1 },
  },
  {
    id: 'game-2',
    sport: 'MLB',
    awayTeam: 'Mariners', awayCode: 'SEA',
    homeTeam: 'Tigers', homeCode: 'DET',
    time: '04:10 PM',
    status: 'Final',
    pitcherAway: 'L Castillo', pitcherHome: 'T Skubal',
    stadium: 'Comerica Park',
    innings: [
      { inning: 1, away: 0, home: 0 },
      { inning: 2, away: 0, home: 0 },
      { inning: 3, away: 2, home: 0 },
      { inning: 4, away: 1, home: 1 },
      { inning: 5, away: 0, home: 0 },
      { inning: 6, away: 0, home: 3 },
      { inning: 7, away: 0, home: 0 },
      { inning: 8, away: 1, home: 0 },
      { inning: 9, away: 0, home: 0 },
    ],
    awayTotals: { R: 4, H: 9, E: 0 },
    homeTotals: { R: 4, H: 8, E: 1 },
  },
  {
    id: 'game-3',
    sport: 'MLB',
    awayTeam: 'White Sox', awayCode: 'CWS',
    homeTeam: 'Phillies', homeCode: 'PHI',
    time: '06:05 PM',
    status: 'En Vivo',
    inning: '7mo inning', outs: 2,
    pitcherAway: 'D Cease', pitcherHome: 'Z Wheeler',
    stadium: 'Citizens Bank Park',
    lastPlay: 'Home run by Schwarber, 2 RBI',
    innings: [
      { inning: 1, away: 0, home: 1 },
      { inning: 2, away: 1, home: 0 },
      { inning: 3, away: 0, home: 2 },
      { inning: 4, away: 0, home: 0 },
      { inning: 5, away: 2, home: 0 },
      { inning: 6, away: 0, home: 3 },
      { inning: 7, away: 0, home: 0 },
      { inning: 8, away: 0, home: 0 },
      { inning: 9, away: 0, home: 0 },
    ],
    awayTotals: { R: 3, H: 6, E: 2 },
    homeTotals: { R: 6, H: 10, E: 0 },
  },
  {
    id: 'game-4',
    sport: 'MLB',
    awayTeam: 'Red Sox', awayCode: 'BOS',
    homeTeam: 'Yankees', homeCode: 'NYY',
    time: '07:05 PM',
    status: 'Pendiente',
    pitcherAway: 'B Bello', pitcherHome: 'G Cole',
    stadium: 'Yankee Stadium',
    innings: [
      { inning: 1, away: 0, home: 0 },
      { inning: 2, away: 0, home: 0 },
      { inning: 3, away: 0, home: 0 },
      { inning: 4, away: 0, home: 0 },
      { inning: 5, away: 0, home: 0 },
      { inning: 6, away: 0, home: 0 },
      { inning: 7, away: 0, home: 0 },
      { inning: 8, away: 0, home: 0 },
      { inning: 9, away: 0, home: 0 },
    ],
    awayTotals: { R: 0, H: 0, E: 0 },
    homeTotals: { R: 0, H: 0, E: 0 },
  },
  {
    id: 'game-5',
    sport: 'MLB',
    awayTeam: 'Orioles', awayCode: 'BAL',
    homeTeam: 'Blue Jays', homeCode: 'TOR',
    time: '07:07 PM',
    status: 'Pendiente',
    pitcherAway: 'C Burnes', pitcherHome: 'K Gausman',
    stadium: 'Rogers Centre',
    innings: [
      { inning: 1, away: 0, home: 0 },
      { inning: 2, away: 0, home: 0 },
      { inning: 3, away: 0, home: 0 },
      { inning: 4, away: 0, home: 0 },
      { inning: 5, away: 0, home: 0 },
      { inning: 6, away: 0, home: 0 },
      { inning: 7, away: 0, home: 0 },
      { inning: 8, away: 0, home: 0 },
      { inning: 9, away: 0, home: 0 },
    ],
    awayTotals: { R: 0, H: 0, E: 0 },
    homeTotals: { R: 0, H: 0, E: 0 },
  },
  {
    id: 'game-6',
    sport: 'MLB',
    awayTeam: 'Rays', awayCode: 'TB',
    homeTeam: 'Marlins', homeCode: 'MIA',
    time: '06:40 PM',
    status: 'Final',
    pitcherAway: 'Z Littell', pitcherHome: 'J Luzardo',
    stadium: 'LoanDepot Park',
    innings: [
      { inning: 1, away: 0, home: 0 },
      { inning: 2, away: 0, home: 1 },
      { inning: 3, away: 1, home: 0 },
      { inning: 4, away: 0, home: 0 },
      { inning: 5, away: 0, home: 0 },
      { inning: 6, away: 2, home: 0 },
      { inning: 7, away: 0, home: 1 },
      { inning: 8, away: 1, home: 0 },
      { inning: 9, away: 0, home: 0 },
    ],
    awayTotals: { R: 4, H: 8, E: 1 },
    homeTotals: { R: 2, H: 5, E: 0 },
  },
  {
    id: 'game-7',
    sport: 'MLB',
    awayTeam: 'Pirates', awayCode: 'PIT',
    homeTeam: 'Braves', homeCode: 'ATL',
    time: '07:20 PM',
    status: 'Final',
    pitcherAway: 'M Keller', pitcherHome: 'M Fried',
    stadium: 'Truist Park',
    innings: [
      { inning: 1, away: 0, home: 2 },
      { inning: 2, away: 0, home: 1 },
      { inning: 3, away: 1, home: 0 },
      { inning: 4, away: 0, home: 3 },
      { inning: 5, away: 2, home: 0 },
      { inning: 6, away: 0, home: 1 },
      { inning: 7, away: 0, home: 0 },
      { inning: 8, away: 1, home: 0 },
      { inning: 9, away: 0, home: 0 },
    ],
    awayTotals: { R: 4, H: 9, E: 0 },
    homeTotals: { R: 7, H: 12, E: 0 },
  },
  {
    id: 'game-8',
    sport: 'MLB',
    awayTeam: 'Athletics', awayCode: 'OAK',
    homeTeam: 'Astros', homeCode: 'HOU',
    time: '08:10 PM',
    status: 'En Vivo',
    inning: '5to inning', outs: 1,
    pitcherAway: 'P Blackburn', pitcherHome: 'F Valdez',
    stadium: 'Minute Maid Park',
    lastPlay: 'Double by Alvarez, 1 RBI',
    innings: [
      { inning: 1, away: 0, home: 0 },
      { inning: 2, away: 1, home: 2 },
      { inning: 3, away: 0, home: 1 },
      { inning: 4, away: 0, home: 0 },
      { inning: 5, away: 0, home: 0 },
      { inning: 6, away: 0, home: 0 },
      { inning: 7, away: 0, home: 0 },
      { inning: 8, away: 0, home: 0 },
      { inning: 9, away: 0, home: 0 },
    ],
    awayTotals: { R: 1, H: 3, E: 0 },
    homeTotals: { R: 3, H: 6, E: 0 },
  },
];

/* ---------- helpers ---------- */
const statusBadge = (status: GameResult['status']) => {
  switch (status) {
    case 'Final':
      return 'bg-accent-green/15 text-accent-green border border-accent-green/30';
    case 'En Vivo':
      return 'bg-accent-red/15 text-accent-red border border-accent-red/30 animate-pulse';
    case 'Pendiente':
      return 'bg-accent-amber/15 text-accent-amber border border-accent-amber/30';
  }
};

/* ---------- scoreboard cell ---------- */
function ScoreCell({ value, highlight }: { value: number; highlight?: boolean }) {
  return (
    <td
      className={`w-8 text-center text-sm font-semibold text-text-primary py-1.5 ${
        highlight ? 'bg-accent-blue/10 rounded-sm' : ''
      } ${value > 0 ? 'text-text-primary' : 'text-text-muted'}`}
    >
      {value}
    </td>
  );
}

/* ---------- game card ---------- */
function GameCard({ game }: { game: GameResult }) {
  const isLive = game.status === 'En Vivo';
  const innings = game.innings;

  return (
    <div className="gradient-card rounded-lg border border-border-subtle overflow-hidden">
      {/* Card Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle">
        <div className="flex items-center gap-2">
          <span className="text-base md:text-lg font-semibold text-text-primary">
            {game.awayTeam} <span className="text-text-tertiary text-sm font-normal">vs</span> {game.homeTeam}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-mono text-text-tertiary">{game.time}</span>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusBadge(game.status)}`}>
            {isLive && <CircleDot size={12} className="animate-pulse" />}
            {game.status === 'En Vivo' ? 'En Vivo' : game.status}
          </span>
        </div>
      </div>

      {/* Live info */}
      {isLive && (
        <div className="px-4 py-2 bg-accent-red/5 border-b border-border-subtle flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-accent-red animate-pulse" />
            <span className="text-xs text-accent-red font-medium">{game.inning}, {game.outs} outs</span>
          </div>
          {game.lastPlay && (
            <span className="text-xs text-accent-amber">{game.lastPlay}</span>
          )}
        </div>
      )}

      {/* Scoreboard */}
      <div className="px-4 py-3 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="w-12 text-left text-xs text-text-tertiary font-medium" />
              {innings.map((inn) => (
                <th key={inn.inning} className="w-8 text-center text-xs text-text-tertiary font-medium">
                  {inn.inning}
                </th>
              ))}
              <th className="w-4 text-center text-xs text-text-muted font-medium">|</th>
              <th className="w-8 text-center text-xs text-text-primary font-bold">R</th>
              <th className="w-8 text-center text-xs text-text-primary font-bold">H</th>
              <th className="w-8 text-center text-xs text-text-primary font-bold">E</th>
            </tr>
          </thead>
          <tbody>
            {/* Away row */}
            <tr>
              <td className="text-xs md:text-sm font-semibold text-text-primary py-1.5">{game.awayCode}</td>
              {innings.map((inn, i) => (
                <ScoreCell
                  key={`a-${i}`}
                  value={inn.away}
                  highlight={isLive && game.inning?.includes(inn.inning.toString())}
                />
              ))}
              <td className="text-center text-xs text-text-muted">|</td>
              <td className="text-center text-xs md:text-sm font-bold text-text-primary">{game.awayTotals.R}</td>
              <td className="text-center text-xs md:text-sm text-text-secondary">{game.awayTotals.H}</td>
              <td className="text-center text-sm text-text-secondary">{game.awayTotals.E}</td>
            </tr>
            {/* Home row */}
            <tr>
              <td className="text-sm font-semibold text-text-primary py-1.5">{game.homeCode}</td>
              {innings.map((inn, i) => (
                <ScoreCell
                  key={`h-${i}`}
                  value={inn.home}
                  highlight={isLive && game.inning?.includes(inn.inning.toString())}
                />
              ))}
              <td className="text-center text-xs text-text-muted">|</td>
              <td className="text-center text-sm font-bold text-text-primary">{game.homeTotals.R}</td>
              <td className="text-center text-sm text-text-secondary">{game.homeTotals.H}</td>
              <td className="text-center text-sm text-text-secondary">{game.homeTotals.E}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Pitcher & Stadium info */}
      <div className="px-4 py-2.5 border-t border-border-subtle flex items-center gap-6">
        <div className="flex items-center gap-1.5">
          <User size={12} className="text-text-tertiary" />
          <span className="text-xs text-text-secondary">
            {game.pitcherAway} ({game.awayCode}) <span className="text-text-muted">vs</span> {game.pitcherHome} ({game.homeCode})
          </span>
        </div>
        {game.stadium && (
          <div className="flex items-center gap-1.5">
            <MapPin size={12} className="text-text-tertiary" />
            <span className="text-xs text-text-tertiary">{game.stadium}</span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- page ---------- */
export default function Resultados() {
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
  const [activeSport, setActiveSport] = useState('MLB');

  const filteredGames = MOCK_GAMES.filter((g) => g.sport === activeSport);

  return (
    <motion.div
      variants={containerAnim}
      initial="hidden"
      animate="show"
      className="px-4 md:px-6 lg:px-8 py-5 space-y-5"
    >
      {/* ====== Page Header ====== */}
      <motion.div variants={itemAnim} className="border-b border-border-subtle pb-4">
        <h1 className="text-h2 text-text-primary">Resultados Deportivos</h1>
        <p className="text-sm text-text-tertiary mt-1">Puntuaciones en vivo y resultados finales</p>
      </motion.div>

      {/* ====== Top Bar: Date + Actions ====== */}
      <motion.div variants={itemAnim} className="flex items-center gap-4">
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
        <button className="flex items-center gap-2 px-4 min-h-[44px] rounded-md bg-bg-tertiary text-text-secondary text-sm font-semibold border border-border-default hover:bg-bg-quaternary transition-all">
          <Filter size={16} /> Filtrar
        </button>
        <button className="flex items-center gap-2 px-4 py-2 rounded-md bg-bg-tertiary text-text-secondary text-sm font-semibold border border-border-default hover:bg-bg-quaternary transition-all">
          <Printer size={16} /> Imprimir
        </button>
      </motion.div>

      {/* ====== Sport Tabs ====== */}
      <motion.div variants={itemAnim} className="flex gap-2 overflow-x-auto pb-1">
        {SPORTS.map((sport) => (
          <button
            key={sport}
            onClick={() => setActiveSport(sport)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
              activeSport === sport
                ? 'bg-accent-blue/15 text-accent-blue border border-accent-blue/30'
                : 'text-text-muted hover:text-text-secondary hover:bg-white/5 border border-transparent'
            }`}
          >
            {sport}
          </button>
        ))}
      </motion.div>

      {/* ====== Sport Title ====== */}
      <motion.div variants={itemAnim}>
        <h2 className="text-h3 text-text-primary">{activeSport} - Resultados</h2>
      </motion.div>

      {/* ====== Games Grid ====== */}
      {filteredGames.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          {filteredGames.map((game) => (
            <motion.div key={game.id} variants={itemAnim}>
              <GameCard game={game} />
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div variants={itemAnim} className="flex flex-col items-center justify-center py-16">
          <Trophy size={64} className="text-text-muted/20 mb-4" />
          <p className="text-body-lg text-text-tertiary">No hay resultados disponibles</p>
          <p className="text-sm text-text-muted mt-1">
            Los resultados apareceran cuando los juegos finalicen
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
