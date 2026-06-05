import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, ClipboardList, Phone, BookOpen,
  Ticket, Clock, BarChart3, Settings,
  CreditCard, Calculator
} from 'lucide-react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: CreditCard, label: 'Pagar', path: '/pagar' },
  { icon: Ticket, label: 'Tickets', path: '/tickets' },
  { icon: Clock, label: 'Pendientes', path: '/pendientes' },
  { icon: BarChart3, label: 'Resultados', path: '/resultados' },
  { icon: ClipboardList, label: 'Reglas', path: '/reglas' },
  { icon: BookOpen, label: 'Lineas', path: '/lineas' },
  { icon: Phone, label: 'Directorio', path: '/directorio' },
  { icon: Settings, label: 'Configuracion', path: '/configuraciones' },
  { icon: Calculator, label: 'Calculadora', path: '/calculadora' },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <motion.aside
      initial={{ x: -200 }}
      animate={{ x: 0 }}
      className="w-[200px] bg-matador-darker text-gray-400 flex flex-col h-full overflow-y-auto sidebar-matador"
    >
      <div className="p-4 border-b border-white/10">
        <h2 className="text-white font-bold text-lg">FSB PRO</h2>
        <p className="text-xs text-gray-500">Sistema de Banca</p>
      </div>

      <nav className="flex-1 py-2">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <a
              key={item.path}
              href={`#${item.path}`}
              className={`flex items-center gap-3 px-4 py-3 text-sm transition-all duration-200 sidebar-item ${
                isActive ? 'active' : ''
              }`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </a>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <div className="w-2 h-2 rounded-full bg-matador-green animate-pulse" />
          Sistema Activo
        </div>
      </div>
    </motion.aside>
  );
}
