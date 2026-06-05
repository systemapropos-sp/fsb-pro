import { useState } from "react";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Users,
  Ticket,
} from "lucide-react";

interface VentaRow {
  id: string;
  fecha: string;
  hora: string;
  vendedor: string;
  clientes: number;
  tickets: number;
  ventas: number;
  ganancias: number;
  margen: number;
  tendencia: "up" | "down";
}

const ventasData: VentaRow[] = [
  {
    id: "V-001",
    fecha: "2024-01-15",
    hora: "14:30",
    vendedor: "Carlos Ruiz",
    clientes: 24,
    tickets: 45,
    ventas: 12850,
    ganancias: 2340,
    margen: 18.2,
    tendencia: "up",
  },
  {
    id: "V-002",
    fecha: "2024-01-15",
    hora: "12:15",
    vendedor: "Ana Martinez",
    clientes: 18,
    tickets: 32,
    ventas: 8750,
    ganancias: 1420,
    margen: 16.2,
    tendencia: "up",
  },
  {
    id: "V-003",
    fecha: "2024-01-14",
    hora: "18:45",
    vendedor: "Luis Torres",
    clientes: 31,
    tickets: 58,
    ventas: 22100,
    ganancias: 3890,
    margen: 17.6,
    tendencia: "down",
  },
  {
    id: "V-004",
    fecha: "2024-01-14",
    hora: "10:00",
    vendedor: "Carlos Ruiz",
    clientes: 15,
    tickets: 28,
    ventas: 6430,
    ganancias: 980,
    margen: 15.2,
    tendencia: "up",
  },
  {
    id: "V-005",
    fecha: "2024-01-13",
    hora: "16:20",
    vendedor: "Maria Lopez",
    clientes: 22,
    tickets: 41,
    ventas: 15670,
    ganancias: 2780,
    margen: 17.7,
    tendencia: "up",
  },
  {
    id: "V-006",
    fecha: "2024-01-13",
    hora: "09:30",
    vendedor: "Ana Martinez",
    clientes: 12,
    tickets: 19,
    ventas: 4250,
    ganancias: 560,
    margen: 13.2,
    tendencia: "down",
  },
  {
    id: "V-007",
    fecha: "2024-01-12",
    hora: "20:00",
    vendedor: "Luis Torres",
    clientes: 28,
    tickets: 52,
    ventas: 19800,
    ganancias: 3450,
    margen: 17.4,
    tendencia: "up",
  },
  {
    id: "V-008",
    fecha: "2024-01-12",
    hora: "11:45",
    vendedor: "Maria Lopez",
    clientes: 19,
    tickets: 35,
    ventas: 9870,
    ganancias: 1670,
    margen: 16.9,
    tendencia: "down",
  },
];

const summaryCards = [
  {
    label: "Ventas Hoy",
    value: "$21,600",
    change: "+12.5%",
    trend: "up" as const,
    icon: DollarSign,
  },
  {
    label: "Ganancias",
    value: "$3,760",
    change: "+8.2%",
    trend: "up" as const,
    icon: TrendingUp,
  },
  {
    label: "Tickets",
    value: "77",
    change: "+5.1%",
    trend: "up" as const,
    icon: Ticket,
  },
  {
    label: "Clientes",
    value: "42",
    change: "-2.3%",
    trend: "down" as const,
    icon: Users,
  },
];

