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

      confetti({
        particleCount: 40,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00C853', '#FF3008', '#00B0FF'],
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
    <div className="sticky top-0 z-20 bg-white border-b border-dd-border-light flex md:hidden">
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
              ? 'text-dd-accent border-b-2 border-dd-accent bg-dd-accent/5'
              : 'text-dd-text-muted hover:text-dd-text-secondary'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );

  // --- Sales Form Content (shared) ---
  const SalesForm = () => (
    <div className="flex flex-col gap-3 p-3 md:p-4">
      {/* Seller Info */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <User size={14} className="text-dd-text-muted shrink-0" />
          <span className="text-xs text-dd-text-muted w-16">Vendedor:</span>
          <span className="text-sm font-semibold text-dd-text font-mono">
            mmw03
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-dd-text-muted shrink-0" />
          <span className="text-xs text-dd-text-muted w-16">Fecha:</span>
          <span className="text-xs text-dd-text-secondary">
            {formatDate(currentTime)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-dd-text-muted shrink-0" />
          <span className="text-xs text-dd-text-muted w-16">Hora:</span>
          <span className="text-xs text-dd-text-secondary font-mono">
            {formatTime(currentTime)}
          </span>
        </div>
      </div>

      <div className="border-t border-dd-border-light" />

      {/* Mode Tabs */}
      <div className="flex gap-1 p-1 rounded-lg bg-dd-surface/80">
        {(
          [
            ['teaser', 'Teaser'],
            ['teaserIF', 'Teaser IF'],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setModeTab(key)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 min-h-[40px] active:scale-95 ${
              modeTab === key
                ? 'bg-dd-accent/15 text-dd-text border border-dd-accent/30'
                : 'text-dd-text-muted hover:text-dd-text-secondary'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Form Fields */}
      <div className="space-y-3 md:space-y-2.5">
        <div>
          <label className="block text-xs text-dd-text-muted mb-1">
            Equipo
          </label>
          <input
            type="text"
            value={equipo}
            onChange={(e) => setEquipo(e.target.value)}
            placeholder="Nombre del equipo"
            className="input-clean w-full h-12 md:h-10"
          />
        </div>

        <div>
          <label className="block text-xs text-dd-text-muted mb-1">
            Jugada
          </label>
          <input
            type="text"
            value={jugada}
            onChange={(e) => setJugada(e.target.value)}
            placeholder="Tipo de jugada"
            className="input-clean w-full h-12 md:h-10"
          />
        </div>

        <div>
          <label className="block text-xs text-dd-text-muted mb-1">
            #Jug.Reg
          </label>
          <input
            type="text"
            readOnly
            value={selectedPlays.length.toString()}
            className="w-full rounded-lg border border-dd-border bg-dd-accent/5 px-3.5 py-2.5 text-sm font-mono text-dd-text h-12 md:h-10"
          />
        </div>

        <div>
          <label className="block text-xs text-dd-text-muted mb-1">
            Cantidad
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dd-text-muted font-mono text-lg">
              $
            </span>
            <input
              type="text"
              inputMode="decimal"
              value={cantidad}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9.]/g, '');
                setCantidad(val);
              }}
              placeholder="0.00"
              className="input-clean w-full pl-8 pr-4 py-2.5 text-right font-mono text-lg h-12 md:h-10"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-dd-text-muted mb-1">Pago</label>
          <div className="w-full rounded-lg border border-dd-border bg-dd-surface/40 px-3.5 py-2.5 text-right font-mono text-sm text-dd-green h-12 md:h-10 flex items-center justify-end">
            {formatAmount(pago)}
          </div>
        </div>

        <div>
          <label className="block text-xs text-dd-text-muted mb-1">
            Ganancia
          </label>
          <div className="w-full rounded-lg border border-dd-border bg-dd-surface/40 px-3.5 py-2.5 text-right font-mono text-sm text-dd-green h-12 md:h-10 flex items-center justify-end">
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
              className="space-y-3 md:space-y-2.5 border-t border-dd-accent/30 pt-2.5"
            >
              <div>
                <label className="block text-xs text-dd-accent mb-1">
                  Monto IF
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dd-text-muted font-mono text-lg">
                    $
                  </span>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="0.00"
                    className="input-clean w-full pl-8 pr-4 py-2.5 text-right font-mono text-lg border-dd-accent/30 focus:border-dd-accent focus:shadow-[0_0_0_3px_rgba(255,48,8,0.1)] h-12 md:h-10"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-dd-accent mb-1">
                  Pago con IF
                </label>
                <div className="w-full rounded-lg border border-dd-accent/30 bg-dd-accent-light px-3.5 py-2.5 text-right font-mono text-sm text-dd-accent h-12 md:h-10 flex items-center justify-end">
                  $0.00
                </div>
              </div>
              <div>
                <label className="block text-xs text-dd-accent mb-1">
                  Ganancia IF
                </label>
                <div className="w-full rounded-lg border border-dd-accent/30 bg-dd-accent-light px-3.5 py-2.5 text-right font-mono text-sm text-dd-accent h-12 md:h-10 flex items-center justify-end">
                  $0.00
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 pt-2">
        <button className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-semibold bg-dd-accent/10 text-dd-accent border border-dd-accent/25 hover:bg-dd-accent/20 transition-colors min-h-[40px] active:scale-95">
          <Calculator size={14} />
          Calc
        </button>
        <button
          onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
          className="px-3 py-2.5 rounded-lg text-xs font-semibold bg-dd-surface text-dd-text-secondary hover:text-dd-text transition-colors min-h-[40px] active:scale-95"
        >
          {language === 'es' ? 'ES | EN' : 'EN | ES'}
        </button>
        {showConfirmClear ? (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-dd-text-muted">
              Seguro? {selectedPlays.length} jugadas
            </span>
            <button
              onClick={handleClearAll}
              className="px-3 py-2 rounded text-xs bg-dd-red text-white min-h-[36px] active:scale-95"
            >
              Si
            </button>
            <button
              onClick={() => setShowConfirmClear(false)}
              className="px-3 py-2 rounded text-xs bg-dd-surface text-dd-text-secondary min-h-[36px] active:scale-95"
            >
              No
            </button>
          </div>
        ) : (
          <button
            onClick={() =>
              selectedPlays.length > 0 && setShowConfirmClear(true)
            }
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-semibold text-dd-red hover:bg-dd-red/10 transition-colors min-h-[40px] active:scale-95"
          >
            <Trash2 size={14} />
            Eliminar
          </button>
        )}
      </div>

      {/* Process Ticket Button */}
      <button
        onClick={handleProcessTicket}
        disabled={selectedPlays.length === 0 || cantidadNum <= 0 || processingTicket}
        className={`w-full mt-2 py-4 md:py-3 rounded-lg text-sm font-bold transition-all duration-200 min-h-[56px] active:scale-[0.98] ${
          selectedPlays.length > 0 && cantidadNum > 0 && !processingTicket
            ? 'bg-dd-green hover:bg-[#00B34A] text-white shadow-md hover:shadow-lg hover:brightness-105'
            : 'bg-dd-text-muted/20 text-dd-text-muted cursor-not-allowed'
        }`}
      >
        {processingTicket ? (
          <span className="flex items-center justify-center gap-2">
            <RefreshCw size={16} className="animate-spin" />
            Procesando...
          </span>
        ) : successTicket ? (
          <span className="flex items-center justify-center gap-2">
            <CheckIcon />
            Ticket #{successTicket}
          </span>
        ) : (
          'PROCESAR TICKET'
        )}
      </button>
    </div>
  );

  // --- Selected Plays Content (shared) ---
  const SelectedPlays = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 md:p-4 border-b border-dd-border-light shrink-0">
        <h2 className="text-base md:text-lg text-dd-text font-semibold mb-2">
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
                  ? 'bg-dd-accent/15 text-dd-accent border border-dd-accent/25'
                  : 'text-dd-text-muted hover:text-dd-text-secondary hover:bg-dd-surface/50'
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
              className="text-dd-text-muted/30 mb-3"
            />
            <p className="text-sm text-dd-text-secondary">
              Seleccione jugadas del panel derecho
            </p>
            <p className="text-xs text-dd-text-muted mt-1">
              Haga clic en una linea para agregarla
            </p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[400px]">
              <thead className="sticky top-0 z-10">
                <tr className="bg-dd-surface/90 text-xs font-semibold text-dd-text-secondary uppercase tracking-wider">
                  <th className="text-left px-3 py-2">Equipo</th>
                  <th className="text-left px-3 py-2">Jugada</th>
                  <th className="text-left px-3 py-2 hidden md:table-cell">Dato</th>
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
                      className={`border-b border-dd-border-light hover:bg-dd-surface/50 transition-colors ${
                        index % 2 === 0 ? 'bg-white' : 'bg-dd-surface/30'
                      }`}
                    >
                      <td className="px-3 py-2.5 text-sm text-dd-text">
                        <div className="font-medium">{play.teamCode}</div>
                        <div className="text-xs text-dd-text-muted truncate max-w-[120px] md:max-w-none">
                          {play.team}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-sm font-mono text-dd-accent">
                        {play.playType}
                      </td>
                      <td className="px-3 py-2.5 text-xs text-dd-text-secondary hidden md:table-cell">
                        {play.detail}
                      </td>
                      <td
                        className={`px-3 py-2.5 text-sm font-mono text-right ${
                          play.odds >= 0 ? 'text-dd-green' : 'text-dd-red'
                        }`}
                      >
                        {formatOdds(play.line)}
                      </td>
                      <td className="px-2 py-2.5 text-center">
                        <button
                          onClick={() => handleRemovePlay(play.id)}
                          className="w-10 h-10 rounded-full flex items-center justify-center text-dd-text-muted hover:text-dd-red hover:bg-dd-red/10 transition-colors active:scale-95"
                        >
                          <X size={16} />
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

      {/* Delete All */}
      {displayPlays.length > 0 && (
        <div className="p-3 border-t border-dd-border-light shrink-0">
          <button
            onClick={() => setShowConfirmClear(true)}
            className="flex items-center gap-1.5 text-xs text-dd-red hover:bg-dd-red/10 px-3 py-2.5 rounded-md transition-colors min-h-[40px] active:scale-95"
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
      <div className="shrink-0 bg-white/95 backdrop-blur-lg border-b border-dd-border-light z-10">
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
                    ? 'bg-dd-accent/15 text-dd-accent'
                    : 'text-dd-text-muted hover:text-dd-text-secondary'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5 md:gap-2">
            <span className="text-[10px] md:text-xs text-dd-text-muted font-mono hidden sm:inline">
              Actualizado: {formatTime(currentTime)}
            </span>
            <button
              onClick={handleRefresh}
              className={`w-10 h-10 md:w-8 md:h-8 rounded-lg flex items-center justify-center hover:bg-dd-surface text-dd-text-secondary transition-colors active:scale-95 ${
                refreshing ? 'animate-spin-once' : ''
              }`}
            >
              <RefreshCw size={15} />
            </button>
            <button className="w-10 h-10 md:w-8 md:h-8 rounded-lg flex items-center justify-center hover:bg-dd-surface text-dd-text-secondary transition-colors active:scale-95">
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
                  ? 'bg-dd-accent/15 text-dd-accent border border-dd-accent/25'
                  : 'text-dd-text-muted hover:text-dd-text-secondary hover:bg-dd-surface/50'
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
                  ? 'text-dd-accent border-b-2 border-dd-accent'
                  : 'text-dd-text-muted hover:text-dd-text-secondary'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* Game Cards */}
      <div ref={linesScrollRef} className="flex-1 overflow-y-auto min-h-0 py-2 bg-dd-dark">
        {lines.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 md:h-64 text-center px-8">
            <CalendarIcon size={48} className="text-dd-text-muted/30 mb-3" />
            <p className="text-sm text-dd-text-secondary">
              No hay juegos disponibles
            </p>
            <p className="text-xs text-dd-text-muted mt-1">
              Seleccione otro deporte o periodo
            </p>
          </div>
        ) : (
          <div className="space-y-1 px-2 md:px-3">
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
      <div className="shrink-0 flex justify-end gap-1 p-2 border-t border-dd-dark-hover bg-dd-dark">
        <button
          onClick={() => linesScrollRef.current?.scrollBy({ top: -200, behavior: 'smooth' })}
          className="w-9 h-9 md:w-7 md:h-7 rounded flex items-center justify-center hover:bg-dd-dark-hover text-dd-text-secondary active:scale-95"
        >
          <ChevronUp size={14} />
        </button>
        <button
          onClick={() => linesScrollRef.current?.scrollBy({ top: 200, behavior: 'smooth' })}
          className="w-9 h-9 md:w-7 md:h-7 rounded flex items-center justify-center hover:bg-dd-dark-hover text-dd-text-secondary active:scale-95"
        >
          <ChevronDown size={14} />
        </button>
      </div>
    </div>
  );

  // --- Render ---
  return (
    <div className="h-full flex flex-col">
      {/* Mobile Tab Bar - only visible on small screens */}
      <MobileTabBar />

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {/* Desktop Layout: 3 columns */}
        <div className="hidden xl:grid h-full grid-cols-[300px_1fr_1.2fr] gap-px bg-dd-border-light">
          {/* Left Panel */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] as [number, number, number, number], delay: 0.1 }}
            className="bg-white border-r border-dd-border-light overflow-y-auto"
          >
            <SalesForm />
          </motion.div>

          {/* Center Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] as [number, number, number, number], delay: 0.2 }}
            className="bg-white border-r border-dd-border-light overflow-hidden"
          >
            <SelectedPlays />
          </motion.div>

          {/* Right Panel - DARK betting lines */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] as [number, number, number, number], delay: 0.3 }}
            className="bg-dd-dark overflow-hidden"
          >
            <BettingLines />
          </motion.div>
        </div>

        {/* Tablet Layout: 2 columns */}
        <div className="hidden md:grid xl:hidden h-full grid-cols-[3fr_2fr] gap-px bg-dd-border-light">
          {/* Left+Center Combined */}
          <div className="flex flex-col border-r border-dd-border-light overflow-hidden">
            {/* Sales Form (top half) */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="bg-white border-b border-dd-border-light overflow-y-auto shrink-0 max-h-[45%]"
            >
              <SalesForm />
            </motion.div>
            {/* Selected Plays (bottom half) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="bg-white flex-1 overflow-hidden min-h-0"
            >
              <SelectedPlays />
            </motion.div>
          </div>

          {/* Right Panel (Lines) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="bg-dd-dark overflow-hidden"
          >
            <BettingLines />
          </motion.div>
        </div>

        {/* Mobile Layout: Tab-based single column */}
        <div className="md:hidden h-full bg-white overflow-y-auto">
          <AnimatePresence mode="wait">
            {mobileTab === 'apuesta' && (
              <motion.div
                key="apuesta"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.15 }}
                className="bg-white"
              >
                <SalesForm />
              </motion.div>
            )}
            {mobileTab === 'jugadas' && (
              <motion.div
                key="jugadas"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.15 }}
                className="bg-white h-full"
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
                className="bg-dd-dark h-full flex flex-col"
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

