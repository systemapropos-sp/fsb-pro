import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Calendar,
  Clock,
  Trash2,
  Printer,
  RefreshCw,
  ChevronUp,
  ChevronDown,
  Calculator,
  X,
  ClipboardList,
} from 'lucide-react';
import {
  formatAmount,
  formatOdds,
  formatDate,
  formatTime,
  getLines,
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

export default function Dashboard() {
  // --- State ---
  const [modeTab, setModeTab] = useState<TabMode>('teaser');
  const [playsTab, setPlaysTab] = useState<PlaysTab>('jugadas');
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
    setLines(getLines(selectedSport, selectedPeriod));
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

      // Confetti
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

  // --- Render ---
  return (
    <div className="h-[calc(100dvh-48px-96px)] grid grid-cols-[320px_1fr_1.2fr] gap-px bg-bg-primary overflow-hidden">
      {/* ==================== LEFT PANEL: Sales Form ==================== */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] as [number, number, number, number], delay: 0.1 }}
        className="gradient-panel border-r border-border-subtle overflow-y-auto p-4 flex flex-col gap-3"
      >
        {/* Seller Info */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <User size={14} className="text-text-tertiary" />
            <span className="text-xs text-text-tertiary w-16">Vendedor:</span>
            <span className="text-sm font-semibold text-text-primary font-mono">
              mmw03
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-text-tertiary" />
            <span className="text-xs text-text-tertiary w-16">Fecha:</span>
            <span className="text-xs text-text-secondary">
              {formatDate(currentTime)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-text-tertiary" />
            <span className="text-xs text-text-tertiary w-16">Hora:</span>
            <span className="text-xs text-text-secondary font-mono">
              {formatTime(currentTime)}
            </span>
          </div>
        </div>

        <div className="border-t border-border-subtle" />

        {/* Mode Tabs */}
        <div className="flex gap-1 p-1 rounded-md bg-bg-secondary/80">
          {(
            [
              ['teaser', 'Teaser'],
              ['teaserIF', 'Teaser IF'],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setModeTab(key)}
              className={`flex-1 py-2 px-4 rounded-sm text-sm font-medium transition-all duration-200 ${
                modeTab === key
                  ? 'bg-accent-blue/15 text-text-primary border border-accent-blue/30'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Form Fields */}
        <div className="space-y-2.5">
          <div>
            <label className="block text-xs text-text-tertiary mb-1">
              Equipo
            </label>
            <input
              type="text"
              value={equipo}
              onChange={(e) => setEquipo(e.target.value)}
              placeholder="Nombre del equipo"
              className="input-standard w-full"
            />
          </div>

          <div>
            <label className="block text-xs text-text-tertiary mb-1">
              Jugada
            </label>
            <input
              type="text"
              value={jugada}
              onChange={(e) => setJugada(e.target.value)}
              placeholder="Tipo de jugada"
              className="input-standard w-full"
            />
          </div>

          <div>
            <label className="block text-xs text-text-tertiary mb-1">
              #Jug.Reg
            </label>
            <input
              type="text"
              readOnly
              value={selectedPlays.length.toString()}
              className="w-full rounded-md border border-border-default bg-accent-blue/5 px-3.5 py-2.5 text-sm font-mono text-text-primary"
            />
          </div>

          <div>
            <label className="block text-xs text-text-tertiary mb-1">
              Cantidad
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary font-mono text-lg">
                $
              </span>
              <input
                type="text"
                value={cantidad}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9.]/g, '');
                  setCantidad(val);
                }}
                placeholder="0.00"
                className="input-standard w-full pl-8 pr-4 py-2.5 text-right font-mono text-mono-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-text-tertiary mb-1">Pago</label>
            <div className="w-full rounded-md border border-border-default bg-bg-tertiary/40 px-3.5 py-2.5 text-right font-mono text-mono text-accent-green">
              {formatAmount(pago)}
            </div>
          </div>

          <div>
            <label className="block text-xs text-text-tertiary mb-1">
              Ganancia
            </label>
            <div className="w-full rounded-md border border-border-default bg-bg-tertiary/40 px-3.5 py-2.5 text-right font-mono text-mono text-accent-green">
              {formatAmount(ganancia)}
            </div>
          </div>

          {/* IF Fields */}
          <AnimatePresence>
            {modeTab === 'teaserIF' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2.5 border-t border-accent-purple/30 pt-2.5"
              >
                <div>
                  <label className="block text-xs text-accent-purple mb-1">
                    Monto IF
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary font-mono text-lg">
                      $
                    </span>
                    <input
                      type="text"
                      placeholder="0.00"
                      className="input-standard w-full pl-8 pr-4 py-2.5 text-right font-mono text-mono-lg border-accent-purple/30 focus:border-accent-purple focus:shadow-[0_0_0_3px_rgba(139,92,246,0.2)]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-accent-purple mb-1">
                    Pago con IF
                  </label>
                  <div className="w-full rounded-md border border-accent-purple/30 bg-accent-purple/5 px-3.5 py-2.5 text-right font-mono text-mono text-accent-purple">
                    $0.00
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-accent-purple mb-1">
                    Ganancia IF
                  </label>
                  <div className="w-full rounded-md border border-accent-purple/30 bg-accent-purple/5 px-3.5 py-2.5 text-right font-mono text-mono text-accent-purple">
                    $0.00
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 pt-2">
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold bg-accent-blue/10 text-accent-blue border border-accent-blue/25 hover:bg-accent-blue/20 transition-colors">
            <Calculator size={14} />
            Calc
          </button>
          <button
            onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
            className="px-3 py-2 rounded-md text-xs font-semibold bg-bg-tertiary text-text-secondary hover:text-text-primary transition-colors"
          >
            {language === 'es' ? 'ES | EN' : 'EN | ES'}
          </button>
          {showConfirmClear ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-tertiary">
                Seguro? {selectedPlays.length} jugadas
              </span>
              <button
                onClick={handleClearAll}
                className="px-2 py-1 rounded text-xs bg-accent-red text-white"
              >
                Si
              </button>
              <button
                onClick={() => setShowConfirmClear(false)}
                className="px-2 py-1 rounded text-xs bg-bg-tertiary text-text-secondary"
              >
                No
              </button>
            </div>
          ) : (
            <button
              onClick={() =>
                selectedPlays.length > 0 && setShowConfirmClear(true)
              }
              className="flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold text-accent-red hover:bg-accent-red/10 transition-colors"
            >
              <Trash2 size={14} />
              Eliminar
            </button>
          )}
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold bg-accent-blue/10 text-accent-blue border border-accent-blue/25 hover:bg-accent-blue/20 transition-colors">
            <Printer size={14} />
            Imprimir
          </button>
        </div>

        {/* Process Button */}
        <button
          onClick={handleProcessTicket}
          disabled={selectedPlays.length === 0 || cantidadNum <= 0 || processingTicket}
          className={`w-full h-11 rounded-md font-bold text-sm tracking-[0.05em] transition-all duration-200 flex items-center justify-center gap-2 mt-1 ${
            processingTicket
              ? 'bg-accent-green text-white cursor-default'
              : selectedPlays.length > 0 && cantidadNum > 0
                ? 'gradient-winner text-white hover:shadow-winner hover:-translate-y-px active:scale-[0.98]'
                : 'bg-bg-quaternary text-text-muted cursor-not-allowed opacity-50'
          }`}
        >
          {processingTicket ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              PROCESANDO...
            </>
          ) : successTicket ? (
            <>
              <CheckIcon />
              TICKET {successTicket}
            </>
          ) : (
            'PROCESAR TICKET'
          )}
        </button>
      </motion.div>

      {/* ==================== CENTER PANEL: Selected Plays ==================== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] as [number, number, number, number], delay: 0.2 }}
        className="gradient-panel border-r border-border-subtle overflow-y-auto flex flex-col"
      >
        {/* Header */}
        <div className="p-4 border-b border-border-subtle">
          <h2 className="text-h4 text-text-primary font-semibold mb-2">
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
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
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
        <div className="flex-1 overflow-y-auto">
          {displayPlays.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center px-8">
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
            <table className="w-full">
              <thead className="sticky top-0 z-10">
                <tr className="bg-bg-secondary/90 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  <th className="text-left px-3 py-2">Equipo</th>
                  <th className="text-left px-3 py-2">Jugada</th>
                  <th className="text-left px-3 py-2">Dato</th>
                  <th className="text-right px-3 py-2">Linea</th>
                  <th className="text-center px-2 py-2 w-8"></th>
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
                      className={`border-b border-border-subtle hover:bg-white/[0.02] transition-colors ${
                        index % 2 === 0 ? 'bg-white/[0.01]' : ''
                      }`}
                    >
                      <td className="px-3 py-2.5 text-sm text-text-primary">
                        <div className="font-medium">{play.teamCode}</div>
                        <div className="text-xs text-text-tertiary">
                          {play.team}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-sm font-mono text-accent-blue">
                        {play.playType}
                      </td>
                      <td className="px-3 py-2.5 text-xs text-text-secondary">
                        {play.detail}
                      </td>
                      <td
                        className={`px-3 py-2.5 text-sm font-mono text-right ${
                          play.odds >= 0 ? 'text-accent-green' : 'text-accent-red'
                        }`}
                      >
                        {formatOdds(play.line)}
                      </td>
                      <td className="px-2 py-2.5 text-center">
                        <button
                          onClick={() => handleRemovePlay(play.id)}
                          className="w-6 h-6 rounded-full flex items-center justify-center text-text-muted hover:text-accent-red hover:bg-accent-red/10 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          )}
        </div>

        {/* Delete All */}
        {displayPlays.length > 0 && (
          <div className="p-3 border-t border-border-subtle">
            <button
              onClick={() => setShowConfirmClear(true)}
              className="flex items-center gap-1.5 text-xs text-accent-red hover:bg-accent-red/10 px-3 py-1.5 rounded-md transition-colors"
            >
              <Trash2 size={14} />
              Eliminar Todas
            </button>
          </div>
        )}
      </motion.div>

      {/* ==================== RIGHT PANEL: Betting Lines ==================== */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] as [number, number, number, number], delay: 0.3 }}
        className="gradient-panel overflow-hidden flex flex-col"
      >
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-bg-secondary/95 backdrop-blur-lg border-b border-border-subtle">
          {/* View Toggle + Refresh */}
          <div className="flex items-center justify-between px-4 py-2">
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
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    lineView === key
                      ? 'bg-accent-blue/15 text-accent-blue'
                      : 'text-text-muted hover:text-text-secondary'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-tertiary font-mono">
                Actualizado: {formatTime(currentTime)}
              </span>
              <button
                onClick={handleRefresh}
                className={`w-8 h-8 rounded-md flex items-center justify-center bg-white/[0.04] hover:bg-white/[0.08] text-text-secondary transition-colors ${
                  refreshing ? 'animate-spin-once' : ''
                }`}
              >
                <RefreshCw size={15} />
              </button>
              <button className="w-8 h-8 rounded-md flex items-center justify-center bg-white/[0.04] hover:bg-white/[0.08] text-text-secondary transition-colors">
                <Printer size={15} />
              </button>
            </div>
          </div>

          {/* Sport Filter */}
          <div className="flex gap-1.5 px-4 py-2 overflow-x-auto">
            {sports.map((sport) => (
              <button
                key={sport}
                onClick={() => setSelectedSport(sport)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
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
          <div className="flex gap-4 px-4 py-1.5">
            {getPeriods().map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`pb-1 text-xs font-medium transition-colors ${
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
        <div ref={linesScrollRef} className="flex-1 overflow-y-auto py-2">
          {lines.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center px-8">
              <CalendarIcon size={48} className="text-text-muted/30 mb-3" />
              <p className="text-sm text-text-tertiary">
                No hay juegos disponibles
              </p>
              <p className="text-xs text-text-muted mt-1">
                Seleccione otro deporte o periodo
              </p>
            </div>
          ) : (
            <div className="space-y-2 px-4">
              {lines.map((line) => (
                <GameCard
                  key={line.id}
                  line={line}
                  onAddPlay={handleAddPlay}
                />
              ))}
            </div>
          )}
        </div>

        {/* Scroll buttons */}
        <div className="flex justify-end gap-1 p-2 border-t border-border-subtle">
          <button
            onClick={() => linesScrollRef.current?.scrollBy({ top: -200, behavior: 'smooth' })}
            className="w-7 h-7 rounded flex items-center justify-center bg-white/[0.04] hover:bg-white/[0.08] text-text-secondary"
          >
            <ChevronUp size={14} />
          </button>
          <button
            onClick={() => linesScrollRef.current?.scrollBy({ top: 200, behavior: 'smooth' })}
            className="w-7 h-7 rounded flex items-center justify-center bg-white/[0.04] hover:bg-white/[0.08] text-text-secondary"
          >
            <ChevronDown size={14} />
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// --- Sub-components ---

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

  return (
    <motion.div
      whileHover={{ y: -1 }}
      className={`rounded-md border p-3 transition-all duration-150 ${
        flash
          ? 'bg-accent-blue/20 border-accent-blue/40'
          : 'bg-bg-tertiary/40 border-border-subtle hover:shadow-card'
      }`}
    >
      {/* Teams Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-accent-blue bg-accent-blue/10 px-1.5 py-0.5 rounded-sm">
            {line.sport}
          </span>
          <span className="text-xs text-text-tertiary">{line.time}</span>
        </div>
        <span className="text-[10px] text-text-muted uppercase tracking-wider">
          {line.period}
        </span>
      </div>

      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-semibold text-text-primary">
          {line.awayTeamCode}{' '}
          <span className="text-text-tertiary font-normal">{line.awayTeam}</span>
        </div>
        <span className="text-xs text-text-muted">@</span>
        <div className="text-sm font-semibold text-text-primary text-right">
          <span className="text-text-tertiary font-normal">{line.homeTeam}</span>{' '}
          {line.homeTeamCode}
        </div>
      </div>

      {/* Lines Table */}
      <div className="grid grid-cols-5 gap-1 text-center">
        <div className="text-[10px] text-text-tertiary uppercase font-semibold py-1">
          M.L
        </div>
        <div className="text-[10px] text-text-tertiary uppercase font-semibold py-1">
          R.L
        </div>
        <div className="text-[10px] text-text-tertiary uppercase font-semibold py-1">
          Spread
        </div>
        <div className="text-[10px] text-text-tertiary uppercase font-semibold py-1">
          Solo
        </div>
        <div className="text-[10px] text-text-tertiary uppercase font-semibold py-1">
          Puntos
        </div>

        {/* Away row */}
        <LineCell
          value={line.moneyLine.away}
          onClick={() => handleCellClick('ML', line.moneyLine.away)}
          type="odds"
        />
        <LineCell
          value={`${line.runLine.away >= 0 ? '+' : ''}${line.runLine.away}`}
          onClick={() => handleCellClick('RL', line.runLine.away)}
        />
        <LineCell
          value={`${line.spread.away >= 0 ? '+' : ''}${line.spread.away}`}
          onClick={() => handleCellClick('Spread', line.spread.away, line.spread.away)}
        />
        <LineCell
          value={line.solo.away}
          onClick={() => handleCellClick('Solo', line.solo.away)}
          type="odds"
        />
        <LineCell
          value={`O ${line.points.over}`}
          onClick={() => handleCellClick('Over', line.points.over, line.points.value)}
          type="over"
        />

        {/* Home row */}
        <LineCell
          value={line.moneyLine.home}
          onClick={() => handleCellClick('ML', line.moneyLine.home)}
          type="odds"
        />
        <LineCell
          value={`${line.runLine.home >= 0 ? '+' : ''}${line.runLine.home}`}
          onClick={() => handleCellClick('RL', line.runLine.home)}
        />
        <LineCell
          value={`${line.spread.home >= 0 ? '+' : ''}${line.spread.home}`}
          onClick={() => handleCellClick('Spread', line.spread.home, line.spread.home)}
        />
        <LineCell
          value={line.solo.home}
          onClick={() => handleCellClick('Solo', line.solo.home)}
          type="odds"
        />
        <LineCell
          value={`U ${line.points.under}`}
          onClick={() => handleCellClick('Under', line.points.under, line.points.value)}
          type="under"
        />
      </div>
    </motion.div>
  );
}

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

  let colorClass = 'text-text-primary';
  if (type === 'odds') {
    colorClass = numVal >= 0 ? 'text-accent-green' : 'text-accent-red';
  } else if (type === 'over') {
    colorClass = 'text-accent-green';
  } else if (type === 'under') {
    colorClass = 'text-accent-red';
  }

  return (
    <button
      onClick={onClick}
      className={`py-1.5 rounded-sm font-mono text-mono hover:bg-accent-blue/10 hover:cursor-pointer transition-colors ${colorClass}`}
    >
      {display}
    </button>
  );
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
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
