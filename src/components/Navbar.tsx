import { Link, useLocation } from 'react-router-dom';
import {
  CreditCard,
  Settings,
  BarChart3,
  Phone,
  BookOpen,
  Ticket,
  Clock,
  Trophy,
  FileText,
  LineChart,
} from 'lucide-react';

const row1 = [
  { label: 'Pagar', icon: CreditCard, path: '/pagar' },
  { label: 'Configuraciones', icon: Settings, path: '/configuraciones' },
  { label: 'Ventas', icon: BarChart3, path: '/ventas' },
  { label: 'Directorio', icon: Phone, path: '/directorio' },
  { label: 'Jugadas', icon: BookOpen, path: '/jugadas' },
];

const row2 = [
  { label: 'Tickets', icon: Ticket, path: '/tickets' },
  { label: 'Pendientes de pago', icon: Clock, path: '/pendientes' },
  { label: 'Resultados', icon: Trophy, path: '/resultados' },
  { label: 'Reglas', icon: FileText, path: '/reglas' },
  { label: 'Lineas', icon: LineChart, path: '/lineas' },
];

function NavItem({
  label,
  icon: Icon,
  path,
  active,
}: {
  label: string;
  icon: React.ElementType;
  path: string;
  active: boolean;
}) {
  return (
    <Link
      to={path}
      className={`flex flex-col items-center justify-center gap-0.5 h-full flex-1 no-underline transition-all duration-150 ${
        active
          ? 'text-accent-blue border-t-2 border-accent-blue bg-accent-blue/10'
          : 'text-text-muted hover:text-text-secondary hover:bg-white/[0.02] border-t-2 border-transparent'
      }`}
    >
      <Icon size={18} strokeWidth={active ? 2 : 1.5} />
      <span className="text-[11px] font-medium leading-tight">{label}</span>
    </Link>
  );
}

export default function Navbar() {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-navbar glass border-t border-border-default">
      {/* Row 1 */}
      <div className="flex h-[48px]">
        {row1.map((item) => (
          <NavItem
            key={item.path}
            {...item}
            active={currentPath === item.path}
          />
        ))}
      </div>
      {/* Row 2 */}
      <div className="flex h-[48px]">
        {row2.map((item) => (
          <NavItem
            key={item.path}
            {...item}
            active={currentPath === item.path}
          />
        ))}
      </div>
    </nav>
  );
}
