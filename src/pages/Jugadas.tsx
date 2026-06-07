import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Printer } from 'lucide-react';

type Category = 'Primera Mitad' | 'Juego Completo' | 'Periodos Q1' | 'Periodos Q2' | 'Periodos Q3';

interface PlayType {
  id: number;
  description: string;
  code: string;
  category: Category;
}

const CATEGORY_COLORS: Record<Category | 'All', { bg: string; text: string; border: string }> = {
  'All': { bg: 'rgba(59,130,246,0.15)', text: '#3B82F6', border: 'rgba(59,130,246,0.3)' },
  'Primera Mitad': { bg: 'rgba(245,158,11,0.15)', text: '#F59E0B', border: 'rgba(245,158,11,0.3)' },
  'Juego Completo': { bg: 'rgba(59,130,246,0.15)', text: '#3B82F6', border: 'rgba(59,130,246,0.3)' },
  'Periodos Q1': { bg: 'rgba(6,182,212,0.15)', text: '#06B6D4', border: 'rgba(6,182,212,0.3)' },
  'Periodos Q2': { bg: 'rgba(139,92,246,0.15)', text: '#8B5CF6', border: 'rgba(139,92,246,0.3)' },
  'Periodos Q3': { bg: 'rgba(34,197,94,0.15)', text: '#22C55E', border: 'rgba(34,197,94,0.3)' },
};

const ALL_PLAYS: PlayType[] = [
  // Primera Mitad (1-6)
  { id: 1, description: 'Primera Mitad Money Line', code: 'HM', category: 'Primera Mitad' },
  { id: 2, description: 'Primera mitad', code: 'H', category: 'Primera Mitad' },
  { id: 3, description: 'Primera mitad a mas', code: 'H+', category: 'Primera Mitad' },
  { id: 4, description: 'Primera mitad a menos', code: 'H-', category: 'Primera Mitad' },
  { id: 5, description: 'Solo en primera mitad a mas', code: 'AH+', category: 'Primera Mitad' },
  { id: 6, description: 'Solo en primera mitad a menos', code: 'AH-', category: 'Primera Mitad' },
  // Juego Completo (7-21)
  { id: 7, description: 'Juego Completo', code: 'J', category: 'Juego Completo' },
  { id: 8, description: 'Run Line', code: 'R', category: 'Juego Completo' },
  { id: 9, description: 'Juego Completo Money Line', code: 'M', category: 'Juego Completo' },
  { id: 10, description: 'Juego a mas', code: '+', category: 'Juego Completo' },
  { id: 11, description: 'Juego a menos', code: '-', category: 'Juego Completo' },
  { id: 12, description: 'Equipo solo a mas', code: 'A+', category: 'Juego Completo' },
  { id: 13, description: 'Equipo solo a menos', code: 'A-', category: 'Juego Completo' },
  { id: 14, description: 'Super Run Line', code: 'S', category: 'Juego Completo' },
  { id: 15, description: 'Primera carrera', code: 'F', category: 'Juego Completo' },
  { id: 16, description: 'Ultima carrera', code: 'L', category: 'Juego Completo' },
  { id: 17, description: 'Anotan en el 1er Inning', code: 'Y', category: 'Juego Completo' },
  { id: 18, description: 'No anotan en el 1er Inning', code: 'N', category: 'Juego Completo' },
  { id: 19, description: 'Empate', code: 'E', category: 'Juego Completo' },
  { id: 20, description: 'Pitcher ponches a mas', code: 'K+', category: 'Juego Completo' },
  { id: 21, description: 'Pitcher ponches a menos', code: 'K-', category: 'Juego Completo' },
  // Periodos Q1 (22-27)
  { id: 22, description: 'Periodo #1 Money Line', code: 'Q1ML', category: 'Periodos Q1' },
  { id: 23, description: 'Periodo #1', code: 'Q1', category: 'Periodos Q1' },
  { id: 24, description: 'Periodo #1 a mas', code: 'Q1+', category: 'Periodos Q1' },
  { id: 25, description: 'Periodo #1 a menos', code: 'Q1-', category: 'Periodos Q1' },
  { id: 26, description: 'Periodo #1 equipo solo a mas', code: 'Q1S+', category: 'Periodos Q1' },
  { id: 27, description: 'Periodo #1 equipo solo a menos', code: 'Q1S-', category: 'Periodos Q1' },
  // Periodos Q2 (28-33)
  { id: 28, description: 'Periodo #2 Money Line', code: 'Q2ML', category: 'Periodos Q2' },
  { id: 29, description: 'Periodo #2', code: 'Q2', category: 'Periodos Q2' },
  { id: 30, description: 'Periodo #2 a mas', code: 'Q2+', category: 'Periodos Q2' },
  { id: 31, description: 'Periodo #2 a menos', code: 'Q2-', category: 'Periodos Q2' },
  { id: 32, description: 'Periodo #2 equipo solo a mas', code: 'Q2S+', category: 'Periodos Q2' },
  { id: 33, description: 'Periodo #2 equipo solo a menos', code: 'Q2S-', category: 'Periodos Q2' },
  // Periodos Q3 (34-39)
  { id: 34, description: 'Periodo #3 Money Line', code: 'Q3ML', category: 'Periodos Q3' },
  { id: 35, description: 'Periodo #3', code: 'Q3', category: 'Periodos Q3' },
  { id: 36, description: 'Periodo #3 a mas', code: 'Q3+', category: 'Periodos Q3' },
  { id: 37, description: 'Periodo #3 a menos', code: 'Q3-', category: 'Periodos Q3' },
  { id: 38, description: 'Periodo #3 equipo solo a mas', code: 'Q3S+', category: 'Periodos Q3' },
  { id: 39, description: 'Periodo #3 equipo solo a menos', code: 'Q3S-', category: 'Periodos Q3' },
];

