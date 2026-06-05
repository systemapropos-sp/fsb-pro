import { useState } from "react";
import {
  Search,
  DollarSign,
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  Calendar,
  Download,
  Printer,
  Eye,
} from "lucide-react";

interface PendingTicket {
  id: string;
  code: string;
  date: string;
  time: string;
  customer: string;
  seller: string;
  description: string;
  risk: number;
  toWin: number;
  potential: number;
  status: "pendiente_pago" | "por_confirmar" | "aprobado";
}

const pendingData: PendingTicket[] = [
  {
    id: "P-001",
    code: "TK-784521",
    date: "2024-01-15",
    time: "14:30",
    customer: "Juan Perez",
    seller: "Carlos Ruiz",
    description: "MLB Yankees -1.5 / NBA Lakers -6.5",
    risk: 500,
    toWin: 1250,
    potential: 1750,
    status: "pendiente_pago",
  },
  {
    id: "P-002",
    code: "TK-784527",
    date: "2024-01-13",
    time: "20:00",
    customer: "Diego Hernandez",
    seller: "Luis Torres",
    description: "NFL Cowboys -4.5 / MLB Astros ML",
    risk: 450,
    toWin: 1125,
    potential: 1575,
    status: "pendiente_pago",
  },
  {
    id: "P-003",
    code: "TK-784524",
    date: "2024-01-14",
    time: "18:20",
    customer: "Ana Lopez",
    seller: "Maria Lopez",
    description: "NBA Celtics +3.5",
    risk: 150,
    toWin: 210,
    potential: 360,
    status: "por_confirmar",
  },
  {
    id: "P-004",
    code: "TK-784530",
    date: "2024-01-15",
    time: "10:00",
    customer: "Roberto Sanchez",
    seller: "Ana Martinez",
    description: "MLB Red Sox +1.5 / NFL Eagles +4.5 / NBA Heat +2.5",
    risk: 800,
    toWin: 3200,
    potential: 4000,
    status: "pendiente_pago",
  },
  {
    id: "P-005",
    code: "TK-784531",
    date: "2024-01-14",
    time: "16:45",
    customer: "Laura Jimenez",
    seller: "Carlos Ruiz",
    description: "NFL Chiefs -3.0",
    risk: 600,
    toWin: 900,
    potential: 1500,
    status: "aprobado",
  },
  {
    id: "P-006",
    code: "TK-784532",
    date: "2024-01-15",
    time: "09:30",
    customer: "Fernando Castillo",
    seller: "Luis Torres",
    description: "NBA Suns +1.0 / MLB Dodgers ML / NFL Rams +6.0",
    risk: 1000,
    toWin: 4500,
    potential: 5500,
    status: "pendiente_pago",
  },
];

type StatusFilter = "todos" | "pendiente_pago" | "por_confirmar" | "aprobado";

const statusFilters: { key: StatusFilter; label: string; className: string }[] = [
  {
    key: "todos",
    label: "Todos",
    className: "bg-gray-100 text-[#475569] hover:bg-gray-200 border-transparent",
  },
  {
    key: "pendiente_pago",
    label: "Pendiente Pago",
    className: "bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200",
  },
  {
    key: "por_confirmar",
    label: "Por Confirmar",
    className: "bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200",
  },
  {
    key: "aprobado",
    label: "Aprobado",
    className: "bg-green-50 text-green-700 hover:bg-green-100 border-green-200",
  },
];

