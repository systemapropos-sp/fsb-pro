import { useState } from "react";
import {
  Trophy,
  Filter,
  Calendar,
  Activity,
  ChevronRight,
} from "lucide-react";

interface GameResult {
  id: string;
  sport: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  status: "live" | "final" | "upcoming";
  inning?: string;
  period?: string;
  timeRemaining?: string;
  innings?: { home: number[]; away: number[] };
}

const gameResults: GameResult[] = [
  {
    id: "G-001",
    sport: "MLB",
    league: "Major League Baseball",
    homeTeam: "New York Yankees",
    awayTeam: "Boston Red Sox",
    homeScore: 5,
    awayScore: 3,
    status: "live",
    inning: "7mo",
    innings: {
      home: [0, 1, 0, 2, 0, 1, 1],
      away: [0, 0, 2, 0, 1, 0, 0],
    },
  },
  {
    id: "G-002",
    sport: "MLB",
    league: "Major League Baseball",
    homeTeam: "LA Dodgers",
    awayTeam: "SF Giants",
    homeScore: 2,
    awayScore: 4,
    status: "live",
    inning: "5to",
    innings: {
      home: [0, 0, 1, 0, 1],
      away: [1, 0, 2, 1, 0],
    },
  },
  {
    id: "G-003",
    sport: "NBA",
    league: "National Basketball Association",
    homeTeam: "Miami Heat",
    awayTeam: "Boston Celtics",
    homeScore: 98,
    awayScore: 102,
    status: "final",
    period: "4to",
    timeRemaining: "FINAL",
  },
  {
    id: "G-004",
    sport: "NBA",
    league: "National Basketball Association",
    homeTeam: "LA Lakers",
    awayTeam: "GS Warriors",
    homeScore: 112,
    awayScore: 108,
    status: "final",
    period: "4to",
    timeRemaining: "FINAL",
  },
  {
    id: "G-005",
    sport: "NFL",
    league: "National Football League",
    homeTeam: "Dallas Cowboys",
    awayTeam: "Philadelphia Eagles",
    homeScore: 0,
    awayScore: 0,
    status: "upcoming",
    timeRemaining: "20:00",
  },
  {
    id: "G-006",
    sport: "MLB",
    league: "Major League Baseball",
    homeTeam: "Houston Astros",
    awayTeam: "Texas Rangers",
    homeScore: 7,
    awayScore: 6,
    status: "final",
    innings: {
      home: [1, 0, 2, 0, 1, 0, 3, 0],
      away: [0, 1, 0, 2, 0, 1, 2, 0],
    },
  },
];

const sportFilters = ["Todos", "MLB", "NBA", "NFL"];

function LiveIndicator() {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-600 text-xs font-bold">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
      </span>
      EN VIVO
    </span>
  );
}

