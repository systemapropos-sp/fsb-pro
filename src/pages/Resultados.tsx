import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Printer, RefreshCw, Wifi,
  WifiOff, Clock, Trophy,
} from 'lucide-react';
import { useLiveScores, type GameResult } from '@/lib/sportsApi';

const SPORTS = [
  { key: 'all', label: 'Todos' },
  { key: 'basketball', label: 'NBA' },
  { key: 'baseball', label: 'MLB' },
  { key: 'american-football', label: 'NFL' },
  { key: 'football', label: 'Soccer' },
];

function StatusBadge({ status }: { status: GameResult['status'] }) {
  const config: Record<string, { color: string; bg: string; label: string }> = {
    LIVE: { color: '#E53935', bg: 'rgba(229,57,53,0.1)', label: 'EN VIVO' },
    FT: { color: '#00C853', bg: 'rgba(0,200,83,0.1)', label: 'FINAL' },
    NS: { color: '#ABABAB', bg: 'rgba(0,0,0,0.05)', label: 'PENDIENTE' },
    HT: { color: '#FF9800', bg: 'rgba(255,152,0,0.1)', label: 'DESCANSO' },
    POST: { color: '#00C853', bg: 'rgba(0,200,83,0.1)', label: 'POSTERGADO' },
  };
  const c = config[status] || config.NS;

  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
      style={{ color: c.color, background: c.bg }}
    >
      {status === 'LIVE' && <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: c.color }} />}
      {c.label}
    </span>
  );
}

function ScoreCard({ game }: { game: GameResult }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border p-3 transition-all hover:shadow-md"
      style={{ background: '#FFFFFF', borderColor: '#E0E0E0' }}
    >
      {/* Header: League + Status */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#FF3008' }}>
          {game.league}
        </span>
        <div className="flex items-center gap-2">
          <StatusBadge status={game.status} />
          <span className="text-[10px] font-mono" style={{ color: '#ABABAB' }}>{game.time}</span>
        </div>
      </div>

      {/* Teams & Scores */}
      <div className="space-y-2">
        {/* Away */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold" style={{ color: '#191919' }}>{game.awayTeam}</span>
          <span
            className="text-lg font-bold font-mono"
            style={{ color: game.status === 'LIVE' ? '#FF3008' : '#191919' }}
          >
            {game.status === 'NS' ? '-' : game.awayScore}
          </span>
        </div>
        {/* Home */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold" style={{ color: '#191919' }}>{game.homeTeam}</span>
          <span
            className="text-lg font-bold font-mono"
            style={{ color: game.status === 'LIVE' ? '#FF3008' : '#191919' }}
          >
            {game.status === 'NS' ? '-' : game.homeScore}
          </span>
        </div>
      </div>

      {/* Period / Last Updated */}
      {game.period && game.status === 'LIVE' && (
        <div className="mt-2 pt-2 border-t flex items-center gap-1.5" style={{ borderColor: '#EEEEEE' }}>
          <Clock size={12} style={{ color: '#FF3008' }} />
          <span className="text-[11px] font-bold font-mono" style={{ color: '#FF3008' }}>
            {game.period}
          </span>
        </div>
      )}
    </motion.div>
  );
}

export default function Resultados() {
  const [selectedSport, setSelectedSport] = useState('all');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const { games, loading, error, lastUpdated, refresh } = useLiveScores(selectedSport, 60);

  const filteredGames = selectedSport === 'all'
    ? games
    : games.filter(g => g.sport === selectedSport);

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto" style={{ background: '#D5D8DC', minHeight: '100%' }}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold" style={{ color: '#191919' }}>Resultados Deportivos</h1>
          <p className="text-xs mt-0.5" style={{ color: '#767676' }}>
            {getSavedApiKey() ? (
              <span className="flex items-center gap-1"><Wifi size={12} style={{ color: '#00C853' }} /> Datos en tiempo real</span>
            ) : (
              <span className="flex items-center gap-1"><WifiOff size={12} style={{ color: '#ABABAB' }} /> Modo demo - Configure API key en Configuracion</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="input-clean text-sm h-9"
          />
          <button
            onClick={refresh}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold border transition-all active:scale-95"
            style={{ background: '#FFFFFF', borderColor: '#E0E0E0', color: '#191919' }}
          >
            <RefreshCw size={14} /> Actualizar
          </button>
          <button
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold border transition-all active:scale-95"
            style={{ background: '#FFFFFF', borderColor: '#E0E0E0', color: '#191919' }}
          >
            <Printer size={14} /> Imprimir
          </button>
        </div>
      </div>

      {/* Last Updated */}
      <div className="flex items-center gap-1 mb-3">
        <Clock size={12} style={{ color: '#ABABAB' }} />
        <span className="text-[11px]" style={{ color: '#ABABAB' }}>
          Actualizado: {lastUpdated.toLocaleTimeString()}
        </span>
      </div>

      {/* Sport Filters */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {SPORTS.map((s) => (
          <button
            key={s.key}
            onClick={() => setSelectedSport(s.key)}
            className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95"
            style={{
              background: selectedSport === s.key ? '#FF3008' : '#FFFFFF',
              color: selectedSport === s.key ? '#FFFFFF' : '#767676',
              border: selectedSport === s.key ? 'none' : '1px solid #E0E0E0',
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Games Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw size={24} className="animate-spin" style={{ color: '#FF3008' }} />
          <span className="ml-2 text-sm font-medium" style={{ color: '#767676' }}>Cargando resultados...</span>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-20 text-center">
          <WifiOff size={24} style={{ color: '#E53935' }} />
          <span className="ml-2 text-sm" style={{ color: '#E53935' }}>{error}</span>
        </div>
      ) : filteredGames.length === 0 ? (
        <div className="flex items-center justify-center py-20 text-center">
          <Trophy size={24} style={{ color: '#ABABAB' }} />
          <span className="ml-2 text-sm" style={{ color: '#ABABAB' }}>No hay juegos para mostrar</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredGames.map((game) => (
            <ScoreCard key={game.id} game={game} />
          ))}
        </div>
      )}
    </div>
  );
}

// Helper
import { getSavedApiKey } from '@/lib/sportsApi';
