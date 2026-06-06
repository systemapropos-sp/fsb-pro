import { useRef, useState, memo } from 'react';
import { RefreshCw, Printer, ChevronUp, ChevronDown } from 'lucide-react';
import { formatOdds, formatTime } from '@/lib/storage';
import type { BettingLine } from '@/lib/storage';

interface BettingLinesProps {
  lines: BettingLine[];
  sports: string[];
  selectedSport: string;
  onSelectSport: (s: string) => void;
  selectedPeriod: string;
  onSelectPeriod: (p: string) => void;
  lineView: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSetLineView: (v: any) => void;
  currentTime: Date;
  refreshing: boolean;
  onRefresh: () => void;
  onAddPlay: (line: BettingLine, type: string, value: number, points?: number, teamCode?: string) => void;
  setEquipo: (v: string) => void;
  getPeriods: () => string[];
}

const GameCard = memo(function GameCard({
  line,
  onAddPlay,
  setEquipo,
}: {
  line: BettingLine;
  onAddPlay: (line: BettingLine, type: string, value: number, points?: number, teamCode?: string) => void;
  setEquipo: (v: string) => void;
}) {
  const [flash, setFlash] = useState(false);

  const handleCellClick = (type: string, value: number, teamCode: string, teamName: string, points?: number) => {
    setFlash(true);
    setTimeout(() => setFlash(false), 200);
    setEquipo(`${teamCode} - ${teamName}`);
    onAddPlay(line, type, value, points, teamCode);
  };

  return (
    <div
      className="rounded-lg overflow-hidden transition-all duration-150 shadow-sm hover:shadow-md hover:-translate-y-px"
      style={{
        background: flash ? '#E3F2FD' : '#F5F5F5',
        border: flash ? '1px solid #00B0FF' : '1px solid #D0D0D0',
      }}
    >
      {/* Cyan Header */}
      <div className="flex items-center justify-between px-3 py-1.5" style={{ background: '#00B0FF' }}>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-white">{line.sport}</span>
          <span className="text-[11px] text-white/80">{line.time}</span>
        </div>
        <span className="text-[10px] text-white/70 uppercase tracking-wider">{line.period}</span>
      </div>

      {/* Lines Table */}
      <div className="p-2">
        <div className="grid gap-1" style={{ gridTemplateColumns: '100px 1fr 1fr 1fr 1fr 1fr' }}>
          {/* Column Headers */}
          <div></div>
          {['M.L', 'R.L', 'SPREAD', 'SOLO', 'PUNTOS'].map((h) => (
            <div key={h} className="text-[9px] font-bold text-center uppercase py-1" style={{ color: '#777777' }}>{h}</div>
          ))}

          {/* Away Team Row */}
          <div className="flex items-center gap-1 px-1 py-1">
            <span className="font-mono text-[11px] font-bold" style={{ color: '#00B0FF' }}>{line.awayTeamCode}</span>
            <span className="text-[10px]" style={{ color: '#999999' }}>-</span>
            <span className="text-[11px] font-semibold" style={{ color: '#333333' }}>{line.awayTeam}</span>
          </div>
          <LineCell value={line.moneyLine.away} onClick={() => handleCellClick('ML', line.moneyLine.away, line.awayTeamCode, line.awayTeam)} type="odds" />
          <LineCell value={`${line.runLine.away >= 0 ? '+' : ''}${line.runLine.away}`} onClick={() => handleCellClick('RL', line.runLine.away, line.awayTeamCode, line.awayTeam)} />
          <LineCell value={`${line.spread.away >= 0 ? '+' : ''}${line.spread.away}`} onClick={() => handleCellClick('Spread', line.spread.away, line.awayTeamCode, line.awayTeam, line.spread.away)} />
          <LineCell value={line.solo.away} onClick={() => handleCellClick('Solo', line.solo.away, line.awayTeamCode, line.awayTeam)} type="odds" />
          <LineCell value={`O ${line.points.over}`} onClick={() => handleCellClick('Over', line.points.over, line.awayTeamCode, line.awayTeam, line.points.value)} type="over" />

          {/* Home Team Row */}
          <div className="flex items-center gap-1 px-1 py-1" style={{ background: 'rgba(0,0,0,0.02)' }}>
            <span className="font-mono text-[11px] font-bold" style={{ color: '#00B0FF' }}>{line.homeTeamCode}</span>
            <span className="text-[10px]" style={{ color: '#999999' }}>-</span>
            <span className="text-[11px] font-semibold" style={{ color: '#333333' }}>{line.homeTeam}</span>
          </div>
          <LineCell value={line.moneyLine.home} onClick={() => handleCellClick('ML', line.moneyLine.home, line.homeTeamCode, line.homeTeam)} type="odds" />
          <LineCell value={`${line.runLine.home >= 0 ? '+' : ''}${line.runLine.home}`} onClick={() => handleCellClick('RL', line.runLine.home, line.homeTeamCode, line.homeTeam)} />
          <LineCell value={`${line.spread.home >= 0 ? '+' : ''}${line.spread.home}`} onClick={() => handleCellClick('Spread', line.spread.home, line.homeTeamCode, line.homeTeam, line.spread.home)} />
          <LineCell value={line.solo.home} onClick={() => handleCellClick('Solo', line.solo.home, line.homeTeamCode, line.homeTeam)} type="odds" />
          <LineCell value={`U ${line.points.under}`} onClick={() => handleCellClick('Under', line.points.under, line.homeTeamCode, line.homeTeam, line.points.value)} type="under" />
        </div>
      </div>
    </div>
  );
});

