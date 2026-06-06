import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, ChevronDown, Key, LogOut, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { logout, formatTime } from '@/lib/storage';

export default function Header() {
  const [time, setTime] = useState(new Date());
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Keyboard shortcut: Ctrl+V to go to Dashboard (Vender)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && (e.key === 'v' || e.key === 'V')) {
        e.preventDefault();
        navigate('/');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

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
          <span className="text-base md:text-h4 font-bold tracking-tight">
            <span style={{ color: '#FF3008' }}>FSB</span>
            <span style={{ color: '#191919' }}> Pro</span>
          </span>
        </Link>
      </div>

      {/* Center: Live Clock - hidden on mobile */}
      <div className="hidden md:block absolute left-1/2 -translate-x-1/2 font-mono text-sm tracking-wider" style={{ color: '#333333' }}>
        {formatTime(time)}
      </div>

      {/* Right: VENDER button + User Dropdown */}
      <div className="flex items-center gap-2">
        {/* VENDER Button - Big & Prominent */}
        <Link
          to="/"
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-bold text-white transition-all duration-200 hover:scale-105 active:scale-95"
          style={{
            background: '#FF3008',
            boxShadow: '0 2px 8px rgba(255,48,8,0.35)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#E62B00';
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(255,48,8,0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#FF3008';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(255,48,8,0.35)';
          }}
          title="Vender (Ctrl+V)"
        >
          <DollarSign size={16} strokeWidth={2.5} />
          <span>VENDER</span>
          <span className="hidden lg:inline text-[10px] opacity-70 ml-1 font-normal">(Ctrl+V)</span>
        </Link>

        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1.5 rounded-md transition-colors active:scale-95 min-h-[36px]"
            style={{ color: '#191919' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.05)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(255,48,8,0.1)' }}>
              <User size={14} style={{ color: '#FF3008' }} />
            </div>
            <span className="text-sm font-medium hidden sm:inline">mmw03</span>
            <ChevronDown size={14} style={{ color: '#555555' }} className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
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
                  className="absolute right-0 top-full mt-1 w-52 rounded-xl overflow-hidden z-50 border"
                  style={{ background: '#FFFFFF', borderColor: '#E0E0E0', boxShadow: '0 10px 15px rgba(0,0,0,0.1)' }}
                >
                  <div className="py-1">
                    <div className="px-4 py-2 text-xs border-b sm:hidden" style={{ color: '#555555', borderColor: '#EEEEEE' }}>
                      mmw03
                    </div>
                    <button
                      onClick={() => setDropdownOpen(false)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors"
                      style={{ color: '#333333' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#F7F7F7'; e.currentTarget.style.color = '#191919'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#333333'; }}
                    >
                      <Key size={16} style={{ color: '#555555' }} />
                      Cambiar contrasena
                    </button>
                    <div className="mx-3 my-1 border-t" style={{ borderColor: '#EEEEEE' }} />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors"
                      style={{ color: '#E53935' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(229,57,53,0.08)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
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
      </div>
    </header>
  );
}
