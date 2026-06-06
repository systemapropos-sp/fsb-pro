import { useState, useEffect, useCallback, useMemo } from 'react';
import SalesForm from '@/components/SalesForm';
import BettingLines from '@/components/BettingLines';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trash2,
  X,
  ClipboardList,
} from 'lucide-react';
import {
  formatOdds,
  getLines,
  seedLines,
  getSports,
  getPeriods,
  getSelectedPlays,
  addSelectedPlay,
  removeSelectedPlay,
  clearSelectedPlays,
  createTicket,
  addTransaction,
  formatDate,
  getTicketById,
  useCustomerCredit,
  type Play,
  type BettingLine,
  type Ticket,
} from '@/lib/storage';
import confetti from 'canvas-confetti';
import { toast } from 'react-hot-toast';

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
  const [createdTicket, setCreatedTicket] = useState<Ticket | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [selectedCustomerName, setSelectedCustomerName] = useState<string | null>(null);
  const [isCredit, setIsCredit] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

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

  // --- Validation: Business Rules ---
  // Rule 1: Cannot select the same team twice
  // Rule 2: Cannot select both teams from the same match
  const validatePlayAddition = (line: BettingLine, teamCode: string): boolean => {
    const currentPlays = getSelectedPlays();
    const isAway = line.awayTeamCode === teamCode;
    const opponentCode = isAway ? line.homeTeamCode : line.awayTeamCode;

    // Check if this exact team is already selected
    const teamAlreadySelected = currentPlays.some(
      (p) => p.teamCode.includes(teamCode)
    );
    if (teamAlreadySelected) {
      toast.error(`${isAway ? line.awayTeam : line.homeTeam} ya fue seleccionado`, {
        duration: 2000,
        icon: '⚠️',
      });
      return false;
    }

    // Check if the opponent from this same match is already selected
    const opponentAlreadySelected = currentPlays.some(
      (p) => p.teamCode.includes(opponentCode)
    );
    if (opponentAlreadySelected) {
      toast.error(
        `No puede seleccionar ambos equipos del mismo partido`,
        { duration: 2500, icon: '🚫' }
      );
      return false;
    }

    return true;
  };

  // --- Handlers ---
  const handleAddPlay = useCallback(
    (line: BettingLine, type: string, value: number, points: number = 0, teamCode?: string) => {
      const tc = teamCode || line.awayTeamCode;

      // Validate business rules
      if (!validatePlayAddition(line, tc)) return;

      const isAway = line.awayTeamCode === tc;
      const newPlay: Play = {
        id: `play-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        team: `${line.awayTeam} @ ${line.homeTeam}`,
        teamCode: `${line.awayTeamCode}/${line.homeTeamCode}`,
        playType: type,
        detail: `${isAway ? line.awayTeam : line.homeTeam} vs ${isAway ? line.homeTeam : line.awayTeam}`,
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

  // Auto-add play from form: looks up the team in lines[], extracts the correct value
  const handleAddPlayFromForm = useCallback(
    (teamCode: string, playCode: string) => {
      // Find the line that contains this team
      const line = lines.find(
        (l) => l.awayTeamCode === teamCode || l.homeTeamCode === teamCode
      );
      if (!line) return; // No line found for this team

      // Validate business rules (no repeat team, no both teams from same match)
      if (!validatePlayAddition(line, teamCode)) return;

      const isAway = line.awayTeamCode === teamCode;
      const teamName = isAway ? line.awayTeam : line.homeTeam;
      const opponentName = isAway ? line.homeTeam : line.awayTeam;

      // Map play code to the correct line value
      const upperCode = playCode.toUpperCase();
      let value = 0;
      let detail = `${teamName} vs ${opponentName}`;

      // Money Line variants
      if (
        ['M', 'J', 'HM', 'Q1ML', 'Q2ML', 'Q3ML', 'Q4ML'].includes(upperCode)
      ) {
        value = isAway ? line.moneyLine.away : line.moneyLine.home;
      }
      // Run Line / Handicap variants
      else if (
        ['R', 'H', 'Q1', 'Q2', 'Q3', 'Q4'].includes(upperCode)
      ) {
        value = isAway ? line.runLine.away : line.runLine.home;
      }
      // Super Run Line / Solo
      else if (upperCode === 'S') {
        value = isAway ? line.solo.away : line.solo.home;
      }
      // Over variants
      else if (
        ['+', 'H+', 'Q1+', 'Q2+', 'Q3+', 'Q4+', 'AH+'].includes(upperCode)
      ) {
        value = line.points.over;
        detail = `Over ${line.points.value} - ${teamName} vs ${opponentName}`;
      }
      // Under variants
      else if (
        ['-', 'H-', 'Q1-', 'Q2-', 'Q3-', 'Q4-', 'AH-'].includes(upperCode)
      ) {
        value = line.points.under;
        detail = `Under ${line.points.value} - ${teamName} vs ${opponentName}`;
      }
      // Spread / Team solo positive
      else if (
        ['A+', 'Q1S+', 'Q2S+', 'Q3S+', 'Q4S+'].includes(upperCode)
      ) {
        value = isAway ? line.spread.away : line.spread.home;
      }
      // Spread / Team solo negative
      else if (
        ['A-', 'Q1S-', 'Q2S-', 'Q3S-', 'Q4S-'].includes(upperCode)
      ) {
        value = isAway ? line.spread.home : line.spread.away;
      }
      // Special MLB codes (F, L, Y, N, E, K+, K-) — use moneyLine as default
      else {
        value = isAway ? line.moneyLine.away : line.moneyLine.home;
      }

      const newPlay: Play = {
        id: `play-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        team: `${teamName} @ ${opponentName}`,
        teamCode: isAway
          ? `${line.awayTeamCode}/${line.homeTeamCode}`
          : `${line.homeTeamCode}/${line.awayTeamCode}`,
        playType: playCode,
        detail,
        line: value,
        player: '',
        points: 0,
        odds: value,
        isIF: modeTab === 'teaserIF',
      };

      addSelectedPlay(newPlay);
      setSelectedPlays(getSelectedPlays());
    },
    [lines, modeTab, validatePlayAddition]
  );

  const handleClearAll = () => {
    clearSelectedPlays();
    setSelectedPlays([]);
    setShowConfirmClear(false);
    setCantidad('');
    setSuccessTicket(null);
    setCreatedTicket(null);
    setSelectedCustomerId(null);
    setSelectedCustomerName(null);
    setIsCredit(false);
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
        customerId: selectedCustomerId || undefined,
        customerName: selectedCustomerName || undefined,
        paymentType: isCredit ? 'credit' : 'cash',
      });

      // If credit ticket, charge customer's credit
      if (isCredit && selectedCustomerId) {
        useCustomerCredit(selectedCustomerId, cantidadNum);
      }

      addTransaction({
        ticketId: ticket.id,
        type: 'venta',
        amount: cantidadNum,
        date: formatDate(new Date()),
        seller: 'mmw03',
        description: `${isCredit ? 'Credito' : 'Cash'} - ${selectedCustomerName || 'Venta'} - Ticket ${ticket.id} (${selectedPlays.length} jugadas)`,
      });

      setSuccessTicket(ticket.id);
      setProcessingTicket(false);

      // Fetch the full ticket object for the receipt view
      const fullTicket = getTicketById(ticket.id);
      if (fullTicket) setCreatedTicket(fullTicket);

      // Notify other pages (Tickets, Pendientes) that a new ticket was created
      window.dispatchEvent(new CustomEvent('fsb:ticketCreated'));

      confetti({
        particleCount: 40,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#22C55E', '#3B82F6', '#06B6D4'],
        disableForReducedMotion: true,
      });

      setTimeout(() => {
        handleClearAll();
      }, 5000);
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
                        style={{ color: '#555555' }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = '#E53935'; e.currentTarget.style.background = 'rgba(229,57,53,0.1)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = '#555555'; e.currentTarget.style.background = 'transparent'; }}
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
    onAddPlayFromForm: handleAddPlayFromForm,
    createdTicket,
    onCustomerChange: (id: string | null, name: string | null) => {
      setSelectedCustomerId(id);
      setSelectedCustomerName(name);
    },
    selectedCustomerId,
    isCredit,
    setIsCredit,
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
          <div className="gradient-panel overflow-hidden h-full">
            <BettingLines
              lines={lines} sports={sports}
              selectedSport={selectedSport} onSelectSport={setSelectedSport}
              selectedPeriod={selectedPeriod} onSelectPeriod={setSelectedPeriod}
              lineView={lineView} onSetLineView={setLineView}
              currentTime={currentTime} refreshing={refreshing} onRefresh={handleRefresh}
              onAddPlay={handleAddPlay} setEquipo={setEquipo} getPeriods={getPeriods}
            />
          </div>
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
          <div className="gradient-panel overflow-hidden h-full">
            <BettingLines
              lines={lines} sports={sports}
              selectedSport={selectedSport} onSelectSport={setSelectedSport}
              selectedPeriod={selectedPeriod} onSelectPeriod={setSelectedPeriod}
              lineView={lineView} onSetLineView={setLineView}
              currentTime={currentTime} refreshing={refreshing} onRefresh={handleRefresh}
              onAddPlay={handleAddPlay} setEquipo={setEquipo} getPeriods={getPeriods}
            />
          </div>
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
                <BettingLines
                  lines={lines} sports={sports}
                  selectedSport={selectedSport} onSelectSport={setSelectedSport}
                  selectedPeriod={selectedPeriod} onSelectPeriod={setSelectedPeriod}
                  lineView={lineView} onSetLineView={setLineView}
                  currentTime={currentTime} refreshing={refreshing} onRefresh={handleRefresh}
                  onAddPlay={handleAddPlay} setEquipo={setEquipo} getPeriods={getPeriods}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

