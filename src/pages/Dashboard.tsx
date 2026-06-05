import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Calendar, Clock, Trash2, Printer,
  RefreshCw, ChevronUp, ChevronDown, Calculator,
  ClipboardList, X, Check
} from 'lucide-react';
import {
  formatAmount, formatOdds, formatDate, formatTime,
  getLines, getSports, getPeriods, getSelectedPlays,
  addSelectedPlay, removeSelectedPlay, clearSelectedPlays,
  createTicket, type Play, type BettingLine,
} from '@/lib/storage';
import confetti from 'canvas-confetti';

type TabMode = 'teaser' | 'teaserIF';
type PlaysTab = 'jugadas' | 'jugadasIF';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const TEAM_CODES: Record<string, string> = {
  'Giants': '4022', 'Cubs': '4023', 'Yankees': '4001', 'Red Sox': '4002',
  'Dodgers': '4003', 'Mets': '4004', 'Cardinals': '4005', 'Braves': '4006',
  'Astros': '4007', 'Rangers': '4008', 'Phillies': '4009', 'Blue Jays': '4010',
  'Mariners': '4011', 'Padres': '4012', 'Brewers': '4013', 'Twins': '4014',
  'Rays': '4015', 'Orioles': '4016', 'Guardians': '4017', 'Tigers': '4018',
  'White Sox': '4019', 'Royals': '4020', 'Rockies': '4021', 'Athletics': '4024',
  'Pirates': '4025', 'Reds': '4026', 'Marlins': '4027', 'Diamondbacks': '4028',
  'Angels': '4029', 'Nationals': '4030',
};