// --- GameCard: Dark panel with cyan header ---

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
      className={`transition-all duration-150 ${
        flash ? 'bg-dd-dark-hover/50' : ''
      }`}
    >
      {/* Cyan Header */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-dd-cyan/20 border-b border-dd-dark-hover">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-dd-cyan uppercase">
            {line.sport}
          </span>
          <span className="text-xs text-dd-text-muted">{line.time}</span>
        </div>
        <span className="text-[10px] text-dd-text-muted uppercase tracking-wider">
          {line.period}
        </span>
      </div>

      {/* Column Headers */}
      <div className="grid grid-cols-[1fr_56px_56px_56px_56px_56px] gap-px bg-dd-dark-hover">
        <div className="bg-dd-dark px-2 py-1">
          <span className="text-[9px] text-dd-text-muted uppercase font-semibold"></span>
        </div>
        {['M.L', 'R.L', 'Spread', 'Solo', 'Puntos'].map((label) => (
          <div key={label} className="bg-dd-dark px-1 py-1 text-center">
            <span className="text-[9px] text-dd-text-muted uppercase font-semibold">{label}</span>
          </div>
        ))}
      </div>

      {/* Away Team Row */}
      <div className="grid grid-cols-[1fr_56px_56px_56px_56px_56px] gap-px bg-dd-dark-hover">
        <div className="bg-dd-dark px-2 py-2 flex items-center gap-2">
          <span className="font-mono text-xs text-white font-medium">{line.awayTeamCode}</span>
          <span className="text-[10px] text-dd-text-muted">-</span>
          <span className="text-xs text-white/90">{line.awayTeam}</span>
        </div>
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
      </div>

      {/* Home Team Row */}
      <div className="grid grid-cols-[1fr_56px_56px_56px_56px_56px] gap-px bg-dd-dark-hover">
        <div className="bg-dd-dark-row px-2 py-2 flex items-center gap-2">
          <span className="font-mono text-xs text-white font-medium">{line.homeTeamCode}</span>
          <span className="text-[10px] text-dd-text-muted">-</span>
          <span className="text-xs text-white/90">{line.homeTeam}</span>
        </div>
        <LineCell
          value={line.moneyLine.home}
          onClick={() => handleCellClick('ML', line.moneyLine.home)}
          type="odds"
          alternateBg
        />
        <LineCell
          value={`${line.runLine.home >= 0 ? '+' : ''}${line.runLine.home}`}
          onClick={() => handleCellClick('RL', line.runLine.home)}
          alternateBg
        />
        <LineCell
          value={`${line.spread.home >= 0 ? '+' : ''}${line.spread.home}`}
          onClick={() => handleCellClick('Spread', line.spread.home, line.spread.home)}
          alternateBg
        />
        <LineCell
          value={line.solo.home}
          onClick={() => handleCellClick('Solo', line.solo.home)}
          type="odds"
          alternateBg
        />
        <LineCell
          value={`U ${line.points.under}`}
          onClick={() => handleCellClick('Under', line.points.under, line.points.value)}
          type="under"
          alternateBg
        />
      </div>
    </motion.div>
  );
}

function LineCell({
  value,
  onClick,
  type = 'normal',
  alternateBg = false,
}: {
  value: string | number;
  onClick: () => void;
  type?: 'normal' | 'odds' | 'over' | 'under';
  alternateBg?: boolean;
}) {
  const numVal = typeof value === 'string' ? parseFloat(value.replace(/[OU+\s]/g, '')) : value;
  const display = typeof value === 'string' ? value : formatOdds(value);

  let colorClass = 'text-white/80';
  if (type === 'odds') {
    colorClass = numVal >= 0 ? 'text-dd-green' : 'text-dd-red';
  } else if (type === 'over') {
    colorClass = 'text-dd-green';
  } else if (type === 'under') {
    colorClass = 'text-dd-red';
  }

  return (
    <button
      onClick={onClick}
      className={`py-2 font-mono text-[11px] hover:bg-dd-cyan/30 transition-colors min-h-[36px] flex items-center justify-center border border-transparent hover:border-dd-cyan/40 ${colorClass} ${
        alternateBg ? 'bg-dd-dark-row' : 'bg-dd-dark'
      }`}
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
