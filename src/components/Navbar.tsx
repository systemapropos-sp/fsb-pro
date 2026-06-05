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
}: {
  label: string;
  icon: React.ElementType;
  path: string;
  active: boolean;
}) {
  return (
    <Link
      to={path}
      className="flex flex-col items-center justify-center gap-1 flex-1 transition-all duration-200 active:scale-95 py-2 mx-1 my-1 rounded-2xl no-underline select-none"
      style={{
        color: active ? '#FFFFFF' : '#2C3E50',
        background: active ? '#FF3008' : 'rgba(255,255,255,0.4)',
        boxShadow: active ? '0 2px 8px rgba(255,48,8,0.3)' : 'none',
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.color = '#FFFFFF';
          e.currentTarget.style.background = '#FF3008';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(248,125,46,0.4)';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.color = '#444444';
          e.currentTarget.style.background = 'rgba(255,255,255,0.25)';
          e.currentTarget.style.boxShadow = 'none';
          e.currentTarget.style.transform = 'translateY(0)';
        }
      }}
    >
      <Icon size={18} strokeWidth={active ? 2.5 : 2} />
      <span className="text-[12px] font-bold leading-tight" style={{ fontWeight: 700, letterSpacing: '0.03em' }}>{label}</span>
    </Link>
  );
}

export default function Navbar() {
  const location = useLocation();
  const currentPath = location.pathname;
  const [moreOpen, setMoreOpen] = useState(false);

  const isSecondaryActive = secondaryItems.some((item) => item.path === currentPath);

  return (
    <>
      {/* Mobile Navbar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 h-16 md:hidden border-t"
        style={{ background: '#ededed', borderColor: '#BDC3C7', paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex items-center h-full">
          {primaryItems.map((item) => (
            <NavItem key={item.path} {...item} active={currentPath === item.path} />
          ))}
          <button
            onClick={() => setMoreOpen(true)}
            className="flex flex-col items-center justify-center gap-1 flex-1 min-h-[44px] active:scale-95 transition-all duration-200 mx-1 my-1 rounded-2xl"
            style={{
              color: isSecondaryActive ? '#FFFFFF' : '#2C3E50',
              background: isSecondaryActive ? '#FF3008' : 'rgba(255,255,255,0.4)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#FFFFFF'; e.currentTarget.style.background = '#F87D2E'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = isSecondaryActive ? '#FFFFFF' : '#2C3E50'; e.currentTarget.style.background = isSecondaryActive ? '#FF3008' : 'rgba(255,255,255,0.4)'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <MoreHorizontal size={18} strokeWidth={isSecondaryActive ? 2.5 : 2} />
            <span className="text-[12px] font-bold leading-tight" style={{ fontWeight: 700 }}>Mas</span>
          </button>
        </div>
      </nav>

      {/* Tablet/Desktop: 2 rows - EXPANDED */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 h-24 hidden md:block xl:hidden border-t"
        style={{ background: '#ededed', borderColor: '#BDC3C7' }}
      >
        <div className="flex h-12">
          {tabletRow1.map((item) => (
            <NavItem key={item.path} {...item} active={currentPath === item.path} />
          ))}
        </div>
        <div className="flex h-12">
          {tabletRow2.map((item) => (
            <NavItem key={item.path} {...item} active={currentPath === item.path} />
          ))}
        </div>
      </nav>

      {/* Desktop: 2-row layout - EXPANDED */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 h-[120px] hidden xl:block border-t"
        style={{ background: '#ededed', borderColor: '#BDC3C7' }}
      >
        <div className="flex h-[60px]">
          {tabletRow1.map((item) => (
            <NavItem key={item.path} {...item} active={currentPath === item.path} />
          ))}
        </div>
        <div className="flex h-[60px]">
          {tabletRow2.map((item) => (
            <NavItem key={item.path} {...item} active={currentPath === item.path} />
          ))}
        </div>
      </nav>

      {/* Mobile "More" Menu */}
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
              transition={{ duration: 0.2 }}
              className="fixed bottom-0 left-0 right-0 z-[70] rounded-t-2xl shadow-xl md:hidden"
              style={{ background: '#FFFFFF', paddingBottom: 'env(safe-area-inset-bottom)' }}
            >
              <div className="flex items-center justify-center pt-3 pb-2">
                <div className="w-10 h-1 rounded-full" style={{ background: '#ABABAB' }} />
              </div>
              <div className="flex items-center justify-between px-4 pb-2 border-b" style={{ borderColor: '#EEEEEE' }}>
                <span className="text-sm font-semibold" style={{ color: '#191919' }}>Mas opciones</span>
                <button
                  onClick={() => setMoreOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#F7F7F7'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <X size={18} style={{ color: '#767676' }} />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2 p-4">
                {secondaryItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPath === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMoreOpen(false)}
                      className="flex flex-col items-center justify-center gap-2 rounded-xl p-4 transition-all active:scale-95 min-h-[80px] no-underline"
                      style={{
                        background: isActive ? 'rgba(255,48,8,0.08)' : '#F7F7F7',
                        color: isActive ? '#FF3008' : '#767676',
                        border: isActive ? '1px solid rgba(255,48,8,0.25)' : '1px solid transparent',
                      }}
                    >
                      <Icon size={24} strokeWidth={isActive ? 2.5 : 1.5} />
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
