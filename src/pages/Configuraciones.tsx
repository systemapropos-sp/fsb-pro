import { useState } from 'react';
import { Settings, Printer, MessageSquare, Globe, Hash, Lock, LogOut, Eye, EyeOff, Check, ChevronRight } from 'lucide-react';

interface ToggleProps {
  enabled: boolean;
  onChange: () => void;
}

function Toggle({ enabled, onChange }: ToggleProps) {
  return (
    <button
      onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
        enabled ? 'bg-green-500' : 'bg-gray-300'
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
          enabled ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

interface SegmentedButtonProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}

function SegmentedButton({ options, value, onChange }: SegmentedButtonProps) {
  return (
    <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            value === opt.value
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-200'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export default function Configuraciones() {
  const [autoPrint, setAutoPrint] = useState(true);
  const [printLogo, setPrintLogo] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [language, setLanguage] = useState('es');
  const [codeLength, setCodeLength] = useState('6');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSavePassword = () => {
    if (password && password === confirmPassword) {
      showToast('Contrasena actualizada exitosamente');
      setShowPasswordModal(false);
      setPassword('');
      setConfirmPassword('');
    }
  };

  return (
    <div className="p-8 bg-[#F1F5F9] min-h-screen relative">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg shadow-lg animate-in slide-in-from-top-2">
          <Check size={18} />
          <span className="text-sm font-medium">{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
          <Settings size={20} className="text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#1E293B] mb-1">Configuraciones</h1>
          <p className="text-[#475569]">Configuracion de impresion, SMS, idioma y longitud de codigos.</p>
        </div>
      </div>

      <div className="max-w-2xl space-y-4">
        {/* Print Settings */}
        <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <Printer size={18} className="text-blue-600" />
            <h2 className="text-base font-semibold text-[#1E293B]">Impresion</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#1E293B]">Impresion automatica</p>
                <p className="text-xs text-[#94A3B8]">Imprimir tickets automaticamente al crear jugada</p>
              </div>
              <Toggle enabled={autoPrint} onChange={() => setAutoPrint(!autoPrint)} />
            </div>
            <div className="border-t border-gray-100" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#1E293B]">Incluir logo</p>
                <p className="text-xs text-[#94A3B8]">Mostrar logo en los tickets impresos</p>
              </div>
              <Toggle enabled={printLogo} onChange={() => setPrintLogo(!printLogo)} />
            </div>
          </div>
        </div>

        {/* SMS Settings */}
        <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <MessageSquare size={18} className="text-blue-600" />
            <h2 className="text-base font-semibold text-[#1E293B]">Notificaciones SMS</h2>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#1E293B]">Habilitar SMS</p>
              <p className="text-xs text-[#94A3B8]">Enviar notificaciones por SMS a jugadores</p>
            </div>
            <Toggle enabled={smsEnabled} onChange={() => setSmsEnabled(!smsEnabled)} />
          </div>
        </div>

        {/* Language Settings */}
        <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <Globe size={18} className="text-blue-600" />
            <h2 className="text-base font-semibold text-[#1E293B]">Idioma</h2>
          </div>
          <SegmentedButton
            options={[
              { value: 'es', label: 'Espanol' },
              { value: 'en', label: 'English' },
            ]}
            value={language}
            onChange={setLanguage}
          />
        </div>

        {/* Code Length */}
        <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <Hash size={18} className="text-blue-600" />
            <h2 className="text-base font-semibold text-[#1E293B]">Longitud de Codigo</h2>
          </div>
          <SegmentedButton
            options={[
              { value: '4', label: '4 digitos' },
              { value: '5', label: '5 digitos' },
              { value: '6', label: '6 digitos' },
              { value: '8', label: '8 digitos' },
            ]}
            value={codeLength}
            onChange={setCodeLength}
          />
        </div>

        {/* Security */}
        <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <Lock size={18} className="text-blue-600" />
            <h2 className="text-base font-semibold text-[#1E293B]">Seguridad</h2>
          </div>
          <button
            onClick={() => setShowPasswordModal(true)}
            className="flex items-center justify-between w-full p-3 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Lock size={16} />
              <span className="text-sm font-medium">Cambiar contrasena</span>
            </div>
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Logout */}
        <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-5 hover:shadow-md transition-shadow">
          <button
            onClick={() => showToast('Sesion cerrada exitosamente')}
            className="flex items-center justify-center gap-2 w-full p-3 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors font-medium"
          >
            <LogOut size={18} />
            Cerrar sesion
          </button>
        </div>
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white shadow-2xl rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-[#1E293B] mb-1">Cambiar Contrasena</h3>
            <p className="text-sm text-[#94A3B8] mb-4">Ingrese su nueva contrasena.</p>

            <div className="space-y-4">
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Nueva contrasena"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-[#1E293B] placeholder:text-[#94A3B8] focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#475569]"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Confirmar contrasena"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-[#1E293B] placeholder:text-[#94A3B8] focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPassword('');
                  setConfirmPassword('');
                }}
                className="flex-1 py-2.5 border border-gray-200 text-[#475569] rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleSavePassword}
                disabled={!password || password !== confirmPassword}
                className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
