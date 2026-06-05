import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Key, LogOut } from 'lucide-react';
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
      className="fixed top-0 left-0 right-0 z-50 h-12 bg-white border-b border-dd-border flex items-center justify-between px-4"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      {/* Left: Logo */}
      <div className="flex items-center gap-2">
        <Link to="/" className="flex items-center gap-1 no-underline">
          <span className="text-lg font-bold text-dd-accent tracking-tight">FSB</span>
          <span className="text-lg font-bold text-dd-text tracking-tight">Pro</span>
        </Link>
      </div>

      {/* Center: Live Clock */}
      <div className="absolute left-1/2 -translate-x-1/2 font-mono text-sm text-dd-text-secondary tracking-wider">
        {formatTime(time)}
      </div>

      {/* Right: User Dropdown */}
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-dd-surface transition-colors active:scale-95 min-h-[36px]"
        >
          <div className="w-2 h-2 rounded-full bg-dd-accent shrink-0" />
          <span className="text-sm font-medium text-dd-text">
            mmw03
          </span>
          <ChevronDown
            size={14}
            className={`text-dd-text-muted transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
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
                className="absolute right-0 top-full mt-1 w-52 bg-white border border-dd-border rounded-xl shadow-lg z-50 overflow-hidden"
              >
                <div className="py-1">
                  <div className="px-4 py-2 text-xs text-dd-text-muted border-b border-dd-border-light">
                    mmw03
                  </div>
                  <button
                    onClick={() => setDropdownOpen(false)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-dd-text-secondary hover:bg-dd-surface hover:text-dd-text transition-colors text-left"
                  >
                    <Key size={16} className="text-dd-text-muted" />
                    Cambiar contrasena
                  </button>
                  <div className="mx-3 my-1 border-t border-dd-border-light" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-dd-red hover:bg-dd-red/10 transition-colors text-left"
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