export default function Dashboard() {
  const [modeTab, setModeTab] = useState<TabMode>('teaser');
  const [playsTab, setPlaysTab] = useState<PlaysTab>('jugadas');
  const [selectedPlays, setSelectedPlays] = useState<Play[]>([]);
  const [lines, setLines] = useState<BettingLine[]>([]);
  const [sports, setSports] = useState<string[]>([]);
  const [selectedSport, setSelectedSport] = useState('Todos');
  const [selectedPeriod, setSelectedPeriod] = useState('Juego Completo');
  const [equipo, setEquipo] = useState('');
  const [jugada, setJugada] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [language, setLanguage] = useState<'es' | 'en'>('es');
  const [refreshing, setRefreshing] = useState(false);
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [processingTicket, setProcessingTicket] = useState(false);
  const [successTicket, setSuccessTicket] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const linesScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const plays = getSelectedPlays();
    setSelectedPlays(plays);
    setSports(getSports());
    loadLines();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const loadLines = () => {
    setLines(getLines(selectedSport, selectedPeriod));
  };

  useEffect(() => {
    loadLines();
  }, [selectedSport, selectedPeriod]);

  const jugadasCount = selectedPlays.filter((p) => !p.isIF).length;
  const jugadasIFCount = selectedPlays.filter((p) => p.isIF).length;
  const totalOdds = useMemo(() => {
    if (selectedPlays.length === 0) return 0;
    return selectedPlays.reduce((acc, p) => acc + (p.odds > 0 ? p.odds / 100 + 1 : 1 - 100 / Math.abs(p.odds)), 1);
  }, [selectedPlays]);

  const cantidadNum = parseFloat(cantidad.replace(/[^0-9.]/g, '')) || 0;
  const pago = cantidadNum > 0 ? cantidadNum * totalOdds : 0;
  const ganancia = pago - cantidadNum;

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
        particleCount: 40, spread: 70, origin: { y: 0.6 },
        colors: ['#7CB342', '#29B6F6', '#81D4FA'],
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
    setTimeout(() => { loadLines(); setRefreshing(false); }, 500);
  };

  const displayPlays = selectedPlays.filter((p) =>
    playsTab === 'jugadas' ? !p.isIF : p.isIF
  );

  // --- Sales Form ---
  const SalesForm = () => (
    <div className="flex flex-col gap-3 p-4">
      {/* Seller Info */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <User size={14} className="text-muted shrink-0" />
          <span className="text-xs text-muted w-16">Vendedor:</span>
          <span className="text-sm font-semibold text-main font-mono">mmw03</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-muted shrink-0" />
          <span className="text-xs text-muted w-16">Fecha:</span>
          <span className="text-xs text-main">{formatDate(currentTime)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-muted shrink-0" />
          <span className="text-xs text-muted w-16">Hora:</span>
          <span className="text-xs text-main font-mono">{formatTime(currentTime)}</span>
        </div>
      </div>

      <div className="border-t border-light" />

      {/* Mode Tabs */}
      <div className="flex gap-1 p-1 rounded-md bg-panel">
        {(['teaser', 'teaserIF'] as const).map((key) => (
          <button
            key={key}
            onClick={() => setModeTab(key)}
            className={`flex-1 py-2 px-4 rounded-sm text-sm font-medium transition-all ${
              modeTab === key
                ? 'bg-white text-main shadow-sm border border-light'
                : 'text-muted hover:text-main'
            }`}
          >
            {key === 'teaser' ? 'Teaser' : 'Teaser IF'}
          </button>
        ))}
      </div>

      {/* Form Fields */}
      <div className="space-y-2.5">
        <div>
          <label className="block text-xs text-muted mb-1">Equipo</label>
          <input type="text" value={equipo} onChange={(e) => setEquipo(e.target.value)}
            placeholder="Nombre del equipo" className="w-full h-10 px-3 rounded-lg border border-light bg-white text-sm focus:outline-none focus:border-matador-green focus:ring-1 focus:ring-matador-green/30 transition-all" />
        </div>
        <div>
          <label className="block text-xs text-muted mb-1">Jugada</label>
          <input type="text" value={jugada} onChange={(e) => setJugada(e.target.value)}
            placeholder="Tipo de jugada" className="w-full h-10 px-3 rounded-lg border border-light bg-white text-sm focus:outline-none focus:border-matador-green focus:ring-1 focus:ring-matador-green/30 transition-all" />
        </div>
        <div>
          <label className="block text-xs text-muted mb-1">#Jug.Reg</label>
          <input type="text" readOnly value={selectedPlays.length.toString()}
            className="w-full h-10 px-3 rounded-lg border border-light bg-fsb-cyan/5 text-sm font-mono text-main" />
        </div>
        <div>
          <label className="block text-xs text-muted mb-1">Cantidad</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted font-mono text-lg">$</span>
            <input type="text" inputMode="decimal" value={cantidad}
              onChange={(e) => setCantidad(e.target.value.replace(/[^0-9.]/g, ''))}
              placeholder="0.00"
              className="w-full h-10 pl-8 pr-4 rounded-lg border border-light bg-white text-right font-mono text-lg focus:outline-none focus:border-matador-green focus:ring-1 focus:ring-matador-green/30 transition-all" />
          </div>
        </div>
        <div>
          <label className="block text-xs text-muted mb-1">Pago</label>
          <div className="w-full h-10 px-3 rounded-lg border border-light bg-panel/50 text-right font-mono text-accent-green flex items-center justify-end">
            {formatAmount(pago)}
          </div>
        </div>
        <div>
          <label className="block text-xs text-muted mb-1">Ganancia</label>
          <div className="w-full h-10 px-3 rounded-lg border border-light bg-panel/50 text-right font-mono text-accent-green flex items-center justify-end">
            {formatAmount(ganancia)}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 pt-2">
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-fsb-cyan/10 text-fsb-cyan border border-fsb-cyan/25 hover:bg-fsb-cyan/20 transition-colors">
          <Calculator size={14} /> Calc
        </button>
        <button onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
          className="px-3 py-2 rounded-lg text-xs font-semibold bg-panel text-muted hover:text-main transition-colors">
          {language === 'es' ? 'ES | EN' : 'EN | ES'}
        </button>
        {showConfirmClear ? (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted">Seguro? {selectedPlays.length} jugadas</span>
            <button onClick={handleClearAll} className="px-3 py-2 rounded text-xs bg-accent-red text-white">Si</button>
            <button onClick={() => setShowConfirmClear(false)} className="px-3 py-2 rounded text-xs bg-panel text-muted">No</button>
          </div>
        ) : (
          <button onClick={() => selectedPlays.length > 0 && setShowConfirmClear(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-accent-red hover:bg-accent-red/10 transition-colors">
            <Trash2 size={14} /> Eliminar
          </button>
        )}
      </div>

      {/* Process Ticket Button */}
      <button
        onClick={handleProcessTicket}
        disabled={selectedPlays.length === 0 || cantidadNum <= 0 || processingTicket}
        className={`w-full mt-2 py-3 rounded-lg text-sm font-bold transition-all duration-200 ${
          selectedPlays.length > 0 && cantidadNum > 0 && !processingTicket
            ? 'btn-matador-green'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        {processingTicket ? (
          <span className="flex items-center justify-center gap-2">
            <RefreshCw size={16} className="animate-spin" /> Procesando...
          </span>
        ) : successTicket ? (
          <span className="flex items-center justify-center gap-2">
            <Check size={16} /> Ticket #{successTicket}
          </span>
        ) : (
          'PROCESAR TICKET'
        )}
      </button>
    </div>
  );

  // --- Selected Plays ---
  const SelectedPlays = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-light shrink-0">
        <h2 className="text-base font-semibold text-main mb-2">Jugadas Seleccionadas</h2>
        <div className="flex gap-1">
          {(['jugadas', 'jugadasIF'] as const).map((key) => (
            <button
              key={key}
              onClick={() => setPlaysTab(key)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                playsTab === key
                  ? 'bg-matador-green/15 text-matador-green border border-matador-green/25'
                  : 'text-muted hover:text-main hover:bg-white'
              }`}
            >
              {key === 'jugadas' ? `Jugadas (${jugadasCount})` : `Jugadas IF (${jugadasIFCount})`}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        {displayPlays.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center px-8">
            <ClipboardList size={48} className="text-gray-300 mb-3" />
            <p className="text-sm text-muted">Seleccione jugadas del panel derecho</p>
            <p className="text-xs text-gray-400 mt-1">Haga clic en una linea para agregarla</p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[400px]">
              <thead className="sticky top-0 z-10">
                <tr className="bg-matador-green text-xs font-semibold text-white uppercase tracking-wider">
                  <th className="text-left px-3 py-2">Equipo</th>
                  <th className="text-left px-3 py-2">Jugada</th>
                  <th className="text-right px-3 py-2">Linea</th>
                  <th className="text-center px-2 py-2 w-12"></th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {displayPlays.map((play, index) => (
                    <motion.tr
                      key={play.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.25 }}
                      className={`border-b border-light hover:bg-gray-50 transition-colors ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                      }`}
                    >
                      <td className="px-3 py-2.5 text-sm text-main">
                        <div className="font-medium">{play.teamCode}</div>
                        <div className="text-xs text-muted truncate max-w-[120px]">{play.team}</div>
                      </td>
                      <td className="px-3 py-2.5 text-sm font-mono text-fsb-cyan">{play.playType}</td>
                      <td className={`px-3 py-2.5 text-sm font-mono text-right ${play.odds >= 0 ? 'odds-positive' : 'odds-negative'}`}>
                        {formatOdds(play.line)}
                      </td>
                      <td className="px-2 py-2.5 text-center">
                        <button onClick={() => handleRemovePlay(play.id)}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-muted hover:text-accent-red hover:bg-accent-red/10 transition-colors">
                          <X size={14} />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {displayPlays.length > 0 && (
        <div className="p-3 border-t border-light shrink-0">
          <button onClick={() => setShowConfirmClear(true)}
            className="flex items-center gap-1.5 text-xs text-accent-red hover:bg-accent-red/10 px-3 py-2 rounded-md transition-colors">
            <Trash2 size={14} /> Eliminar Todas
          </button>
        </div>
      )}
    </div>
  );

  // --- Betting Lines Panel (RIGHT - FSB Style) ---
  const BettingLines = () => (
    <div className="flex flex-col h-full overflow-hidden bg-bg-dark">
      {/* Filters Bar */}
      <div className="shrink-0 bg-bg-dark border-b border-border-dark z-10">
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex gap-1">
            {(['lineas', 'resultados'] as const).map(([key, label]) => (
              <button key={key} onClick={() => {}}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                  key === 'lineas' ? 'bg-fsb-cyan/20 text-fsb-cyan' : 'text-gray-400 hover:text-white'
                }`}>
                {label === 'lineas' ? 'Lineas' : 'Resultados'}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-500 font-mono hidden sm:inline">
              Actualizado: {formatTime(currentTime)}
            </span>
            <button onClick={handleRefresh}
              className={`w-8 h-8 rounded flex items-center justify-center hover:bg-white/10 text-gray-400 transition-colors ${refreshing ? 'animate-spin' : ''}`}>
              <RefreshCw size={15} />
            </button>
            <button className="w-8 h-8 rounded flex items-center justify-center hover:bg-white/10 text-gray-400 transition-colors">
              <Printer size={15} />
            </button>
          </div>
        </div>

        {/* Sport Filter */}
        <div className="flex gap-1.5 px-3 py-1.5 overflow-x-auto">
          {sports.map((sport) => (
            <button key={sport} onClick={() => setSelectedSport(sport)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                selectedSport === sport
                  ? 'bg-fsb-cyan text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}>
              {sport}
            </button>
          ))}
        </div>

        {/* Period Filter */}
        <div className="flex gap-4 px-3 py-1 overflow-x-auto">
          {getPeriods().map((period) => (
            <button key={period} onClick={() => setSelectedPeriod(period)}
              className={`pb-1 text-xs font-medium transition-colors whitespace-nowrap ${
                selectedPeriod === period ? 'text-fsb-cyan border-b-2 border-fsb-cyan' : 'text-gray-500 hover:text-gray-300'
              }`}>
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* Game Cards */}
      <div ref={linesScrollRef} className="flex-1 overflow-y-auto min-h-0 py-2 px-2">
        {lines.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <CalendarIcon size={48} className="text-gray-600 mb-3" />
            <p className="text-sm text-gray-400">No hay juegos disponibles</p>
          </div>
        ) : (
          <div className="space-y-2">
            {lines.map((line) => (
              <GameCard key={line.id} line={line} onAddPlay={handleAddPlay} />
            ))}
          </div>
        )}
      </div>

      {/* Scroll buttons */}
      <div className="shrink-0 flex justify-end gap-1 p-2 border-t border-border-dark">
        <button onClick={() => linesScrollRef.current?.scrollBy({ top: -200, behavior: 'smooth' })}
          className="w-7 h-7 rounded flex items-center justify-center hover:bg-white/10 text-gray-400">
          <ChevronUp size={14} />
        </button>
        <button onClick={() => linesScrollRef.current?.scrollBy({ top: 200, behavior: 'smooth' })}
          className="w-7 h-7 rounded flex items-center justify-center hover:bg-white/10 text-gray-400">
          <ChevronDown size={14} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="h-full grid grid-cols-[280px_1fr_1.3fr] gap-0">
      {/* Left Panel - Sales Form */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-white border-r border-light overflow-y-auto"
      >
        <SalesForm />
      </motion.div>

      {/* Center Panel - Selected Plays */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="bg-bg-panel border-r border-light overflow-hidden"
      >
        <SelectedPlays />
      </motion.div>

      {/* Right Panel - Betting Lines (FSB Dark) */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="overflow-hidden"
      >
        <BettingLines />
      </motion.div>
    </div>
  );
}

// --- Game Card (FSB Style Dark Card) ---
function GameCard({
  line,
  onAddPlay,
}: {
  line: BettingLine;
  onAddPlay: (line: BettingLine, type: string, value: number, points?: number) => void;
}) {
  const [flash, setFlash] = useState(false);

  const handleCellClick = (type: string, value: number, points?: number) => {
    setFlash(true);
    setTimeout(() => setFlash(false), 200);
    onAddPlay(line, type, value, points);
  };

  const awayCode = line.awayTeamCode || TEAM_CODES[line.awayTeam] || '0000';
  const homeCode = line.homeTeamCode || TEAM_CODES[line.homeTeam] || '0000';

  return (
    <motion.div
      whileHover={{ scale: 1.005 }}
      className={`fsb-line-card transition-all duration-150 ${flash ? 'ring-2 ring-fsb-cyan' : ''}`}
    >
      {/* Cyan Header Row: TIME | M.L | R.L | SPREAD | SOLO */}
      <div className="fsb-line-header grid grid-cols-[1fr_60px_60px_60px_60px] gap-px text-center">
        <div className="px-2 py-1.5 text-xs font-bold text-left flex items-center gap-2">
          <span>{line.time}</span>
          <span className="text-white/70 font-normal">{line.sport}</span>
        </div>
        <div className="py-1.5 text-[10px] font-bold uppercase">M.L</div>
        <div className="py-1.5 text-[10px] font-bold uppercase">R.L</div>
        <div className="py-1.5 text-[10px] font-bold uppercase">Spread</div>
        <div className="py-1.5 text-[10px] font-bold uppercase">Solo</div>
      </div>

      {/* Away Team Row */}
      <div className="fsb-line-row grid grid-cols-[1fr_60px_60px_60px_60px] gap-px text-center items-center">
        <div className="px-2 py-2 text-left">
          <span className="font-mono text-fsb-cyan text-xs mr-1.5">{awayCode}</span>
          <span className="text-white text-xs font-medium">- {line.awayTeam}</span>
        </div>
        <LineCell value={line.moneyLine.away} onClick={() => handleCellClick('ML', line.moneyLine.away)} type="odds" />
        <LineCell value={`${line.runLine.away >= 0 ? '+' : ''}${line.runLine.away}`} onClick={() => handleCellClick('RL', line.runLine.away)} />
        <LineCell value={`${line.spread.away >= 0 ? '+' : ''}${line.spread.away}`} onClick={() => handleCellClick('Spread', line.spread.away, line.spread.away)} />
        <LineCell value={line.solo.away} onClick={() => handleCellClick('Solo', line.solo.away)} type="odds" />
      </div>

      {/* Home Team Row */}
      <div className="fsb-line-row grid grid-cols-[1fr_60px_60px_60px_60px] gap-px text-center items-center" style={{ background: '#546E7A' }}>
        <div className="px-2 py-2 text-left">
          <span className="font-mono text-fsb-cyan text-xs mr-1.5">{homeCode}</span>
          <span className="text-white text-xs font-medium">- {line.homeTeam}</span>
        </div>
        <LineCell value={line.moneyLine.home} onClick={() => handleCellClick('ML', line.moneyLine.home)} type="odds" />
        <LineCell value={`${line.runLine.home >= 0 ? '+' : ''}${line.runLine.home}`} onClick={() => handleCellClick('RL', line.runLine.home)} />
        <LineCell value={`${line.spread.home >= 0 ? '+' : ''}${line.spread.home}`} onClick={() => handleCellClick('Spread', line.spread.home, line.spread.home)} />
        <LineCell value={line.solo.home} onClick={() => handleCellClick('Solo', line.solo.home)} type="odds" />
      </div>
    </motion.div>
  );
}

// --- Line Cell (FSB Dark Style) ---
function LineCell({
  value,
  onClick,
  type = 'normal',
}: {
  value: string | number;
  onClick: () => void;
  type?: 'normal' | 'odds';
}) {
  const numVal = typeof value === 'string' ? parseFloat(value.replace(/[OU+\s]/g, '')) : value;
  const display = typeof value === 'string' ? value : formatOdds(value);

  const colorClass = type === 'odds'
    ? (numVal >= 0 ? 'text-accent-green' : 'text-accent-red')
    : 'text-white';

  return (
    <button
      onClick={onClick}
      className={`fsb-line-cell ${colorClass} mx-0.5 my-1`}
    >
      {display}
    </button>
  );
}

function CalendarIcon({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}