// Simple sparkline SVG component
function Sparkline({ data, color = "#22c55e" }: { data: number[]; color?: string }) {
  const w = 120, h = 40;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(" ");
  return (
    <svg width={w} height={h} className="opacity-80">
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const sparkData = [45, 52, 48, 61, 55, 67, 72, 68, 75, 82, 78, 88];

export default function Ventas() {
  const [periodo, setPeriodo] = useState<"hoy" | "semana" | "mes">("hoy");

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1E293B]">Ventas</h1>
          <p className="text-[#475569] mt-1">
            Reportes de ventas diarias, semanales y mensuales. Historial de transacciones y balance.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-[#475569] hover:shadow-md hover:-translate-y-0.5 transition-all shadow-sm">
            <Calendar className="w-4 h-4" />
            <span className="text-sm font-medium">Enero 2024</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-[#475569] hover:shadow-md hover:-translate-y-0.5 transition-all shadow-sm">
            <Download className="w-4 h-4" />
            <span className="text-sm font-medium">Exportar</span>
          </button>
        </div>
      </div>

      {/* Period Tabs */}
      <div className="flex items-center gap-2 mb-6">
        {(["hoy", "semana", "mes"] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriodo(p)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 hover:shadow-md hover:-translate-y-0.5 ${
              periodo === p
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-gray-100 text-[#475569] hover:bg-gray-200"
            }`}
          >
            {p === "hoy" ? "Hoy" : p === "semana" ? "Esta Semana" : "Este Mes"}
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-[#94A3B8] font-medium">{card.label}</span>
              <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center">
                <card.icon className="w-5 h-5 text-[#475569]" />
              </div>
            </div>
            <div className="text-2xl font-bold text-[#1E293B] mb-1">{card.value}</div>
            <div
              className={`flex items-center gap-1 text-sm font-medium ${
                card.trend === "up" ? "text-green-600" : "text-red-500"
              }`}
            >
              {card.trend === "up" ? (
                <ArrowUpRight className="w-4 h-4" />
              ) : (
                <ArrowDownRight className="w-4 h-4" />
              )}
              {card.change}
            </div>
          </div>
        ))}
      </div>

      {/* Summary Banner + Sparkline */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-amber-700" />
          </div>
          <div>
            <p className="text-sm font-semibold text-amber-800">Resumen del Periodo</p>
            <p className="text-sm text-amber-600">
              Total acumulado: <span className="font-bold font-[&#39;JetBrains_Mono&#39;] text-amber-900">$87,720</span> con un margen promedio de <span className="font-bold">16.8%</span>
            </p>
          </div>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2">
          <Sparkline data={sparkData} />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-[#1E293B]">Historial de Ventas</h2>
          <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-[#475569] hover:shadow-md hover:-translate-y-0.5 transition-all">
            <Filter className="w-4 h-4" />
            Filtrar
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#475569] uppercase tracking-wider">ID</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#475569] uppercase tracking-wider">Fecha</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#475569] uppercase tracking-wider">Hora</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#475569] uppercase tracking-wider">Vendedor</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-[#475569] uppercase tracking-wider">Clientes</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-[#475569] uppercase tracking-wider">Tickets</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-[#475569] uppercase tracking-wider">Ventas</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-[#475569] uppercase tracking-wider">Ganancias</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-[#475569] uppercase tracking-wider">Margen</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-[#475569] uppercase tracking-wider">Tend.</th>
              </tr>
            </thead>
            <tbody>
              {ventasData.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-gray-100 hover:bg-blue-50 transition-colors duration-150"
                >
                  <td className="px-4 py-3 text-sm font-medium text-[#1E293B]">{row.id}</td>
                  <td className="px-4 py-3 text-sm text-[#475569]">{row.fecha}</td>
                  <td className="px-4 py-3 text-sm text-[#475569]">{row.hora}</td>
                  <td className="px-4 py-3 text-sm font-medium text-[#1E293B]">{row.vendedor}</td>
                  <td className="px-4 py-3 text-sm text-[#475569] text-center">{row.clientes}</td>
                  <td className="px-4 py-3 text-sm text-[#475569] text-center">{row.tickets}</td>
                  <td className="px-4 py-3 text-sm font-medium text-green-600 font-['JetBrains_Mono'] text-right">
                    ${row.ventas.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-green-600 font-['JetBrains_Mono'] text-right">
                    ${row.ganancias.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-[#475569] text-right">{row.margen}%</td>
                  <td className="px-4 py-3 text-center">
                    {row.tendencia === "up" ? (
                      <TrendingUp className="w-4 h-4 text-green-500 inline" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-500 inline" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
