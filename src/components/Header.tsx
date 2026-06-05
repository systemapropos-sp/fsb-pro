import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, ChevronDown, Key, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { logout, formatTime } from '@/lib/storage';

export default function Header() {
  const [time, setTime] = useState(new Date());
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    window.location.hash = '#/login';
    window.location.reload();
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 h-11 md:h-12 bg-white/95 backdrop-blur-xl border-b border-border-default flex items-center justify-between px-3 md:px-4"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      {/* Left: Logo */}
      <div className="flex items-center gap-2">
        <Link to="/" className="flex items-center gap-2 no-underline">
          <span className="text-base md:text-h4 font-bold text-accent-blue tracking-tight">
            FSB Pro
          </span>
        </Link>
      </div>

      {/* Center: Live Clock - hidden on mobile */}
      <div className="hidden md:block absolute left-1/2 -translate-x-1/2 font-mono text-sm text-text-secondary tracking-wider">
        {formatTime(time)}
      </div>

      {/* Right: User Dropdown */}
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1.5 rounded-md hover:bg-black/5 transition-colors active:scale-95 min-h-[36px]"
        >
          <div className="w-6 h-6 rounded-full bg-accent-blue/15 flex items-center justify-center shrink-0">
            <User size={14} className="text-accent-blue" />
          </div>
          <span className="text-sm font-medium text-text-primary hidden sm:inline">
            mmw03
          </span>
          <ChevronDown
            size={14}
            className={`text-text-tertiary transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
          />
        </button>

        <AnimatePresence>
          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                className="absolute right-0 top-full mt-1 w-52 bg-bg-secondary border border-border-default rounded-xl shadow-modal z-50 overflow-hidden"
              >
                <div className="py-1">
                  <div className="px-4 py-2 text-xs text-text-tertiary border-b border-border-subtle sm:hidden">
                    mmw03
                  </div>
                  <button
                    onClick={() => setDropdownOpen(false)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:bg-black/5 hover:text-text-primary transition-colors text-left"
                  >
                    <Key size={16} className="text-text-tertiary" />
                    Cambiar contrasena
                  </button>
                  <div className="mx-3 my-1 border-t border-border-subtle" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-accent-red hover:bg-accent-red/10 transition-colors text-left"
                  >
                    <LogOut size={16} />
                    Cerrar sesion
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
