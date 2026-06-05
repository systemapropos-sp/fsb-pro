import { useState, useEffect, useCallback } from "react";
import {
  Search,
  DollarSign,
  CheckCircle2,
  XCircle,
  Ticket,
  Calendar,
  User,
  Hash,
  Award,
  Printer,
  RotateCcw,
} from "lucide-react";

interface TicketDetail {
  id: string;
  code: string;
  date: string;
  time: string;
  customer: string;
  seller: string;
  status: "ganador" | "perdedor" | "pendiente";
  picks: { event: string; selection: string; odds: string; result: string }[];
  risk: number;
  toWin: number;
  totalPayout: number;
}

const mockTicketDB: Record<string, TicketDetail> = {
  "TK-784521": {
    id: "T-001",
    code: "TK-784521",
    date: "2024-01-15",
    time: "14:30",
    customer: "Juan Perez",
    seller: "Carlos Ruiz",
    status: "ganador",
    picks: [
      { event: "MLB: NYY vs BOS", selection: "Yankees -1.5", odds: "+130", result: "Gano" },
      { event: "NBA: LAL vs SAC", selection: "Lakers -6.5", odds: "-110", result: "Gano" },
      { event: "NFL: DAL vs PHI", selection: "Cowboys -4.5", odds: "-110", result: "Gano" },
    ],
    risk: 500,
    toWin: 1250,
    totalPayout: 1750,
  },
  "TK-784527": {
    id: "T-007",
    code: "TK-784527",
    date: "2024-01-13",
    time: "20:00",
    customer: "Diego Hernandez",
    seller: "Luis Torres",
    status: "ganador",
    picks: [
      { event: "NFL: KC vs DEN", selection: "Chiefs -3.0", odds: "-150", result: "Gano" },
      { event: "MLB: HOU vs TEX", selection: "Astros ML", odds: "-180", result: "Gano" },
    ],
    risk: 450,
    toWin: 1125,
    totalPayout: 1575,
  },
};

function PaidStamp() {
  return (
    <div className="absolute top-4 right-4 transform rotate-[-15deg]">
      <div className="border-4 border-red-400 rounded-lg px-4 py-2 bg-red-50/80">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-6 h-6 text-red-500" />
          <span className="text-xl font-black text-red-500 tracking-widest uppercase">Pagado</span>
        </div>
      </div>
    </div>
  );
}

