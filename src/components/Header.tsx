import { useState, useEffect } from 'react';
import { ChevronDown, LogOut } from 'lucide-react';
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
      className="h-[48px] bg-matador-dark flex items-center justify-between px-4 shrink-0"
      style={{ borderBottom: '2px solid #7CB342' }}
    >
      {/* Left: Logo */}
      <div className="flex items-center gap-2">
        <span className="text-base font-bold text-white tracking-tight">
          FSB PRO
        </span>
      </div>

      {/* Center: Live Clock */}
      <div className="absolute left-1/2 -translate-x-1/2 font-mono text-sm text-white tracking-wider">
        {formatTime(time)}
      </div>

      {/* Right: User Dropdown */}
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-white/10 transition-colors"
        >
          <div className="w-2 h-2 rounded-full bg-matador-green" />
          <span className="text-sm font-medium text-white">mmw03</span>
          <ChevronDown
            size={14}
            className={`text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
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
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-modal z-50 overflow-hidden"
              >
                <div className="py-1">
                  <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-100">
                    Sesion activa
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors text-left"
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