function LineCell({
  value,
  onClick,
  type = 'normal',
}: {
  value: string | number;
  onClick: () => void;
  type?: 'normal' | 'odds' | 'over' | 'under';
}) {
  const numVal = typeof value === 'string' ? parseFloat(value.replace(/[OU+\s]/g, '')) : value;
  const display = typeof value === 'string' ? value : formatOdds(value);

  let textColor = '#444444';
  if (type === 'odds') {
    textColor = numVal >= 0 ? '#2E7D32' : '#C62828';
  } else if (type === 'over') {
    textColor = '#2E7D32';
  } else if (type === 'under') {
    textColor = '#C62828';
  }

  return (
    <button
      onClick={onClick}
      className="py-1.5 rounded font-mono text-[11px] flex items-center justify-center transition-all duration-150"
      style={{
        background: 'rgba(0,0,0,0.04)',
        color: textColor,
        border: '1px solid rgba(0,0,0,0.08)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(0,136,209,0.15)';
        e.currentTarget.style.borderColor = 'rgba(0,136,209,0.4)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(0,0,0,0.04)';
        e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)';
      }}
    >
      {display}
    </button>
  );
}

function CalendarIcon({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

// Main component
export default memo(function BettingLines({
  lines,
  sports,
  selectedSport,
  onSelectSport,
  selectedPeriod,
  onSelectPeriod,
  lineView,
  onSetLineView,
  currentTime,
  refreshing,
  onRefresh,
  onAddPlay,
  setEquipo,
  getPeriods,
}: BettingLinesProps) {
  const linesScrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Sticky Header */}
      <div className="shrink-0 bg-bg-secondary/95 backdrop-blur-lg border-b border-border-subtle z-10">
        {/* View Toggle + Refresh */}
        <div className="flex items-center justify-between px-3 md:px-4 py-2">
          <div className="flex gap-1">
            {(['lineas', 'resultados'] as const).map(([key, label]) => (
              <button
                key={key}
                onClick={() => onSetLineView(key)}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors min-h-[36px] active:scale-95 ${
                  lineView === key ? 'bg-accent-blue/15 text-accent-blue' : 'text-text-muted hover:text-text-secondary'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5 md:gap-2">
            <span className="text-[10px] md:text-xs text-text-tertiary font-mono hidden sm:inline">
              Actualizado: {formatTime(currentTime)}
            </span>
            <button
              onClick={onRefresh}
              className={`w-10 h-10 md:w-8 md:h-8 rounded-md flex items-center justify-center hover:bg-black/5 text-text-secondary transition-colors active:scale-95 ${refreshing ? 'animate-spin-once' : ''}`}
            >
              <RefreshCw size={15} />
            </button>
            <button onClick={() => window.print()} className="w-10 h-10 md:w-8 md:h-8 rounded-md flex items-center justify-center hover:bg-black/5 text-text-secondary transition-colors active:scale-95">
              <Printer size={15} />
            </button>
          </div>
        </div>

        {/* Sport Filter */}
        <div className="flex gap-1.5 px-3 md:px-4 py-2 overflow-x-auto no-scrollbar">
          {sports.map((sport) => (
            <button
              key={sport}
              onClick={() => onSelectSport(sport)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all min-h-[36px] active:scale-95 ${
                selectedSport === sport
                  ? 'bg-accent-blue/15 text-accent-blue border border-accent-blue/25'
                  : 'text-text-muted hover:text-text-secondary hover:bg-white/[0.02]'
              }`}
            >
              {sport}
            </button>
          ))}
        </div>

        {/* Period Filter */}
        <div className="flex gap-4 px-3 md:px-4 py-1.5 overflow-x-auto">
          {getPeriods().map((period) => (
            <button
              key={period}
              onClick={() => onSelectPeriod(period)}
              className={`pb-1 text-xs font-medium transition-colors whitespace-nowrap min-h-[28px] active:scale-95 ${
                selectedPeriod === period ? 'text-accent-blue border-b-2 border-accent-blue' : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* Game Cards */}
      <div ref={linesScrollRef} className="flex-1 overflow-y-auto min-h-0 py-2" style={{ overscrollBehavior: 'contain' }}>
        {lines.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 md:h-64 text-center px-8">
            <CalendarIcon size={48} className="text-text-muted/30 mb-3" />
            <p className="text-sm text-text-tertiary">No hay juegos disponibles</p>
            <p className="text-xs text-text-muted mt-1">Seleccione otro deporte o periodo</p>
          </div>
        ) : (
          <div className="space-y-2 px-2 md:px-4">
            {lines.map((line) => (
              <GameCard key={line.id} line={line} onAddPlay={onAddPlay} setEquipo={setEquipo} />
            ))}
          </div>
        )}
      </div>

      {/* Scroll buttons */}
      <div className="shrink-0 flex justify-end gap-1 p-2 border-t border-border-subtle">
        <button
          onClick={() => linesScrollRef.current?.scrollBy({ top: -200, behavior: 'smooth' })}
          className="w-9 h-9 md:w-7 md:h-7 rounded flex items-center justify-center hover:bg-black/5 text-text-secondary active:scale-95"
        >
          <ChevronUp size={14} />
        </button>
        <button
          onClick={() => linesScrollRef.current?.scrollBy({ top: 200, behavior: 'smooth' })}
          className="w-9 h-9 md:w-7 md:h-7 rounded flex items-center justify-center hover:bg-black/5 text-text-secondary active:scale-95"
        >
          <ChevronDown size={14} />
        </button>
      </div>
    </div>
  );
});