function StatusBadge({ status }: { status: PendingTicket["status"] }) {
  const styles = {
    pendiente_pago: "bg-amber-50 text-amber-700 border-amber-200",
    por_confirmar: "bg-blue-50 text-blue-700 border-blue-200",
    aprobado: "bg-green-50 text-green-700 border-green-200",
  };
  const icons = {
    pendiente_pago: <Clock className="w-3.5 h-3.5" />,
    por_confirmar: <AlertTriangle className="w-3.5 h-3.5" />,
    aprobado: <CheckCircle2 className="w-3.5 h-3.5" />,
  };
  const labels = {
    pendiente_pago: "Pendiente",
    por_confirmar: "Por Confirmar",
    aprobado: "Aprobado",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${styles[status]}`}
    >
      {icons[status]}
      {labels[status]}
    </span>
  );
}

export default function Pendientes() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("todos");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTickets = pendingData.filter((t) => {
    const matchesStatus = statusFilter === "todos" || t.status === statusFilter;
    const matchesSearch =
      searchQuery === "" ||
      t.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.customer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalPendiente = pendingData
    .filter((t) => t.status === "pendiente_pago")
    .reduce((sum, t) => sum + t.toWin, 0);

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1E293B]">Pendientes de Pago</h1>
          <p className="text-[#475569] mt-1">
            Tickets ganadores pendientes de pago con procesamiento de pagos.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-[#475569] hover:shadow-md hover:-translate-y-0.5 transition-all shadow-sm">
            <Calendar className="w-4 h-4" />
            <span className="text-sm font-medium">Hoy</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-[#475569] hover:shadow-md hover:-translate-y-0.5 transition-all shadow-sm">
            <Download className="w-4 h-4" />
            <span className="text-sm font-medium">Exportar</span>
          </button>
        </div>
      </div>

      {/* Summary Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-amber-700" />
          </div>
          <div>
            <p className="text-sm font-semibold text-amber-800">Total Pendiente de Pago</p>
            <p className="text-sm text-amber-600">
              <span className="font-bold font-['JetBrains_Mono'] text-amber-900">${totalPendiente.toLocaleString()}</span> en {pendingData.filter((t) => t.status === "pendiente_pago").length} tickets
            </p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-6 py-2.5 bg-green-500 text-white rounded-lg font-semibold shadow-sm hover:bg-green-600 hover:shadow-lg transition-all duration-150 hover:-translate-y-0.5">
          <DollarSign className="w-4 h-4" />
          Pagar Todos
        </button>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        {/* Status Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {statusFilters.map((filter) => (
            <button
              key={filter.key}
              onClick={() => setStatusFilter(filter.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-150 hover:shadow-md hover:-translate-y-0.5 ${
                statusFilter === filter.key
                  ? filter.className + " ring-2 ring-offset-1 ring-blue-200 shadow-sm"
                  : filter.className
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Buscar por codigo o cliente..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-[#1E293B] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#475569] uppercase tracking-wider">Codigo</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#475569] uppercase tracking-wider">Fecha</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#475569] uppercase tracking-wider">Cliente</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#475569] uppercase tracking-wider">Vendedor</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#475569] uppercase tracking-wider">Descripcion</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-[#475569] uppercase tracking-wider">Riesgo</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-[#475569] uppercase tracking-wider">A Ganar</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-[#475569] uppercase tracking-wider">Potencial</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-[#475569] uppercase tracking-wider">Estado</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-[#475569] uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map((ticket, idx) => (
                <tr
                  key={ticket.id}
                  className={`border-b border-gray-100 hover:bg-blue-50 transition-colors duration-150 ${
                    idx % 2 === 0 ? "" : "bg-gray-50"
                  }`}
                >
                  <td className="px-4 py-3 text-sm font-medium text-[#1E293B] font-['JetBrains_Mono']">
                    {ticket.code}
                  </td>
                  <td className="px-4 py-3 text-sm text-[#475569]">{ticket.date}</td>
                  <td className="px-4 py-3 text-sm font-medium text-[#1E293B]">{ticket.customer}</td>
                  <td className="px-4 py-3 text-sm text-[#475569]">{ticket.seller}</td>
                  <td className="px-4 py-3 text-sm text-[#475569] max-w-xs truncate">{ticket.description}</td>
                  <td className="px-4 py-3 text-sm font-medium text-red-500 font-['JetBrains_Mono'] text-right">
                    ${ticket.risk.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-green-600 font-['JetBrains_Mono'] text-right">
                    ${ticket.toWin.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-[#1E293B] font-['JetBrains_Mono'] text-right">
                    ${ticket.potential.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <StatusBadge status={ticket.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button className="p-1.5 rounded-md hover:bg-blue-100 text-[#94A3B8] hover:text-blue-600 transition-colors" title="Ver">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 rounded-md hover:bg-gray-200 text-[#94A3B8] hover:text-[#475569] transition-colors" title="Imprimir">
                        <Printer className="w-4 h-4" />
                      </button>
                      {ticket.status === "pendiente_pago" && (
                        <button className="flex items-center gap-1 px-3 py-1 rounded-md bg-green-500 text-white text-xs font-semibold hover:bg-green-600 hover:shadow-md transition-all duration-150 hover:-translate-y-0.5">
                          <DollarSign className="w-3 h-3" />
                          Pagar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredTickets.length === 0 && (
          <div className="p-8 text-center text-[#94A3B8]">
            <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No se encontraron tickets pendientes.</p>
          </div>
        )}
      </div>
    </div>
  );
}