const FILTER_PILLS: { label: string; value: 'All' | Category }[] = [
  { label: 'Todos', value: 'All' },
  { label: 'Primera Mitad', value: 'Primera Mitad' },
  { label: 'Juego Completo', value: 'Juego Completo' },
  { label: 'Periodos Q1', value: 'Periodos Q1' },
  { label: 'Periodos Q2', value: 'Periodos Q2' },
  { label: 'Periodos Q3', value: 'Periodos Q3' },
];

const easeSpring = [0.16, 1, 0.3, 1] as [number, number, number, number];

export default function Jugadas() {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<'All' | Category>('All');

  const filteredPlays = useMemo(() => {
    let result = [...ALL_PLAYS];
    if (activeFilter !== 'All') {
      result = result.filter((p) => p.category === activeFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.description.toLowerCase().includes(q) ||
          p.code.toLowerCase().includes(q)
      );
    }
    return result;
  }, [search, activeFilter]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="px-4 md:px-6 lg:px-8 py-5">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-start justify-between mb-4"
      >
        <div>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-semibold text-text-primary">Tipos de Jugadas</h1>
          <p className="text-sm text-text-tertiary mt-1">
            Referencia completa de tipos de jugadas y sus codigos
          </p>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 min-h-[44px] text-sm font-semibold text-text-secondary bg-[rgba(148,163,184,0.06)] border border-border-default rounded-md hover:bg-[rgba(148,163,184,0.12)] hover:text-text-primary transition-all duration-200 w-full sm:w-auto justify-center"
        >
          <Printer size={15} />
          Imprimir
        </button>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25, delay: 0.1 }}
        className="relative w-full md:max-w-md mb-4"
      >
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por codigo o descripcion..."
          className="w-full h-12 md:h-10 pl-9 pr-9 py-2.5 bg-[#EDEDED] border border-border-default rounded-md text-sm text-text-primary placeholder-text-tertiary outline-none transition-all duration-200 focus:border-accent-blue focus:ring-[0_0_0_3px_rgba(59,130,246,0.2)]"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary transition-colors"
          >
            <span className="text-xs">X</span>
          </button>
        )}
      </motion.div>

      {/* Category Filter Pills */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25, delay: 0.15 }}
        className="flex gap-2 overflow-x-auto flex-nowrap pb-2 mb-4 -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap md:overflow-visible"
      >
        {FILTER_PILLS.map((pill) => {
          const isActive = activeFilter === pill.value;
          const colors = CATEGORY_COLORS[pill.value];
          return (
            <button
              key={pill.value}
              onClick={() => setActiveFilter(pill.value)}
              className="px-4 py-1.5 min-h-[44px] text-sm font-medium rounded-full transition-all duration-200 flex-shrink-0"
              style={
                isActive
                  ? {
                      background: colors.bg,
                      color: colors.text,
                      border: `1px solid ${colors.border}`,
                    }
                  : {
                      background: 'transparent',
                      color: '#475569',
                      border: '1px solid transparent',
                    }
              }
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = '#94A3B8';
                  e.currentTarget.style.background = 'rgba(148,163,184,0.06)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = '#475569';
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              {pill.label}
            </button>
          );
        })}
      </motion.div>

      {/* Data Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: easeSpring, delay: 0.2 }}
        className="gradient-panel rounded-lg border border-border-subtle overflow-hidden"
      >
        {/* Table Header */}
        <div className="hidden md:grid grid-cols-[60px_1fr_100px_140px] gap-0 bg-[#EDEDED] backdrop-blur-sm border-b border-border-subtle">
          <div className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">
            #
          </div>
          <div className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">
            Descripcion
          </div>
          <div className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider text-center">
            Codigo
          </div>
          <div className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider text-center">
            Categoria
          </div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-border-subtle">
          <AnimatePresence mode="popLayout">
            {filteredPlays.map((play, idx) => {
              const colors = CATEGORY_COLORS[play.category];
              return (
                <motion.div
                  key={play.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.15, delay: idx * 0.02 }}
                  className="md:grid grid-cols-[60px_1fr_100px_140px] gap-0 items-center hover:bg-[rgba(59,130,246,0.04)] transition-colors duration-150 flex flex-col sm:flex-row sm:items-start p-4 md:p-0 border-b border-border-subtle md:border-0 gap-2 md:gap-0"
                  style={
                    idx % 2 === 1
                      ? { background: 'rgba(148,163,184,0.02)' }
                      : undefined
                  }
                >
                  <div className="px-4 py-2 text-sm font-mono text-text-tertiary font-bold md:font-normal">
                    {play.id}
                  </div>
                  <div className="px-4 py-2 text-sm text-text-primary flex-1">
                    {play.description}
                  </div>
                  <div className="px-4 py-2 text-center">
                    <span className="font-mono text-sm font-bold text-accent-blue">
                      {play.code}
                    </span>
                  </div>
                  <div className="px-4 py-2 flex justify-center">
                    <span
                      className="inline-block px-2.5 py-1 text-xs font-semibold rounded-full"
                      style={{
                        background: colors.bg,
                        color: colors.text,
                        border: `1px solid ${colors.border}`,
                      }}
                    >
                      {play.category}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Empty state */}
        {filteredPlays.length === 0 && (
          <div className="py-8 md:py-10 text-center">
            <p className="text-sm text-text-tertiary">
              No se encontraron jugadas que coincidan con la busqueda
            </p>
          </div>
        )}
      </motion.div>

      {/* Results count */}
      <p className="text-xs text-text-tertiary mt-3">
        Mostrando {filteredPlays.length} jugadas
      </p>

      {/* Category Legend */}
      <div className="flex flex-wrap gap-4 mt-4 justify-center md:justify-start">
        {(Object.keys(CATEGORY_COLORS) as Array<Category | 'All'>)
          .filter((k) => k !== 'All')
          .map((cat) => {
            const colors = CATEGORY_COLORS[cat];
            return (
              <div key={cat} className="flex items-center gap-1.5">
                <span
                  className="inline-block w-2.5 h-2.5 rounded-full"
                  style={{ background: colors.text }}
                />
                <span className="text-xs text-text-secondary">{cat}</span>
              </div>
            );
          })}
      </div>
    </div>
  );
}
