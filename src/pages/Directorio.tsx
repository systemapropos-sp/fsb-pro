import { useState } from 'react';
import { Search, Phone, Mail, MapPin, User, Shield, DollarSign, MoreVertical, Plus } from 'lucide-react';

interface Contact {
  id: number;
  name: string;
  role: 'jugador' | 'cobrador' | 'administrador';
  phone: string;
  email: string;
  location: string;
  status: 'active' | 'inactive';
}

const mockContacts: Contact[] = [
  { id: 1, name: 'Carlos Rodriguez', role: 'jugador', phone: '809-555-0101', email: 'carlos.r@email.com', location: 'Santo Domingo', status: 'active' },
  { id: 2, name: 'Maria Fernandez', role: 'cobrador', phone: '809-555-0102', email: 'maria.f@email.com', location: 'Santiago', status: 'active' },
  { id: 3, name: 'Juan Perez', role: 'administrador', phone: '809-555-0103', email: 'juan.p@email.com', location: 'La Romana', status: 'active' },
  { id: 4, name: 'Ana Martinez', role: 'jugador', phone: '809-555-0104', email: 'ana.m@email.com', location: 'Puerto Plata', status: 'inactive' },
  { id: 5, name: 'Luis Garcia', role: 'cobrador', phone: '809-555-0105', email: 'luis.g@email.com', location: 'Santo Domingo', status: 'active' },
  { id: 6, name: 'Pedro Sanchez', role: 'jugador', phone: '809-555-0106', email: 'pedro.s@email.com', location: 'Higuey', status: 'active' },
];

const tabs = [
  { key: 'all', label: 'Todos' },
  { key: 'jugador', label: 'Jugadores' },
  { key: 'cobrador', label: 'Cobradores' },
  { key: 'administrador', label: 'Administradores' },
];

const roleConfig = {
  jugador: { icon: User, color: 'bg-blue-50 text-blue-600', label: 'Jugador' },
  cobrador: { icon: DollarSign, color: 'bg-green-50 text-green-600', label: 'Cobrador' },
  administrador: { icon: Shield, color: 'bg-purple-50 text-purple-600', label: 'Admin' },
};

export default function Directorio() {
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = mockContacts.filter((c) => {
    const matchTab = activeTab === 'all' || c.role === activeTab;
    const matchSearch =
      search === '' ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.location.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  return (
    <div className="p-8 bg-[#F1F5F9] min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1E293B] mb-1">Directorio</h1>
          <p className="text-[#475569]">Contactos de jugadores, cobradores y administradores.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:shadow-md hover:-translate-y-0.5 transition-all">
          <Plus size={18} />
          Agregar contacto
        </button>
      </div>

      {/* Tabs + Search */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.key
                    ? 'bg-white text-blue-600 border-b-2 border-blue-500 shadow-sm'
                    : 'bg-gray-100 text-[#475569] hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Buscar contacto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-[#1E293B] placeholder:text-[#94A3B8] focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all w-64"
            />
          </div>
        </div>

        {/* Contact List */}
        <div className="divide-y divide-gray-100">
          {filtered.map((contact, idx) => {
            const config = roleConfig[contact.role];
            const Icon = config.icon;
            return (
              <div
                key={contact.id}
                className={`flex items-center justify-between p-4 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer ${
                  idx % 2 === 1 ? 'bg-gray-50' : 'bg-white'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${config.color}`}>
                    <Icon size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[#1E293B]">{contact.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${config.color}`}>
                        {config.label}
                      </span>
                      {contact.status === 'inactive' && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-[#94A3B8]">Inactivo</span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-[#475569]">
                      <span className="flex items-center gap-1">
                        <Phone size={14} />
                        {contact.phone}
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail size={14} />
                        {contact.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin size={14} />
                        {contact.location}
                      </span>
                    </div>
                  </div>
                </div>
                <button className="p-2 rounded-lg hover:bg-gray-100 hover:scale-110 transition-transform">
                  <MoreVertical size={18} className="text-[#94A3B8]" />
                </button>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="p-8 text-center text-[#94A3B8]">No se encontraron contactos.</div>
          )}
        </div>
      </div>
    </div>
  );
}
