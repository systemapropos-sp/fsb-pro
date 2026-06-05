import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen } from 'lucide-react';

interface Rule {
  id: number;
  text: string;
}

interface SportRules {
  sport: string;
  icon: string;
  rules: Rule[];
}

const sportsRules: SportRules[] = [
  {
    sport: 'Beisbol (MLB)',
    icon: '\u26BE',
    rules: [
      { id: 1, text: 'El partido debe completar al menos 5 innings (4.5 si el equipo local va ganando) para que las apuestas sean validas.' },
      { id: 2, text: 'Si el pitcher anunciado no inicia el partido, las apuestas de ganador del partido siguen siendo validas.' },
      { id: 3, text: 'Las apuestas de run line incluyen innings extras.' },
      { id: 4, text: 'El mercado de alta/baja se decide sobre el total de carreras de ambos equipos.' },
      { id: 5, text: 'Si el partido es suspendido y no se reanuda dentro de 24 horas, las apuestas se anulan (excepto mercados ya decididos).' },
    ],
  },
  {
    sport: 'Futbol (NFL/NCAA)',
    icon: '\u{1F3C8}',
    rules: [
      { id: 1, text: 'El partido debe completar 55 minutos para que las apuestas sean validas.' },
      { id: 2, text: 'Las apuestas de spread incluyen overtime.' },
      { id: 3, text: 'Las apuestas de medio tiempo solo consideran los primeros dos cuartos.' },
      { id: 4, text: 'Si hay cambio de venue, las apuestas se mantienen si el equipo local sigue siendo el mismo.' },
      { id: 5, text: 'Los mercados de jugador se basan en estadisticas oficiales de la liga.' },
    ],
  },
  {
    sport: 'Baloncesto (NBA/NCAA)',
    icon: '\u{1F3C0}',
    rules: [
      { id: 1, text: 'El partido debe completar al menos 43 minutos para que las apuestas sean validas.' },
      { id: 2, text: 'Las apuestas de spread y total incluyen overtime.' },
      { id: 3, text: 'Las apuestas de medio tiempo se deciden al final del segundo cuarto.' },
      { id: 4, text: 'Los mercados de jugador requieren que el jugador participe para ser validos.' },
      { id: 5, text: 'Si un partido es suspendido y no se completa en 48 horas, las apuestas se anulan.' },
    ],
  },
  {
    sport: 'Futbol Soccer',
    icon: '\u26BD',
    rules: [
      { id: 1, text: 'Las apuestas se basan en el resultado despues de 90 minutos mas tiempo anadido (no incluye tiempo extra).' },
      { id: 2, text: 'Si un partido es abandonado despues de los 90 minutos, el resultado oficial cuenta.' },
      { id: 3, text: 'Las apuestas de ambos equipos anotan se deciden en los 90 minutos regulares.' },
      { id: 4, text: 'Los mercados de tarjetas y corners se basan en estadisticas oficiales del arbitro.' },
      { id: 5, text: 'Si hay cambio de venue a campo neutral, las apuestas se mantienen.' },
    ],
  },
  {
    sport: 'Hockey (NHL)',
    icon: '\u{1F3D2}',
    rules: [
      { id: 1, text: 'Las apuestas de ganador del partido incluyen overtime y shootouts.' },
      { id: 2, text: 'El mercado de puck line es un spread de +1.5 / -1.5 goles.' },
      { id: 3, text: 'Las apuestas de periodo se deciden al final de cada periodo de 20 minutos.' },
      { id: 4, text: 'Si un partido es suspendido, las apuestas se mantienen si se reanuda dentro de 24 horas.' },
      { id: 5, text: 'Los mercados de goleadores requieren que el jugador este en la alineacion oficial.' },
    ],
  },
];

export default function Reglas() {
  const [activeSport, setActiveSport] = useState(0);

  return (
    <div className="p-8 bg-[#F1F5F9] min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
          <BookOpen size={20} className="text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#1E293B] mb-1">Reglas de Apuestas</h1>
          <p className="text-[#475569]">Reglas de apuestas por deporte. Texto detallado en espanol.</p>
        </div>
      </div>

      {/* Card */}
      <div className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden">
        {/* Sport Tabs */}
        <div className="flex border-b border-gray-200 overflow-x-auto">
          {sportsRules.map((sr, idx) => (
            <button
              key={sr.sport}
              onClick={() => setActiveSport(idx)}
              className={`relative px-5 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
                activeSport === idx
                  ? 'text-blue-600'
                  : 'text-gray-600 bg-gray-100 hover:bg-gray-50'
              }`}
            >
              <span className="mr-2">{sr.icon}</span>
              {sr.sport}
              {activeSport === idx && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Rules List */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSport}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <h2 className="text-lg font-semibold text-[#1E293B] mb-4">
                <span className="mr-2">{sportsRules[activeSport].icon}</span>
                {sportsRules[activeSport].sport}
              </h2>
              <ol className="space-y-3">
                {sportsRules[activeSport].rules.map((rule) => (
                  <li
                    key={rule.id}
                    className="flex gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-blue-600">
                      {rule.id}
                    </span>
                    <p className="text-[#475569] leading-relaxed pt-1">{rule.text}</p>
                  </li>
                ))}
              </ol>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
