import { useState } from "react";
import {
  Filter,
  Star,
  ChevronDown,
  TrendingUp,
} from "lucide-react";

interface BettingLine {
  id: string;
  sport: string;
  league: string;
  period: string;
  gameTime: string;
  rotation: string;
  team: string;
  teamCode: string;
  spread: string;
  spreadOdds: string;
  moneyline: string;
  total: string;
  totalOdds: string;
  isFavorite: boolean;
}

const linesData: BettingLine[] = [
  {
    id: "L-001",
    sport: "NBA",
    league: "NBA",
    period: "Juego Completo",
    gameTime: "19:30",
    rotation: "2003",
    team: "New York Knicks",
    teamCode: "NYK",
    spread: "-3.5",
    spreadOdds: "-110",
    moneyline: "-165",
    total: "O 218.5",
    totalOdds: "-110",
    isFavorite: true,
  },
  {
    id: "L-002",
    sport: "NBA",
    league: "NBA",
    period: "Juego Completo",
    gameTime: "19:30",
    rotation: "2004",
    team: "Brooklyn Nets",
    teamCode: "BKN",
    spread: "+3.5",
    spreadOdds: "-110",
    moneyline: "+140",
    total: "U 218.5",
    totalOdds: "-110",
    isFavorite: false,
  },
  {
    id: "L-003",
    sport: "NBA",
    league: "NBA",
    period: "Juego Completo",
    gameTime: "22:00",
    rotation: "2005",
    team: "LA Lakers",
    teamCode: "LAL",
    spread: "-6.5",
    spreadOdds: "-115",
    moneyline: "-250",
    total: "O 225.0",
    totalOdds: "-110",
    isFavorite: true,
  },
  {
    id: "L-004",
    sport: "NBA",
    league: "NBA",
    period: "Juego Completo",
    gameTime: "22:00",
    rotation: "2006",
    team: "Sacramento Kings",
    teamCode: "SAC",
    spread: "+6.5",
    spreadOdds: "-105",
    moneyline: "+205",
    total: "U 225.0",
    totalOdds: "-110",
    isFavorite: false,
  },
  {
    id: "L-005",
    sport: "MLB",
    league: "MLB",
    period: "Juego Completo",
    gameTime: "18:10",
    rotation: "1001",
    team: "NY Yankees",
    teamCode: "NYY",
    spread: "-1.5",
    spreadOdds: "+130",
    moneyline: "-180",
    total: "O 8.5",
    totalOdds: "-110",
    isFavorite: true,
  },
  {
    id: "L-006",
    sport: "MLB",
    league: "MLB",
    period: "Juego Completo",
    gameTime: "18:10",
    rotation: "1002",
    team: "Boston Red Sox",
    teamCode: "BOS",
    spread: "+1.5",
    spreadOdds: "-150",
    moneyline: "+155",
    total: "U 8.5",
    totalOdds: "-110",
    isFavorite: false,
  },
  {
    id: "L-007",
    sport: "NFL",
    league: "NFL",
    period: "Juego Completo",
    gameTime: "13:00",
    rotation: "3001",
    team: "Dallas Cowboys",
    teamCode: "DAL",
    spread: "-4.5",
    spreadOdds: "-110",
    moneyline: "-200",
    total: "O 47.5",
    totalOdds: "-110",
    isFavorite: true,
  },
  {
    id: "L-008",
    sport: "NFL",
    league: "NFL",
    period: "Juego Completo",
    gameTime: "13:00",
    rotation: "3002",
    team: "Philadelphia Eagles",
    teamCode: "PHI",
    spread: "+4.5",
    spreadOdds: "-110",
    moneyline: "+170",
    total: "U 47.5",
    totalOdds: "-110",
    isFavorite: false,
  },
];

const sports = ["Todos", "NBA", "MLB", "NFL", "NHL", "SOCCER"];
const periods = ["Juego Completo", "1ra Mitad", "2da Mitad", "1er Periodo", "En Vivo"];