function InningScoreboard({ innings }: { innings: { home: number[]; away: number[] } }) {
  const maxInnings = Math.max(innings.home.length, innings.away.length);
  const inningLabels = Array.from({ length: maxInnings }, (_, i) =>
    i < 9 ? `${i + 1}` : i === 9 ? "X" : `${i + 1}`
  );

  return (
    <div className="overflow-x-auto mt-3">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-2 py-1.5 text-left text-xs font-semibold text-[#475569] border border-gray-200">Equipo</th>
            {inningLabels.map((label, i) => (
              <th key={i} className="px-2 py-1.5 text-center text-xs font-semibold text-[#475569] border border-gray-200 w-8">
                {label}
              </th>
            ))}
            <th className="px-2 py-1.5 text-center text-xs font-bold text-[#1E293B] border border-gray-200 w-10">T</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="px-2 py-1.5 font-medium text-[#1E293B] border border-gray-200 bg-white">Visitante</td>
            {innings.away.map((score, i) => (
              <td key={i} className="px-2 py-1.5 text-center text-[#475569] border border-gray-200 bg-white">{score}</td>
            ))}
            <td className="px-2 py-1.5 text-center font-bold text-[#1E293B] border border-gray-200 bg-white">
              {innings.away.reduce((a, b) => a + b, 0)}
            </td>
          </tr>
          <tr>
            <td className="px-2 py-1.5 font-medium text-[#1E293B] border border-gray-200 bg-white">Local</td>
            {innings.home.map((score, i) => (
              <td key={i} className="px-2 py-1.5 text-center text-[#475569] border border-gray-200 bg-white">{score}</td>
            ))}
            <td className="px-2 py-1.5 text-center font-bold text-[#1E293B] border border-gray-200 bg-white">
              {innings.home.reduce((a, b) => a + b, 0)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default function Resultados() {
  const [activeSport, setActiveSport] = useState("Todos");

  const filteredGames =
    activeSport === "Todos"
      ? gameResults
      : gameResults.filter((g) => g.sport === activeSport);

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1E293B]">Resultados</h1>
          <p className="text-[#475569] mt-1">
            Resultados deportivos en vivo con marcadores por inning/periodo.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-[#475569] hover:shadow-md hover:-translate-y-0.5 transition-all shadow-sm">
            <Calendar className="w-4 h-4" />
            <span className="text-sm font-medium">Hoy</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-[#475569] hover:shadow-md hover:-translate-y-0.5 transition-all shadow-sm">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Filtrar</span>
          </button>
        </div>
      </div>

      {/* Sport Filter Pills */}
      <div className="flex items-center gap-2 mb-6">
        {sportFilters.map((sport) => (
          <button
            key={sport}
            onClick={() => setActiveSport(sport)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 hover:shadow-md hover:-translate-y-0.5 ${
              activeSport === sport
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-gray-100 text-[#475569] hover:bg-gray-200"
            }`}
          >
            {sport}
          </button>
        ))}
      </div>

      {/* Game Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredGames.map((game) => (
          <div
            key={game.id}
            className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* Card Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-[#94A3B8]" />
                <span className="text-xs font-semibold text-[#475569] uppercase tracking-wider">
                  {game.sport} — {game.league}
                </span>
              </div>
              {game.status === "live" && <LiveIndicator />}
              {game.status === "final" && (
                <span className="px-2.5 py-1 rounded-full bg-gray-100 text-[#475569] text-xs font-bold">
                  FINAL
                </span>
              )}
              {game.status === "upcoming" && (
                <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold">
                  PENDIENTE
                </span>
              )}
            </div>

            {/* Teams & Score */}
            <div className="px-4 py-4">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-[#475569]">
                    V
                  </div>
                  <span className="font-bold text-[#1E293B] text-base">{game.awayTeam}</span>
                </div>
                <span
                  className={`text-2xl font-bold font-['JetBrains_Mono'] ${
                    game.awayScore > game.homeScore ? "text-[#1E293B]" : "text-[#94A3B8]"
                  }`}
                >
                  {game.awayScore}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-[#475569]">
                    L
                  </div>
                  <span className="font-bold text-[#1E293B] text-base">{game.homeTeam}</span>
                </div>
                <span
                  className={`text-2xl font-bold font-['JetBrains_Mono'] ${
                    game.homeScore > game.awayScore ? "text-[#1E293B]" : "text-[#94A3B8]"
                  }`}
                >
                  {game.homeScore}
                </span>
              </div>

              {game.inning && (
                <div className="flex items-center gap-1 mt-2 text-xs text-[#94A3B8]">
                  <Activity className="w-3 h-3" />
                  {game.inning} inning
                </div>
              )}
              {game.timeRemaining && game.status === "final" && (
                <div className="flex items-center gap-1 mt-2 text-xs text-[#94A3B8]">
                  <ChevronRight className="w-3 h-3" />
                  {game.timeRemaining}
                </div>
              )}
            </div>

            {/* Inning Detail Scoreboard */}
            {game.innings && <InningScoreboard innings={game.innings} />}
          </div>
        ))}
      </div>
    </div>
  );
}
