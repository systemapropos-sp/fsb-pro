import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SportRules {
  key: string;
  label: string;
  rules: string[];
}

const SPORTS_RULES: SportRules[] = [
  {
    key: 'baseball',
    label: 'Baseball',
    rules: [
      'Todas las apuestas a mas (+) o menos (-) seran validas cuando el equipo que este perdiendo haya agotado su novena (9na.) entrada. Si el partido se encuentra empatado, para que sea valido debera haberse jugado un minimo de nueve entradas completas.',
      'Todas las apuestas al run line (-1.5) y al money line (J.C.) seran validas cuando el equipo que este perdiendo haya bateado su quinta (5ta.) entrada. Si el partido se encuentra empatado, para que sea valido debera haberse jugado un minimo de cinco entradas completas.',
      'Todas las apuestas a juego en el medio tiempo seran validas cuando el equipo que este perdiendo haya bateado su quinta (5ta.) entrada. Si el partido se encuentra empatado, para que sea valido debera haberse jugado un minimo de cinco entradas completas.',
      'Las jugadas a mas (+) o menos (-) en el medio tiempo seran validas cuando se hayan jugado cinco entradas completas.',
      'Todas las apuestas a carrera por equipo individual (al solo) seran validas cuando el equipo que este perdiendo haya bateado su novena (9na.) entrada. Si el partido se encuentra empatado, para que sea valido debera haberse jugado un minimo de nueve entradas completas.',
      'La apuestas a primera carrera (F) seran validas al equipo que anote primero, siempre y cuando se haya completado la primera entrada completa.',
      'Las jugadas a ponches seran validas cuando el juego sea oficial (5 entradas completas). El pitcher debe lanzar al menos un pitch para que la apuesta sea valida.',
      'Las propuestas de decisiones (si o no) seran validas cuando se haya agotado el inning completo.',
      'Las apuestas a bases recorridas seran validas cuando el equipo que este perdiendo haya bateado su quinta (5ta.) entrada.',
    ],
  },
  {
    key: 'baloncesto',
    label: 'Baloncesto',
    rules: [
      'Un juego de baloncesto debe completar al menos 43 minutos de juego para ser considerado oficial (NBA).',
      'Las apuestas de spread y total incluyen tiempos extras a menos que se especifique lo contrario.',
      'Si un juego es suspendido y no se reanuda dentro de 24 horas, las apuestas se reembolsan (push).',
      'Las apuestas a medio tiempo solo aplican a los primeros dos cuartos del juego.',
    ],
  },
  {
    key: 'football',
    label: 'Football',
    rules: [
      'Un juego de football americano debe completar 55 minutos para ser considerado oficial (NFL).',
      'Las apuestas de spread y total incluyen tiempos extras.',
      'Si un juego es suspendido y se reprograma para mas de 7 dias despues, las apuestas se reembolsan.',
      'Las apuestas a medio tiempo incluyen el segundo y tercer cuarto solamente.',
    ],
  },
  {
    key: 'hockey',
    label: 'Hockey',
    rules: [
      'Un juego de hockey debe completar al menos 55 minutos para ser considerado oficial.',
      'Las apuestas de money line incluyen tiempo extra y shootouts para determinar el ganador.',
      'Las apuestas de puck line (spread) incluyen tiempo extra pero no shootouts.',
      'Las apuestas de total (over/under) incluyen tiempo extra y shootouts.',
    ],
  },
  {
    key: 'soccer',
    label: 'Soccer',
    rules: [
      'Un juego de soccer debe completar 90 minutos de tiempo reglamentario para ser oficial.',
      'Las apuestas a tiempo reglamentario NO incluyen tiempo extra ni penales, salvo que se indique lo contrario.',
      'Las apuestas de empate (3-way money line) son validas solo para el resultado al final del tiempo reglamentario.',
      'Si un juego es suspendido antes de completar los 90 minutos y no se reanuda dentro de 24 horas, las apuestas se reembolsan.',
    ],
  },
  {
    key: 'tiza',
    label: 'Tiza',
    rules: [
      'Las apuestas de tiza son acumulativas y requieren que todas las selecciones ganen para que el parlay sea ganador.',
      'Si una seleccion empata (push), se elimina del parlay y se recalcula el pago con las selecciones restantes.',
      'Un parlay de 2 equipos con un push se convierte automaticamente en una apuesta directa.',
      'El pago maximo por parlay esta sujeto a los limites establecidos por el administrador.',
      'No se pueden combinar selecciones del mismo juego en un mismo parlay.',
    ],
  },
];

const easeSpring = [0.16, 1, 0.3, 1] as [number, number, number, number];

export default function Reglas() {
  const [activeSport, setActiveSport] = useState('baseball');

  const activeRules = SPORTS_RULES.find((s) => s.key === activeSport);

  return (
    <div className="p-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-5"
      >
        <h1 className="text-h2 text-text-primary">Reglas de Apuestas</h1>
        <p className="text-sm text-text-tertiary mt-1">
          Reglamento de apuestas por deporte
        </p>
      </motion.div>

      {/* Sport Tabs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25, delay: 0.1 }}
        className="flex flex-wrap gap-0 border-b border-border-subtle mb-5"
      >
        {SPORTS_RULES.map((sport) => {
          const isActive = activeSport === sport.key;
          return (
            <button
              key={sport.key}
              onClick={() => setActiveSport(sport.key)}
              className={`relative px-5 py-3 text-sm font-medium transition-colors duration-200 ${
                isActive
                  ? 'text-accent-blue'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              {sport.label}
              {isActive && (
                <motion.div
                  layoutId="reglas-tab-underline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-blue"
                  transition={{ duration: 0.25, ease: easeSpring }}
                />
              )}
            </button>
          );
        })}
      </motion.div>

      {/* Rules Content */}
      <AnimatePresence mode="wait">
        {activeRules && (
          <motion.div
            key={activeSport}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.25, ease: easeSpring }}
            className="gradient-panel rounded-lg border border-border-subtle p-6"
          >
            <h2 className="text-h3 text-text-primary mb-5 capitalize">
              {activeRules.label}
            </h2>

            <ol className="space-y-3">
              {activeRules.rules.map((rule, idx) => (
                <motion.li
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: idx * 0.04 }}
                  className="flex gap-3"
                >
                  <span className="shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-accent-blue/10 text-accent-blue text-xs font-bold mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-body text-text-secondary leading-relaxed">
                    {rule}
                  </p>
                </motion.li>
              ))}
            </ol>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