export default function Lineas() {
  const [activeSport, setActiveSport] = useState("Todos");
  const [activePeriod, setActivePeriod] = useState("Juego Completo");

  const filteredLines =
    activeSport === "Todos"
      ? linesData
      : linesData.filter((l) => l.sport === activeSport);

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1E293B]">Lineas</h1>
          <p className="text-[#475569] mt-1">
            Vista detallada de lineas por deporte con sub-tabs.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-[#475569] hover:shadow-md hover:-translate-y-0.5 transition-all shadow-sm">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Filtrar</span>
          </button>
        </div>
      </div>

      {/* Sport Filter Pills */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {sports.map((sport) => (
          <button
            key={sport}
            onClick={() => setActiveSport(sport)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 hover:shadow-md hover:-translate-y-0.5 ${
              activeSport === sport
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {sport}
          </button>
        ))}
      </div>

      {/* Period Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-6 pb-4 border-b border-gray-200">
        {periods.map((period) => (
          <button
            key={period}
            onClick={() => setActivePeriod(period)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-150 hover:shadow-sm hover:-translate-y-0.5 ${
              activePeriod === period
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {period}
          </button>
        ))}
      </div>

      {/* Lines Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-[#1E293B]">Lineas de Apuesta</h2>
          <div className="flex items-center gap-2 text-sm text-[#94A3B8]">
            <TrendingUp className="w-4 h-4" />
            {filteredLines.length} lineas disponibles
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#475569] uppercase tracking-wider">Hora</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#475569] uppercase tracking-wider">Rot</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#475569] uppercase tracking-wider">Equipo</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-[#475569] uppercase tracking-wider">Spread</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-[#475569] uppercase tracking-wider">Odds</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-[#475569] uppercase tracking-wider">Moneyline</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-[#475569] uppercase tracking-wider">Total</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-[#475569] uppercase tracking-wider">T. Odds</th>
              </tr>
            </thead>
            <tbody>
              {filteredLines.map((line) => (
                <tr
                  key={line.id}
                  className="border-b border-gray-100 hover:bg-blue-50 transition-colors duration-150"
                >
                  <td className="px-4 py-3 text-sm text-[#94A3B8] font-['JetBrains_Mono']">{line.gameTime}</td>
                  <td className="px-4 py-3 text-sm font-medium text-[#475569] font-['JetBrains_Mono']">{line.rotation}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {line.isFavorite && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />}
                      <div>
                        <div className="text-sm font-bold text-[#1E293B]">
                          {line.rotation} — {line.team}
                        </div>
                        <div className="text-xs text-[#94A3B8] font-['JetBrains_Mono']">{line.teamCode}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button className="px-3 py-1.5 bg-white border border-gray-200 rounded text-sm font-medium text-[#1E293B] font-['JetBrains_Mono'] hover:bg-blue-50 hover:border-blue-300 hover:shadow-sm active:scale-95 transition-all duration-150">
                      {line.spread}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button className="px-3 py-1.5 bg-white border border-gray-200 rounded text-sm text-[#475569] font-['JetBrains_Mono'] hover:bg-blue-50 hover:border-blue-300 hover:shadow-sm active:scale-95 transition-all duration-150">
                      {line.spreadOdds}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button className="px-3 py-1.5 bg-white border border-gray-200 rounded text-sm font-medium text-[#1E293B] font-['JetBrains_Mono'] hover:bg-blue-50 hover:border-blue-300 hover:shadow-sm active:scale-95 transition-all duration-150">
                      {line.moneyline}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button className="px-3 py-1.5 bg-white border border-gray-200 rounded text-sm font-medium text-[#1E293B] font-['JetBrains_Mono'] hover:bg-blue-50 hover:border-blue-300 hover:shadow-sm active:scale-95 transition-all duration-150">
                      {line.total}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button className="px-3 py-1.5 bg-white border border-gray-200 rounded text-sm text-[#475569] font-['JetBrains_Mono'] hover:bg-blue-50 hover:border-blue-300 hover:shadow-sm active:scale-95 transition-all duration-150">
                      {line.totalOdds}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Footer */}
      <div className="mt-4 flex items-center gap-2 text-xs text-[#94A3B8]">
        <ChevronDown className="w-3 h-3" />
        <span>Haz clic en cualquier valor para agregar al ticket de apuesta.</span>
      </div>
    </div>
  );
}