// Simple confetti particles
function ConfettiEffect({ active }: { active: boolean }) {
  const [particles] = useState(() =>
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 0.5}s`,
      color: ["#ef4444", "#22c55e", "#3b82f6", "#f59e0b", "#8b5cf6", "#ec4899"][
        Math.floor(Math.random() * 6)
      ],
    }))
  );

  if (!active) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute w-2 h-2 rounded-sm animate-bounce"
          style={{
            left: p.left,
            top: "-10px",
            backgroundColor: p.color,
            animation: `confetti-fall 2s ${p.delay} ease-out forwards`,
          }}
        />
      ))}
      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(-10px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

export default function Pagar() {
  const [searchCode, setSearchCode] = useState("");
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [paid, setPaid] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const handleSearch = useCallback(() => {
    setPaid(false);
    setShowConfetti(false);
    const trimmed = searchCode.trim().toUpperCase();
    if (!trimmed) {
      setTicket(null);
      setNotFound(false);
      return;
    }
    const found = mockTicketDB[trimmed];
    if (found) {
      setTicket(found);
      setNotFound(false);
    } else {
      setTicket(null);
      setNotFound(true);
    }
  }, [searchCode]);

  const handlePay = () => {
    setPaid(true);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 2500);
  };

  const handleReset = () => {
    setSearchCode("");
    setTicket(null);
    setNotFound(false);
    setPaid(false);
    setShowConfetti(false);
  };

  useEffect(() => {
    if (searchCode === "") {
      setNotFound(false);
    }
  }, [searchCode]);

  return (
    <div className="p-6 max-w-[900px] mx-auto">
      <ConfettiEffect active={showConfetti} />

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1E293B]">Pagar</h1>
        <p className="text-[#475569] mt-1">
          Ingrese el codigo de ticket para buscar y pagar.
        </p>
      </div>

      {/* Search Card */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-xl p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Ej: TK-784521"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="w-full pl-11 pr-4 py-3 bg-white border border-gray-300 rounded-lg text-lg text-[#1E293B] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-['JetBrains_Mono']"
            />
          </div>
          <button
            onClick={handleSearch}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 hover:shadow-md hover:-translate-y-0.5 transition-all shadow-sm"
          >
            <Search className="w-5 h-5" />
            Buscar
          </button>
          <button
            onClick={handleReset}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-[#475569] rounded-lg font-medium hover:bg-gray-200 hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            Limpiar
          </button>
        </div>

        {notFound && (
          <div className="mt-4 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600">
            <XCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">No se encontro ningun ticket con el codigo <span className="font-bold font-['JetBrains_Mono']">{searchCode}</span>.</p>
          </div>
        )}
      </div>

      {/* Ticket Details */}
      {ticket && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-xl overflow-hidden relative">
          {paid && <PaidStamp />}

          {/* Ticket Header */}
          <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Ticket className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-lg font-bold text-[#1E293B] font-['JetBrains_Mono']">{ticket.code}</p>
                  <p className="text-xs text-[#94A3B8]">ID: {ticket.id}</p>
                </div>
              </div>
              <div
                className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                  ticket.status === "ganador"
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : ticket.status === "perdedor"
                    ? "bg-red-50 text-red-700 border border-red-200"
                    : "bg-amber-50 text-amber-700 border border-amber-200"
                }`}
              >
                {ticket.status === "ganador" ? "GANADOR" : ticket.status === "perdedor" ? "PERDEDOR" : "PENDIENTE"}
              </div>
            </div>
          </div>

          {/* Ticket Info */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#94A3B8]" />
                <div>
                  <p className="text-xs text-[#94A3B8]">Fecha</p>
                  <p className="text-sm font-medium text-[#1E293B]">{ticket.date} — {ticket.time}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-[#94A3B8]" />
                <div>
                  <p className="text-xs text-[#94A3B8]">Cliente</p>
                  <p className="text-sm font-medium text-[#1E293B]">{ticket.customer}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-[#94A3B8]" />
                <div>
                  <p className="text-xs text-[#94A3B8]">Vendedor</p>
                  <p className="text-sm font-medium text-[#1E293B]">{ticket.seller}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Picks */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-[#1E293B] mb-3 uppercase tracking-wider">Selecciones</h3>
            <div className="space-y-2">
              {ticket.picks.map((pick, idx) => (
                <div
                  key={idx}
                  className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center justify-between"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#1E293B]">{pick.event}</p>
                    <p className="text-xs text-[#475569]">{pick.selection}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-[#1E293B] font-['JetBrains_Mono']">{pick.odds}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-bold ${
                        pick.result === "Gano"
                          ? "bg-green-50 text-green-700"
                          : pick.result === "Perdio"
                          ? "bg-red-50 text-red-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {pick.result}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-xs text-[#94A3B8] mb-1">Riesgo</p>
                <p className="text-lg font-bold text-red-500 font-['JetBrains_Mono']">${ticket.risk.toLocaleString()}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-[#94A3B8] mb-1">A Ganar</p>
                <p className="text-lg font-bold text-green-600 font-['JetBrains_Mono']">${ticket.toWin.toLocaleString()}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-[#94A3B8] mb-1">Pago Total</p>
                <p className="text-lg font-bold text-[#1E293B] font-['JetBrains_Mono']">${ticket.totalPayout.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 py-4 flex items-center justify-between">
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-[#475569] rounded-lg font-medium hover:bg-gray-200 hover:shadow-md hover:-translate-y-0.5 transition-all">
              <Printer className="w-4 h-4" />
              Imprimir
            </button>

            {!paid && ticket.status === "ganador" && (
              <button
                onClick={handlePay}
                className="flex items-center gap-2 px-8 py-3 bg-green-500 text-white rounded-lg font-bold text-lg shadow-sm hover:bg-green-600 hover:shadow-lg transition-all duration-150 hover:-translate-y-0.5"
              >
                <DollarSign className="w-5 h-5" />
                Pagar ${ticket.totalPayout.toLocaleString()}
              </button>
            )}

            {paid && (
              <div className="flex items-center gap-2 px-6 py-3 bg-green-50 border border-green-200 rounded-lg text-green-700 font-bold">
                <CheckCircle2 className="w-5 h-5" />
                Pago Completado
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
