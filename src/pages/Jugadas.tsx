import { useState } from 'react';
import { Search, Printer } from 'lucide-react';

interface Jugada {
  code: string;
  name: string;
  description: string;
  category: 'directa' | 'combinada' | 'sistema' | 'especial' | 'parlay';
  example: string;
}

const categories = [
  { key: 'all', label: 'Todas', bg: 'bg-gray-50', activeBg: 'bg-blue-600', text: 'text-gray-600' },
  { key: 'directa', label: 'Directa', bg: 'bg-amber-50', text: 'text-amber-700' },
  { key: 'combinada', label: 'Combinada', bg: 'bg-blue-50', text: 'text-blue-700' },
  { key: 'sistema', label: 'Sistema', bg: 'bg-cyan-50', text: 'text-cyan-700' },
  { key: 'especial', label: 'Especial', bg: 'bg-purple-50', text: 'text-purple-700' },
  { key: 'parlay', label: 'Parlay', bg: 'bg-green-50', text: 'text-green-700' },
];

const jugadas: Jugada[] = [
  { code: 'JD-01', name: 'Ganador del Partido', description: 'Apuesta a cual equipo ganara el partido.', category: 'directa', example: 'RD vs PR -> RD' },
  { code: 'JD-02', name: 'Run Line', description: 'Apuesta con handicap de carreras.', category: 'directa', example: 'RD -1.5 vs PR' },
  { code: 'JD-03', name: 'Alta/Baja Total', description: 'Apuesta si el total de carreras sera mayor o menor a la linea.', category: 'directa', example: 'Alta 8.5 carreras' },
  { code: 'JC-01', name: 'Combinada 2', description: 'Dos selecciones directas combinadas.', category: 'combinada', example: 'RD + NY' },
  { code: 'JC-02', name: 'Combinada 3', description: 'Tres selecciones directas combinadas.', category: 'combinada', example: 'RD + NY + BOS' },
  { code: 'JC-03', name: 'Combinada 4', description: 'Cuatro selecciones directas combinadas.', category: 'combinada', example: 'RD + NY + BOS + LA' },
  { code: 'JS-01', name: 'Sistema 2/3', description: 'Tres selecciones en combinaciones de 2.', category: 'sistema', example: '3 grupos de 2' },
  { code: 'JS-02', name: 'Sistema 2/4', description: 'Cuatro selecciones en combinaciones de 2.', category: 'sistema', example: '6 grupos de 2' },
  { code: 'JS-03', name: 'Sistema 3/4', description: 'Cuatro selecciones en combinaciones de 3.', category: 'sistema', example: '4 grupos de 3' },
  { code: 'JE-01', name: 'Primer Anotador', description: 'Apuesta a quien anotara primero.', category: 'especial', example: 'Juan Perez' },
  { code: 'JE-02', name: 'Inning Exacto', description: 'Adivinar el inning exacto del primer run.', category: 'especial', example: '3er inning' },
  { code: 'JE-03', name: 'Margen de Victoria', description: 'Apuesta al margen exacto de carreras.', category: 'especial', example: 'RD por 3 carreras' },
  { code: 'JP-01', name: 'Parlay 2', description: 'Dos selecciones en parlay.', category: 'parlay', example: 'RD + Alta 8.5' },
  { code: 'JP-02', name: 'Parlay 3', description: 'Tres selecciones en parlay.', category: 'parlay', example: 'RD + NY + Alta 7.5' },
  { code: 'JP-03', name: 'Parlay 4', description: 'Cuatro selecciones en parlay.', category: 'parlay', example: 'RD + NY + BOS + Alta 9.5' },
  { code: 'JP-04', name: 'Parlay 5+', description: 'Cinco o mas selecciones en parlay.', category: 'parlay', example: '5+ equipos' },
];

const categoryBadgeMap: Record<string, string> = {
  directa: 'bg-amber-50 text-amber-700 border-amber-200',
  combinada: 'bg-blue-50 text-blue-700 border-blue-200',
  sistema: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  especial: 'bg-purple-50 text-purple-700 border-purple-200',
  parlay: 'bg-green-50 text-green-700 border-green-200',
};

export default function Jugadas() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = jugadas.filter((j) => {
    const matchCat = activeCategory === 'all' || j.category === activeCategory;
    const matchSearch =
      search === '' ||
      j.name.toLowerCase().includes(search.toLowerCase()) ||
      j.code.toLowerCase().includes(search.toLowerCase()) ||
      j.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="p-8 bg-[#F1F5F9] min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1E293B] mb-1">Jugadas</h1>
          <p className="text-[#475569]">Tabla de referencia con los 39+ tipos de jugadas y sus codigos.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-[#475569] rounded-lg hover:shadow-md transition-all">
          <Printer size={18} />
          Imprimir
        </button>
      </div>

      {/* Main Card */}
      <div className="bg-white border border-gray-200 shadow-sm rounded-xl">
        {/* Category Pills + Search */}
        <div className="p-4 border-b border-gray-200 flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-2 flex-1">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                  activeCategory === cat.key
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : `${cat.bg} ${cat.text} border-transparent hover:shadow-sm hover:-translate-y-0.5`
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Buscar jugada..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-[#1E293B] placeholder:text-[#94A3B8] focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all w-56"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#475569] uppercase tracking-wider">Codigo</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#475569] uppercase tracking-wider">Nombre</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#475569] uppercase tracking-wider">Descripcion</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#475569] uppercase tracking-wider">Categoria</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#475569] uppercase tracking-wider">Ejemplo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((j) => (
                <tr key={j.code} className="hover:bg-blue-50 transition-colors duration-150">
                  <td className="px-4 py-3">
                    <span className="font-mono text-sm font-semibold text-blue-600">{j.code}</span>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-[#1E293B]">{j.name}</td>
                  <td className="px-4 py-3 text-sm text-[#475569]">{j.description}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full border ${categoryBadgeMap[j.category]}`}>
                      {j.category.charAt(0).toUpperCase() + j.category.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-[#94A3B8] font-mono">{j.example}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-[#94A3B8]">
                    No se encontraron jugadas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
