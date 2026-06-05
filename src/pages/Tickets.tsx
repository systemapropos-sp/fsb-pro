import { useState } from "react";
import {
  Search,
  Filter,
  Ticket,
  CheckCircle2,
  XCircle,
  Clock,
  Ban,
  Download,
  Eye,
  Printer,
} from "lucide-react";

interface TicketItem {
  id: string;
  code: string;
  date: string;
  time: string;
  customer: string;
  seller: string;
  picks: number;
  risk: number;
  toWin: number;
  status: "ganador" | "perdedor" | "pendiente" | "cancelado";
}

const ticketsData: TicketItem[] = [
  {
    id: "T-001",
    code: "TK-784521",
    date: "2024-01-15",
    time: "14:30",
    customer: "Juan Perez",
    seller: "Carlos Ruiz",
    picks: 3,
    risk: 500,
    toWin: 1250,
    status: "ganador",
  },
  {
    id: "T-002",
    code: "TK-784522",
    date: "2024-01-15",
    time: "13:15",
    customer: "Maria Garcia",
    seller: "Ana Martinez",
    picks: 2,
    risk: 200,
    toWin: 380,
    status: "pendiente",
  },
  {
    id: "T-003",
    code: "TK-784523",
    date: "2024-01-15",
    time: "12:45",
    customer: "Luis Torres",
    seller: "Carlos Ruiz",
    picks: 5,
    risk: 1000,
    toWin: 5200,
    status: "perdedor",
  },
  {
    id: "T-004",
    code: "TK-784524",
    date: "2024-01-14",
    time: "18:20",
    customer: "Ana Lopez",
    seller: "Maria Lopez",
    picks: 1,
    risk: 150,
    toWin: 210,
    status: "ganador",
  },
  {
    id: "T-005",
    code: "TK-784525",
    date: "2024-01-14",
    time: "16:00",
    customer: "Pedro Martinez",
    seller: "Luis Torres",
    picks: 4,
    risk: 750,
    toWin: 2800,
    status: "cancelado",
  },
  {
    id: "T-006",
    code: "TK-784526",
    date: "2024-01-14",
    time: "11:30",
    customer: "Sofia Ramirez",
    seller: "Ana Martinez",
    picks: 2,
    risk: 300,
    toWin: 540,
    status: "pendiente",
  },
  {
    id: "T-007",
    code: "TK-784527",
    date: "2024-01-13",
    time: "20:00",
    customer: "Diego Hernandez",
    seller: "Luis Torres",
    picks: 3,
    risk: 450,
    toWin: 1125,
    status: "ganador",
  },
  {
    id: "T-008",
    code: "TK-784528",
    date: "2024-01-13",
    time: "15:45",
    customer: "Carmen Diaz",
    seller: "Maria Lopez",
    picks: 6,
    risk: 1200,
    toWin: 8400,
    status: "perdedor",
  },
];

type StatusFilter = "todos" | "ganador" | "perdedor" | "pendiente" | "cancelado";

const statusFilters: { key: StatusFilter; label: string; className: string }[] = [
  {
    key: "todos",
    label: "Todos",
    className: "bg-gray-100 text-[#475569] hover:bg-gray-200 border-transparent",
  },
  {
    key: "ganador",
    label: "Ganadores",
    className: "bg-green-50 text-green-700 hover:bg-green-100 border-green-200",
  },
  {
    key: "perdedor",
    label: "Perdedores",
    className: "bg-red-50 text-red-700 hover:bg-red-100 border-red-200",
  },
  {
    key: "pendiente",
    label: "Pendientes",
    className: "bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200",
  },
  {
    key: "cancelado",
    label: "Cancelados",
    className: "bg-gray-100 text-gray-500 hover:bg-gray-200 border-gray-200",
  },
];

function StatusBadge({ status }: { status: TicketItem["status"] }) {
  const styles = {
    ganador: "bg-green-50 text-green-700 border-green-200",
    perdedor: "bg-red-50 text-red-700 border-red-200",
    pendiente: "bg-amber-50 text-amber-700 border-amber-200",
    cancelado: "bg-gray-100 text-gray-500 border-gray-200",
  };
  const icons = {
    ganador: <CheckCircle2 className="w-3.5 h-3.5" />,
    perdedor: <XCircle className="w-3.5 h-3.5" />,
    pendiente: <Clock className="w-3.5 h-3.5" />,
    cancelado: <Ban className="w-3.5 h-3.5" />,
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${styles[status]}`}
    >
      {icons[status]}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export default function Tickets() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("todos");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTickets = ticketsData.filter((t) => {
    const matchesStatus = statusFilter === "todos" || t.status === statusFilter;
    const matchesSearch =
      searchQuery === "" ||
      t.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.seller.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1E293B]">Tickets</h1>
          <p className="text-[#475569] mt-1">
            Gestion completa de tickets con filtros, busqueda y acciones.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-[#475569] hover:shadow-md hover:-translate-y-0.5 transition-all shadow-sm">
            <Download className="w-4 h-4" />
            <span className="text-sm font-medium">Exportar</span>
          </button>
        </div>
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
            placeholder="Buscar por codigo, cliente o vendedor..."
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
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#475569] uppercase tracking-wider">Hora</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#475569] uppercase tracking-wider">Cliente</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#475569] uppercase tracking-wider">Vendedor</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-[#475569] uppercase tracking-wider">Picks</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-[#475569] uppercase tracking-wider">Riesgo</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-[#475569] uppercase tracking-wider">A Ganar</th>
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
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Ticket className="w-4 h-4 text-[#94A3B8]" />
                      <span className="text-sm font-medium text-[#1E293B] font-['JetBrains_Mono']">
                        {ticket.code}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-[#475569]">{ticket.date}</td>
                  <td className="px-4 py-3 text-sm text-[#94A3B8] font-['JetBrains_Mono']">{ticket.time}</td>
                  <td className="px-4 py-3 text-sm font-medium text-[#1E293B]">{ticket.customer}</td>
                  <td className="px-4 py-3 text-sm text-[#475569]">{ticket.seller}</td>
                  <td className="px-4 py-3 text-sm text-[#475569] text-center">{ticket.picks}</td>
                  <td className="px-4 py-3 text-sm font-medium text-red-500 font-['JetBrains_Mono'] text-right">
                    ${ticket.risk.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-green-600 font-['JetBrains_Mono'] text-right">
                    ${ticket.toWin.toLocaleString()}
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
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredTickets.length === 0 && (
          <div className="p-8 text-center text-[#94A3B8]">
            <Filter className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No se encontraron tickets con los filtros seleccionados.</p>
          </div>
        )}
      </div>
    </div>
  );
}
