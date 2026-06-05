import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
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
  MoreHorizontal,
  X,
} from 'lucide-react';

// Primary nav items for mobile (most used)
const primaryItems = [
  { label: 'Pagar', icon: CreditCard, path: '/pagar' },
  { label: 'Ventas', icon: BarChart3, path: '/ventas' },
  { label: 'Tickets', icon: Ticket, path: '/tickets' },
  { label: 'Jugadas', icon: BookOpen, path: '/jugadas' },
  { label: 'Lineas', icon: LineChart, path: '/lineas' },
];

// Secondary items that go into "More" menu on mobile
const secondaryItems = [
  { label: 'Configuraciones', icon: Settings, path: '/configuraciones' },
  { label: 'Directorio', icon: Phone, path: '/directorio' },
  { label: 'Pendientes', icon: Clock, path: '/pendientes' },
  { label: 'Resultados', icon: Trophy, path: '/resultados' },
  { label: 'Reglas', icon: FileText, path: '/reglas' },
];

// All items for tablet (2-row compact layout)
const tabletRow1 = [
  { label: 'Pagar', icon: CreditCard, path: '/pagar' },
  { label: 'Ventas', icon: BarChart3, path: '/ventas' },
  { label: 'Tickets', icon: Ticket, path: '/tickets' },
  { label: 'Jugadas', icon: BookOpen, path: '/jugadas' },
  { label: 'Lineas', icon: LineChart, path: '/lineas' },
];

const tabletRow2 = [
  { label: 'Config', icon: Settings, path: '/configuraciones' },
  { label: 'Directorio', icon: Phone, path: '/directorio' },
  { label: 'Pendientes', icon: Clock, path: '/pendientes' },
  { label: 'Resultados', icon: Trophy, path: '/resultados' },
  { label: 'Reglas', icon: FileText, path: '/reglas' },
];

function NavItem({
  label,
  icon: Icon,
  path,
  active,
  mobile = false,
}: {
  label: string;
  icon: React.ElementType;
  path: string;
  active: boolean;
  mobile?: boolean;
}) {
  return (
    <Link
      to={path}
      className={`flex flex-col items-center justify-center gap-0.5 transition-all duration-200 active:scale-95 min-h-[44px] min-w-[56px] no-underline select-none ${
        active
          ? 'text-accent-blue border-t-2 border-accent-blue bg-accent-blue/10'
          : 'text-text-secondary hover:text-text-primary hover:bg-accent-blue/5 border-t-2 border-transparent'
      } ${mobile ? 'flex-1 py-1' : 'flex-1'}`}
    >
      <Icon size={mobile ? 20 : 18} strokeWidth={active ? 2 : 1.5} />
      <span className={`font-medium leading-tight ${mobile ? 'text-[10px]' : 'text-[11px]'}`}>
        {label}
      </span>
    </Link>
  );
}

export default function Navbar() {
  const location = useLocation();
  const currentPath = location.pathname;
  const [moreOpen, setMoreOpen] = useState(false);

  // Check if a secondary item is active
  const isSecondaryActive = secondaryItems.some((item) => item.path === currentPath);

  return (
    <>
      {/* Mobile Navbar: Single row of 5 + More button */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 h-16 md:hidden bg-white/95 backdrop-blur-xl border-t border-border-default"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex items-center h-full">
          {primaryItems.map((item) => (
            <NavItem
              key={item.path}
              {...item}
              active={currentPath === item.path}
              mobile
            />
          ))}
          {/* More button */}
          <button
            onClick={() => setMoreOpen(true)}
            className={`flex flex-col items-center justify-center gap-0.5 flex-1 min-h-[44px] min-w-[56px] active:scale-95 transition-all duration-200 ${
              isSecondaryActive
                ? 'text-accent-blue bg-accent-blue/10'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <MoreHorizontal size={20} strokeWidth={isSecondaryActive ? 2 : 1.5} />
            <span className="text-[10px] font-medium leading-tight">Mas</span>
          </button>
        </div>
      </nav>

      {/* Tablet Navbar: 2 rows, compact */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 h-20 glass border-t border-border-default hidden md:block xl:hidden">
        <div className="flex h-10">
          {tabletRow1.map((item) => (
            <NavItem
              key={item.path}
              {...item}
              active={currentPath === item.path}
            />
          ))}
        </div>
        <div className="flex h-10">
          {tabletRow2.map((item) => (
            <NavItem
              key={item.path}
              {...item}
              active={currentPath === item.path}
            />
          ))}
        </div>
      </nav>

      {/* Desktop Navbar: Original 2-row layout */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 h-navbar glass border-t border-border-default hidden xl:block">
        <div className="flex h-[48px]">
          {tabletRow1.map((item) => (
            <NavItem
              key={item.path}
              {...item}
              active={currentPath === item.path}
            />
          ))}
        </div>
        <div className="flex h-[48px]">
          {tabletRow2.map((item) => (
            <NavItem
              key={item.path}
              {...item}
              active={currentPath === item.path}
            />
          ))}
        </div>
      </nav>

      {/* Mobile "More" Menu Overlay */}
      <AnimatePresence>
        {moreOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm md:hidden"
              onClick={() => setMoreOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="fixed bottom-0 left-0 right-0 z-[70] bg-bg-secondary rounded-t-2xl shadow-modal md:hidden"
              style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
            >
              {/* Handle */}
              <div className="flex items-center justify-center pt-3 pb-2">
                <div className="w-10 h-1 rounded-full bg-text-muted/40" />
              </div>
              {/* Close button */}
              <div className="flex items-center justify-between px-4 pb-2 border-b border-border-subtle">
                <span className="text-sm font-semibold text-text-primary">Mas opciones</span>
                <button
                  onClick={() => setMoreOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/5 transition-colors"
                >
                  <X size={18} className="text-text-secondary" />
                </button>
              </div>
              {/* Menu items */}
              <div className="grid grid-cols-3 gap-2 p-4">
                {secondaryItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPath === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMoreOpen(false)}
                      className={`flex flex-col items-center justify-center gap-2 rounded-xl p-4 transition-all active:scale-95 min-h-[80px] no-underline ${
                        isActive
                          ? 'bg-accent-blue/10 text-accent-blue border border-accent-blue/25'
                          : 'bg-bg-tertiary text-text-secondary hover:bg-accent-blue/5'
                      }`}
                    >
                      <Icon size={24} strokeWidth={isActive ? 2 : 1.5} />
                      <span className="text-xs font-medium text-center">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
