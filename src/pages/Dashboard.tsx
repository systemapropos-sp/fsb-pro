import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import SalesForm from '@/components/SalesForm';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trash2,
  Printer,
  RefreshCw,
  ChevronUp,
  ChevronDown,
  X,
  ClipboardList,
} from 'lucide-react';
import {
  formatOdds,
  formatTime,
  getLines,
  seedLines,
  getSports,
  getPeriods,
  getSelectedPlays,
  addSelectedPlay,
  removeSelectedPlay,
  clearSelectedPlays,
  createTicket,
  type Play,
  type BettingLine,
} from '@/lib/storage';
import confetti from 'canvas-confetti';

type TabMode = 'teaser' | 'teaserIF';
type PlaysTab = 'jugadas' | 'jugadasIF';
type MobileTab = 'apuesta' | 'jugadas' | 'lineas';



export default function Dashboard() {
  // --- State ---
  const [modeTab, setModeTab] = useState<TabMode>('teaser');
  const [playsTab, setPlaysTab] = useState<PlaysTab>('jugadas');
  const [mobileTab, setMobileTab] = useState<MobileTab>('apuesta');
  const [selectedPlays, setSelectedPlays] = useState<Play[]>([]);
  const [lines, setLines] = useState<BettingLine[]>([]);
  const [sports, setSports] = useState<string[]>([]);
  const [selectedSport, setSelectedSport] = useState('Todos');
  const [selectedPeriod, setSelectedPeriod] = useState('Juego Completo');
  const [lineView, setLineView] = useState<'lineas' | 'resultados'>('lineas');
  const [equipo, setEquipo] = useState('');
  const [jugada, setJugada] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [language, setLanguage] = useState<'es' | 'en'>('es');
  const [refreshing, setRefreshing] = useState(false);
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [showCalc, setShowCalc] = useState(false);
  const [processingTicket, setProcessingTicket] = useState(false);
  const [successTicket, setSuccessTicket] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const linesScrollRef = useRef<HTMLDivElement>(null);

  // --- Load data ---
  useEffect(() => {
    const plays = getSelectedPlays();
    setSelectedPlays(plays);
    setSports(getSports());
    loadLines();

    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const loadLines = () => {
    let data = getLines(selectedSport, selectedPeriod);
    if (data.length === 0) {
      // Force re-seed if no data
      seedLines();
      data = getLines(selectedSport, selectedPeriod);
    }
    setLines(data);
  };

  useEffect(() => {
    loadLines();
  }, [selectedSport, selectedPeriod]);

  // --- Computed ---
  const jugadasCount = selectedPlays.filter((p) => !p.isIF).length;
  const jugadasIFCount = selectedPlays.filter((p) => p.isIF).length;
  const totalOdds = useMemo(() => {
    if (selectedPlays.length === 0) return 0;
    return selectedPlays.reduce((acc, p) => acc + (p.odds > 0 ? p.odds / 100 + 1 : 1 - 100 / Math.abs(p.odds)), 1);
  }, [selectedPlays]);

  const cantidadNum = parseFloat(cantidad.replace(/[^0-9.]/g, '')) || 0;
  const pago = cantidadNum > 0 ? cantidadNum * totalOdds : 0;
  const ganancia = pago - cantidadNum;

  // --- Handlers ---
  const handleAddPlay = useCallback(
    (line: BettingLine, type: string, value: number, points: number = 0) => {
      const newPlay: Play = {
        id: `play-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        team: `${line.awayTeam} @ ${line.homeTeam}`,
        teamCode: `${line.awayTeamCode}/${line.homeTeamCode}`,
        playType: type,
        detail: `${line.awayTeam} vs ${line.homeTeam}`,
        line: value,
        player: '',
        points,
        odds: value,
        isIF: modeTab === 'teaserIF',
      };
      addSelectedPlay(newPlay);
      setSelectedPlays(getSelectedPlays());
    },
    [modeTab]
  );

  const handleRemovePlay = (playId: string) => {
    removeSelectedPlay(playId);
    setSelectedPlays(getSelectedPlays());
  };

  const handleClearAll = () => {
    clearSelectedPlays();
    setSelectedPlays([]);
    setShowConfirmClear(false);
    setCantidad('');
  };

  const handleProcessTicket = () => {
    if (selectedPlays.length === 0 || cantidadNum <= 0) return;
    setProcessingTicket(true);

    setTimeout(() => {
      const ticket = createTicket({
        seller: 'mmw03',
        date: new Date().toISOString(),
        plays: selectedPlays,
        amount: cantidadNum,
        payout: pago,
        profit: ganancia,
        status: 'pendiente',
      });

      setSuccessTicket(ticket.id);
      setProcessingTicket(false);

      confetti({
        particleCount: 40,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#22C55E', '#3B82F6', '#06B6D4'],
        disableForReducedMotion: true,
      });

      setTimeout(() => {
        handleClearAll();
        setSuccessTicket(null);
      }, 3000);
    }, 600);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      loadLines();
      setRefreshing(false);
    }, 500);
  };

  const displayPlays = selectedPlays.filter((p) =>
    playsTab === 'jugadas' ? !p.isIF : p.isIF
  );

  // --- Mobile Tab Bar ---
  const MobileTabBar = () => (
    <div className="sticky top-0 z-20 bg-white border-b border-border-subtle flex md:hidden">
      {(
        [
          ['apuesta', 'Apuesta'],
          ['jugadas', `Jugadas (${selectedPlays.length})`],
          ['lineas', 'Lineas'],
        ] as const
      ).map(([key, label]) => (
        <button
          key={key}
          onClick={() => setMobileTab(key)}
          className={`flex-1 py-3 text-sm font-medium transition-all min-h-[44px] active:scale-95 ${
            mobileTab === key
              ? 'text-accent-blue border-b-2 border-accent-blue bg-accent-blue/5'
              : 'text-text-muted hover:text-text-secondary'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );

  // SalesForm is now a separate component in src/components/SalesForm.tsx

  // --- Selected Plays Content (shared) ---
  const SelectedPlays = () => (
    <div className="flex flex-col h-full" style={{ background: '#EBF5FB' }}>
      {/* Header */}
      <div className="p-3 md:p-4 border-b shrink-0" style={{ borderColor: '#AED6F1' }}>
        <h2 className="text-base md:text-h4 font-bold mb-2" style={{ color: '#1A5276' }}>
          Jugadas Seleccionadas
        </h2>
        <div className="flex gap-1">
          {(
            [
              ['jugadas', `Jugadas (${jugadasCount})`],
              ['jugadasIF', `Jugadas IF (${jugadasIFCount})`],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setPlaysTab(key)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all min-h-[36px] active:scale-95 ${
                playsTab === key
                  ? 'bg-accent-blue/15 text-accent-blue border border-accent-blue/25'
                  : 'text-text-muted hover:text-text-secondary hover:bg-white/[0.02]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Plays Table */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {displayPlays.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 md:h-64 text-center px-8">
            <ClipboardList
              size={48}
              className="text-text-muted/30 mb-3"
            />
            <p className="text-sm text-text-tertiary">
              Seleccione jugadas del panel derecho
            </p>
            <p className="text-xs text-text-muted mt-1">
              Haga clic en una linea para agregarla
            </p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[400px]">
              <thead className="sticky top-0 z-10">
                <tr className="bg-bg-secondary/90 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  <th className="text-left px-3 py-2">Equipo</th>
                  <th className="text-left px-3 py-2">Jugada</th>
                  <th className="text-left px-3 py-2 hidden md:table-cell">Dato</th>
                  <th className="text-right px-3 py-2">Linea</th>
                  <th className="text-center px-2 py-2 w-12"></th>
                </tr>
              </thead>
              <tbody>
                {displayPlays.map((play, index) => (
                  <tr
                    key={play.id}
                    className="border-b transition-colors hover:bg-white/60"
                    style={{
                      borderColor: '#AED6F1',
                      background: index % 2 === 0 ? '#FFFFFF' : '#F2F9FC',
                    }}
                  >
                    <td className="px-3 py-2 text-sm" style={{ color: '#191919' }}>
                      <div className="font-bold font-mono text-xs">{play.teamCode}</div>
                      <div className="text-[10px] font-medium truncate max-w-[120px] md:max-w-none" style={{ color: '#5D6D7E' }}>
                        {play.team}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-sm font-bold font-mono" style={{ color: '#2874A6' }}>
                      {play.playType}
                    </td>
                    <td className="px-3 py-2 text-[10px] font-medium hidden md:table-cell" style={{ color: '#5D6D7E' }}>
                      {play.detail}
                    </td>
                    <td
                      className="px-3 py-2 text-sm font-bold font-mono text-right"
                      style={{ color: play.odds >= 0 ? '#00C853' : '#E53935' }}
                    >
                      {formatOdds(play.line)}
                    </td>
                    <td className="px-2 py-2 text-center">
                      <button
                        onClick={() => handleRemovePlay(play.id)}
                        className="w-8 h-8 rounded-full flex items-center justify-center transition-colors active:scale-95"
                        style={{ color: '#ABABAB' }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = '#E53935'; e.currentTarget.style.background = 'rgba(229,57,53,0.1)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = '#ABABAB'; e.currentTarget.style.background = 'transparent'; }}
                      >
                        <X size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete All */}
      {displayPlays.length > 0 && (
        <div className="p-3 border-t shrink-0" style={{ borderColor: '#AED6F1' }}>
          <button
            onClick={() => setShowConfirmClear(true)}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-md transition-colors min-h-[36px] active:scale-95"
            style={{ color: '#E53935' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(229,57,53,0.1)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            <Trash2 size={14} />
            Eliminar Todas
          </button>
        </div>
      )}
    </div>
  );

  // --- Betting Lines Content (shared) ---
  const BettingLines = () => (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Sticky Header */}
      <div className="shrink-0 bg-bg-secondary/95 backdrop-blur-lg border-b border-border-subtle z-10">
        {/* View Toggle + Refresh */}
        <div className="flex items-center justify-between px-3 md:px-4 py-2">
          <div className="flex gap-1">
            {(
              [
                ['lineas', 'Lineas'],
                ['resultados', 'Resultados'],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setLineView(key)}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors min-h-[36px] active:scale-95 ${
                  lineView === key
                    ? 'bg-accent-blue/15 text-accent-blue'
                    : 'text-text-muted hover:text-text-secondary'
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
              onClick={handleRefresh}
              className={`w-10 h-10 md:w-8 md:h-8 rounded-md flex items-center justify-center hover:bg-black/5 text-text-secondary transition-colors active:scale-95 ${
                refreshing ? 'animate-spin-once' : ''
              }`}
            >
              <RefreshCw size={15} />
            </button>
            <button className="w-10 h-10 md:w-8 md:h-8 rounded-md flex items-center justify-center hover:bg-black/5 text-text-secondary transition-colors active:scale-95">
              <Printer size={15} />
            </button>
          </div>
        </div>

        {/* Sport Filter */}
        <div className="flex gap-1.5 px-3 md:px-4 py-2 overflow-x-auto no-scrollbar">
          {sports.map((sport) => (
            <button
              key={sport}
              onClick={() => setSelectedSport(sport)}
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
              onClick={() => setSelectedPeriod(period)}
              className={`pb-1 text-xs font-medium transition-colors whitespace-nowrap min-h-[28px] active:scale-95 ${
                selectedPeriod === period
                  ? 'text-accent-blue border-b-2 border-accent-blue'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* Game Cards */}
      <div ref={linesScrollRef} className="flex-1 overflow-y-auto min-h-0 py-2">
        {lines.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 md:h-64 text-center px-8">
            <CalendarIcon size={48} className="text-text-muted/30 mb-3" />
            <p className="text-sm text-text-tertiary">
              No hay juegos disponibles
            </p>
            <p className="text-xs text-text-muted mt-1">
              Seleccione otro deporte o periodo
            </p>
          </div>
        ) : (
          <div className="space-y-2 px-2 md:px-4">
            {lines.map((line) => (
              <GameCard
                key={line.id}
                line={line}
                onAddPlay={handleAddPlay}
                setEquipo={setEquipo}
              />
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

  // showCalc is used via setShowCalc in salesFormProps
  void showCalc;

  // --- SalesForm props ---
  const salesFormProps = {
    currentTime,
    modeTab,
    setModeTab,
    equipo,
    setEquipo,
    jugada,
    setJugada,
    cantidad,
    setCantidad,
    language,
    setLanguage,
    selectedPlaysCount: selectedPlays.length,
    pago,
    ganancia,
    processingTicket,
    successTicket,
    showConfirmClear,
    setShowConfirmClear,
    onProcessTicket: handleProcessTicket,
    onClearAll: handleClearAll,
    onCalc: () => setShowCalc(true),
  };

  // --- Render ---
  return (
    <div className="h-full flex flex-col">
      {/* Mobile Tab Bar - only visible on small screens */}
      <MobileTabBar />

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {/* Desktop Layout: 3 columns - Form large, Plays medium, Lines small */}
        <div className="hidden xl:grid h-full grid-cols-[0.85fr_0.9fr_0.7fr] gap-px bg-bg-primary">
          {/* Left Panel */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] as [number, number, number, number], delay: 0.1 }}
            className="gradient-panel border-r border-border-subtle overflow-y-auto"
          >
            <SalesForm {...salesFormProps} />
          </motion.div>

          {/* Center Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] as [number, number, number, number], delay: 0.2 }}
            className="gradient-panel border-r border-border-subtle overflow-hidden"
          >
            <SelectedPlays />
          </motion.div>

          {/* Right Panel */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] as [number, number, number, number], delay: 0.3 }}
            className="gradient-panel overflow-hidden"
          >
            <BettingLines />
          </motion.div>
        </div>

        {/* Tablet Layout: 2 columns */}
        <div className="hidden md:grid xl:hidden h-full grid-cols-[3fr_2fr] gap-px bg-bg-primary">
          {/* Left+Center Combined */}
          <div className="flex flex-col border-r border-border-subtle overflow-hidden">
            {/* Sales Form (top half) */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="gradient-panel border-b border-border-subtle overflow-y-auto shrink-0 max-h-[45%]"
            >
              <SalesForm {...salesFormProps} />
            </motion.div>
            {/* Selected Plays (bottom half) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="gradient-panel flex-1 overflow-hidden min-h-0"
            >
              <SelectedPlays />
            </motion.div>
          </div>

          {/* Right Panel (Lines) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="gradient-panel overflow-hidden"
          >
            <BettingLines />
          </motion.div>
        </div>

        {/* Mobile Layout: Tab-based single column */}
        <div className="md:hidden h-full bg-bg-primary overflow-y-auto">
          <AnimatePresence mode="wait">
            {mobileTab === 'apuesta' && (
              <motion.div
                key="apuesta"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.15 }}
                className="gradient-panel"
              >
                <SalesForm {...salesFormProps} />
              </motion.div>
            )}
            {mobileTab === 'jugadas' && (
              <motion.div
                key="jugadas"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.15 }}
                className="gradient-panel h-full"
              >
                <SelectedPlays />
              </motion.div>
            )}
            {mobileTab === 'lineas' && (
              <motion.div
                key="lineas"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.15 }}
                className="gradient-panel h-full flex flex-col"
              >
                <BettingLines />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// --- Sub-components ---

function GameCard({
  line,
  onAddPlay,
  setEquipo,
}: {
  line: BettingLine;
  onAddPlay: (line: BettingLine, type: string, value: number, points?: number) => void;
  setEquipo: (v: string) => void;
}) {
  const [flash, setFlash] = useState(false);

  const handleCellClick = (type: string, value: number, teamCode: string, teamName: string, points?: number) => {
    setFlash(true);
    setTimeout(() => setFlash(false), 200);
    setEquipo(`${teamCode} - ${teamName}`);
    onAddPlay(line, type, value, points);
  };

  return (
    <motion.div
      whileHover={{ y: -1 }}
      className="rounded-lg overflow-hidden transition-all duration-150 shadow-md hover:shadow-lg"
      style={{
        background: flash ? '#37474F' : '#2D2D2D',
        border: flash ? '1px solid #00B0FF' : '1px solid #3A3A3A',
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
            <div key={h} className="text-[9px] font-bold text-center uppercase py-1" style={{ color: '#90A4AE' }}>{h}</div>
          ))}

          {/* Away Team Row */}
          <div className="flex items-center gap-1 px-1 py-1">
            <span className="font-mono text-[11px] font-bold" style={{ color: '#00B0FF' }}>{line.awayTeamCode}</span>
            <span className="text-[10px]" style={{ color: '#757575' }}>-</span>
            <span className="text-[11px] font-semibold text-white">{line.awayTeam}</span>
          </div>
          <DarkLineCell value={line.moneyLine.away} onClick={() => handleCellClick('ML', line.moneyLine.away, line.awayTeamCode, line.awayTeam)} type="odds" />
          <DarkLineCell value={`${line.runLine.away >= 0 ? '+' : ''}${line.runLine.away}`} onClick={() => handleCellClick('RL', line.runLine.away, line.awayTeamCode, line.awayTeam)} />
          <DarkLineCell value={`${line.spread.away >= 0 ? '+' : ''}${line.spread.away}`} onClick={() => handleCellClick('Spread', line.spread.away, line.awayTeamCode, line.awayTeam, line.spread.away)} />
          <DarkLineCell value={line.solo.away} onClick={() => handleCellClick('Solo', line.solo.away, line.awayTeamCode, line.awayTeam)} type="odds" />
          <DarkLineCell value={`O ${line.points.over}`} onClick={() => handleCellClick('Over', line.points.over, line.awayTeamCode, line.awayTeam, line.points.value)} type="over" />

          {/* Home Team Row */}
          <div className="flex items-center gap-1 px-1 py-1" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <span className="font-mono text-[11px] font-bold" style={{ color: '#00B0FF' }}>{line.homeTeamCode}</span>
            <span className="text-[10px]" style={{ color: '#757575' }}>-</span>
            <span className="text-[11px] font-semibold text-white">{line.homeTeam}</span>
          </div>
          <DarkLineCell value={line.moneyLine.home} onClick={() => handleCellClick('ML', line.moneyLine.home, line.homeTeamCode, line.homeTeam)} type="odds" />
          <DarkLineCell value={`${line.runLine.home >= 0 ? '+' : ''}${line.runLine.home}`} onClick={() => handleCellClick('RL', line.runLine.home, line.homeTeamCode, line.homeTeam)} />
          <DarkLineCell value={`${line.spread.home >= 0 ? '+' : ''}${line.spread.home}`} onClick={() => handleCellClick('Spread', line.spread.home, line.homeTeamCode, line.homeTeam, line.spread.home)} />
          <DarkLineCell value={line.solo.home} onClick={() => handleCellClick('Solo', line.solo.home, line.homeTeamCode, line.homeTeam)} type="odds" />
          <DarkLineCell value={`U ${line.points.under}`} onClick={() => handleCellClick('Under', line.points.under, line.homeTeamCode, line.homeTeam, line.points.value)} type="under" />
        </div>
      </div>
    </motion.div>
  );
}

function DarkLineCell({
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

  let textColor = '#FFFFFF';
  if (type === 'odds') {
    textColor = numVal >= 0 ? '#00C853' : '#E53935';
  } else if (type === 'over') {
    textColor = '#00C853';
  } else if (type === 'under') {
    textColor = '#E53935';
  }

  return (
    <button
      onClick={onClick}
      className="py-1.5 rounded font-mono text-[11px] flex items-center justify-center transition-all duration-150"
      style={{
        background: 'rgba(255,255,255,0.08)',
        color: textColor,
        border: '1px solid rgba(255,255,255,0.1)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(0,176,255,0.25)';
        e.currentTarget.style.borderColor = 'rgba(0,176,255,0.5)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
      }}
    >
      {display}
    </button>
  );
}

function CalendarIcon({ size, className }: { size: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}
