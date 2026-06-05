import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  Printer,
  MessageSquare,
  Settings2,
  UserCog,
  Key,
  LogOut,
  Download,
  AlertCircle,
  Eye,
  EyeOff,
  Check,
  X,
} from 'lucide-react';
import { getSetting, updateSetting, logout } from '@/lib/storage';

// ------------------------------------------------------------------
// Types
// ------------------------------------------------------------------
interface PasswordStrength {
  score: number; // 0-4
  label: string;
  color: string;
}

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------
function getPasswordStrength(password: string): PasswordStrength {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const labels = ['Muy debil', 'Debil', 'Regular', 'Buena', 'Fuerte'];
  const colors = ['#EF4444', '#EF4444', '#F59E0B', '#3B82F6', '#22C55E'];

  return {
    score,
    label: labels[score],
    color: colors[score],
  };
}

function useSetting(key: string, defaultValue: string | number | boolean) {
  const [value, setValue] = useState<string | number | boolean>(defaultValue);

  useEffect(() => {
    const setting = getSetting(key);
    if (setting) {
      setValue(setting.value);
    }
  }, [key]);

  const update = useCallback(
    (newValue: string | number | boolean) => {
      setValue(newValue);
      updateSetting(key, newValue);
    },
    [key]
  );

  return [value, update] as const;
}

// ------------------------------------------------------------------
// Sub-components
// ------------------------------------------------------------------
function SegmentedButton({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="inline-flex w-full md:w-auto bg-[rgba(17,24,39,0.8)] rounded-md p-1 gap-1">
      {options.map((opt) => {
        const isActive = value === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`relative px-4 py-2 text-sm font-medium rounded-sm transition-all duration-200 cursor-pointer ${
              isActive
                ? 'text-text-primary bg-[rgba(59,130,246,0.15)] border border-[rgba(59,130,246,0.3)]'
                : 'text-text-muted bg-transparent border border-transparent hover:text-text-secondary hover:bg-[rgba(148,163,184,0.08)]'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (val: boolean) => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 gap-1 sm:gap-0">
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium text-text-primary">{label}</span>
        <span className="text-xs text-text-tertiary">{description}</span>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-[22px] rounded-full transition-all duration-200 cursor-pointer ${
          checked ? 'bg-accent-green' : 'bg-[rgba(100,116,139,0.3)]'
        }`}
        style={{ flexShrink: 0 }}
      >
        <div
          className="absolute top-[2px] left-[2px] w-[22px] h-[22px] md:w-[18px] md:h-[18px] rounded-full bg-text-primary transition-transform duration-200"
          style={{
            transform: checked ? 'translateX(18px)' : 'translateX(0)',
          }}
        />
      </button>
    </div>
  );
}

function SettingsCard({
  icon: Icon,
  iconColor,
  title,
  children,
  delay = 0,
  borderTopColor,
}: {
  icon: React.ElementType;
  iconColor: string;
  title: string;
  children: React.ReactNode;
  delay?: number;
  borderTopColor?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
      className="mb-4 px-4 md:px-6 lg:px-8"
    >
      <div
        className="gradient-card rounded-xl border border-border-subtle shadow-panel overflow-hidden w-full"
        style={borderTopColor ? { borderTop: `3px solid ${borderTopColor}` } : undefined}
      >
        <div className="p-4 md:p-6">
          {/* Card header */}
          <div className="flex items-center gap-3 mb-3 md:mb-4 pb-3 md:pb-4 border-b border-border-subtle">
            <Icon size={20} style={{ color: iconColor }} />
            <h3 className="text-lg md:text-xl font-semibold text-text-primary">{title}</h3>
          </div>
          {children}
        </div>
      </div>
    </motion.div>
  );
}

function ChangePasswordModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');

  const strength = getPasswordStrength(password);
  const passwordsMatch = password === confirmPassword && password.length > 0;
  const canSubmit = password.length >= 4 && passwordsMatch;

  const handleSubmit = () => {
    if (!canSubmit) return;
    toast.success('Contraseña actualizada correctamente', {
      icon: '✅',
    });
    setPassword('');
    setConfirmPassword('');
    setError('');
    onClose();
  };

  const handleClose = () => {
    setPassword('');
    setConfirmPassword('');
    setError('');
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm p-4"
            onClick={handleClose}
          />
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="fixed top-1/2 left-1/2 z-50 w-full max-w-[420px] -translate-x-1/2 -translate-y-1/2 bg-bg-secondary border border-border-default rounded-xl shadow-modal p-4 md:p-6 mx-4"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h3 className="text-lg md:text-xl font-semibold text-text-primary">Cambiar Contraseña</h3>
              <button
                onClick={handleClose}
                className="w-10 h-10 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-md bg-[rgba(148,163,184,0.06)] hover:bg-[rgba(148,163,184,0.12)] transition-colors cursor-pointer"
              >
                <X size={16} className="text-text-secondary" />
              </button>
            </div>

            {/* Fields */}
            <div className="flex flex-col gap-4">
              {/* Username - readonly */}
              <div>
                <label className="text-sm font-medium text-text-primary mb-1.5 block">
                  Nombre de usuario
                </label>
                <input
                  type="text"
                  value="mmw03"
                  readOnly
                  className="w-full px-3.5 h-12 md:h-10 py-2.5 rounded-md bg-[rgba(30,41,59,0.6)] border border-border-default text-text-secondary text-sm font-mono cursor-not-allowed"
                />
              </div>

              {/* Password */}
              <div>
                <label className="text-sm font-medium text-text-primary mb-1.5 block">
                  Nueva contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError('');
                    }}
                    placeholder="Minimo 4 caracteres"
                    className="w-full px-3.5 h-12 md:h-10 py-2.5 pr-10 rounded-md bg-[rgba(30,41,59,0.6)] border border-border-default text-text-primary text-sm placeholder:text-text-tertiary focus:border-accent-blue focus:outline-none transition-colors"
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* Strength indicator */}
                {password.length > 0 && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[0, 1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="h-2 md:h-1 flex-1 rounded-full transition-all duration-200"
                          style={{
                            backgroundColor: i < strength.score ? strength.color : 'rgba(100,116,139,0.3)',
                          }}
                        />
                      ))}
                    </div>
                    <span
                      className="text-xs font-medium"
                      style={{ color: strength.color }}
                    >
                      Seguridad: {strength.label}
                    </span>
                  </div>
                )}
              </div>

              {/* Confirm password */}
              <div>
                <label className="text-sm font-medium text-text-primary mb-1.5 block">
                  Confirmar contraseña
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setError('');
                    }}
                    placeholder="Repite la contraseña"
                    className="w-full px-3.5 h-12 md:h-10 py-2.5 pr-10 rounded-md bg-[rgba(30,41,59,0.6)] border border-border-default text-text-primary text-sm placeholder:text-text-tertiary focus:border-accent-blue focus:outline-none transition-colors"
                  />
                  <button
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary transition-colors cursor-pointer"
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {confirmPassword.length > 0 && !passwordsMatch && (
                  <span className="text-xs text-accent-red mt-1 flex items-center gap-1">
                    <AlertCircle size={12} />
                    Las contraseñas no coinciden
                  </span>
                )}
                {confirmPassword.length > 0 && passwordsMatch && (
                  <span className="text-xs text-accent-green mt-1 flex items-center gap-1">
                    <Check size={12} />
                    Las contraseñas coinciden
                  </span>
                )}
              </div>

              {error && (
                <span className="text-xs text-accent-red">{error}</span>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-2.5 rounded-md text-sm font-semibold text-text-secondary bg-[rgba(148,163,184,0.08)] hover:bg-[rgba(148,163,184,0.15)] border border-border-default transition-all cursor-pointer"
              >
                Cerrar
              </button>
              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className={`flex-1 px-4 py-2.5 rounded-md text-sm font-semibold transition-all cursor-pointer ${
                  canSubmit
                    ? 'gradient-accent text-white hover:brightness-110 shadow-accent'
                    : 'bg-[rgba(100,116,139,0.2)] text-text-muted cursor-not-allowed'
                }`}
              >
                Cambiar contraseña
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function LogoutConfirmModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const handleConfirm = () => {
    logout();
    window.location.hash = '#/login';
    window.location.reload();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm p-4"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="fixed top-1/2 left-1/2 z-50 w-full max-w-[400px] -translate-x-1/2 -translate-y-1/2 bg-bg-secondary border border-border-default rounded-xl shadow-modal p-6"
          >
            <h3 className="text-h3 text-text-primary mb-2">
              Cerrar sesion
            </h3>
            <p className="text-body text-text-secondary mb-6">
              Esta seguro de que desea cerrar sesion? Debera volver a ingresar sus credenciales.
            </p>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 rounded-md text-sm font-semibold text-text-secondary bg-[rgba(148,163,184,0.08)] hover:bg-[rgba(148,163,184,0.15)] border border-border-default transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 px-4 py-2.5 rounded-md text-sm font-semibold gradient-danger text-white hover:brightness-110 shadow-danger transition-all cursor-pointer"
              >
                Cerrar sesion
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ------------------------------------------------------------------
// Main Component
// ------------------------------------------------------------------
export default function Configuraciones() {
  const [printEnabled, setPrintEnabled] = useSetting('print_auto', true);
  const [smsOnly, setSmsOnly] = useSetting('sms_enabled', false);
  const [printMode] = useSetting('print_mode', 'driver');
  const [codeLength] = useSetting('code_length', 'group');
  const [language] = useSetting('language', 'es');

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // When SMS Only is turned ON, disable printing
  const handleSmsChange = (val: boolean) => {
    setSmsOnly(val);
    if (val) {
      setPrintEnabled(false);
      toast.success('SMS activado. Impresion automatica desactivada.', {
        icon: '📱',
        duration: 3000,
      });
    } else {
      toast.success('SMS desactivado.', {
        icon: '✅',
        duration: 2000,
      });
    }
  };

  // When print is enabled, disable SMS-only
  const handlePrintChange = (val: boolean) => {
    setPrintEnabled(val);
    if (val && smsOnly) {
      setSmsOnly(false);
    }
  };

  const handleSettingChange = (key: string, value: string | number | boolean, label: string) => {
    updateSetting(key, value);
    toast.success(`${label} actualizado`, {
      duration: 2000,
    });
  };

  return (
    <div className="pt-4 pb-8">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mx-6 mb-6"
      >
        <h1 className="text-h2 text-text-primary font-semibold">Configuraciones</h1>
      </motion.div>

      {/* Impresion */}
      <SettingsCard
        icon={Printer}
        iconColor="#3B82F6"
        title="Impresion"
        delay={0.1}
      >
        <ToggleRow
          label="Activar Impresion"
          description="Imprimir tickets automaticamente al procesar"
          checked={printEnabled as boolean}
          onChange={handlePrintChange}
        />

        <div className="mt-4 pt-4 border-t border-border-subtle">
          <span className="text-sm font-medium text-text-primary block mb-1">
            Modo de Impresion
          </span>
          <span className="text-xs text-text-tertiary block mb-3">
            Seleccione el metodo de impresion
          </span>
          <SegmentedButton
            options={[
              { label: 'Generico', value: 'generic' },
              { label: 'Driver', value: 'driver' },
              { label: 'Java', value: 'java' },
            ]}
            value={printMode as string}
            onChange={(val) => handleSettingChange('print_mode', val, 'Modo de impresion')}
          />
        </div>

        <div className="mt-4 pt-4 border-t border-border-subtle">
          <button
            onClick={() => toast('Descargando drivers de impresora...', { icon: '📥' })}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-semibold text-accent-blue bg-[rgba(59,130,246,0.1)] border border-[rgba(59,130,246,0.25)] hover:bg-[rgba(59,130,246,0.2)] transition-all cursor-pointer"
          >
            <Download size={16} />
            Descargar Drivers de Impresora
          </button>
        </div>
      </SettingsCard>

      {/* SMS / Mensajes */}
      <SettingsCard
        icon={MessageSquare}
        iconColor="#22C55E"
        title="SMS / Mensajes"
        delay={0.15}
      >
        <ToggleRow
          label="Solo SMS"
          description="Enviar tickets unicamente por mensaje de texto. Desactiva la impresion."
          checked={smsOnly as boolean}
          onChange={handleSmsChange}
        />
      </SettingsCard>

      {/* Sistema */}
      <SettingsCard
        icon={Settings2}
        iconColor="#8B5CF6"
        title="Sistema"
        delay={0.2}
      >
        <div className="mb-5">
          <span className="text-sm font-medium text-text-primary block mb-1">
            Longitud de Codigo de Ticket
          </span>
          <span className="text-xs text-text-tertiary block mb-3">
            Numero de digitos en el codigo de ticket
          </span>
          <SegmentedButton
            options={[
              { label: '3 digitos', value: '3' },
              { label: '4 digitos', value: '4' },
              { label: 'Usar preferencia de grupo', value: 'group' },
            ]}
            value={String(codeLength)}
            onChange={(val) => handleSettingChange('code_length', val, 'Longitud de codigo')}
          />
        </div>

        <div className="pt-4 border-t border-border-subtle">
          <span className="text-sm font-medium text-text-primary block mb-1">
            Idioma
          </span>
          <span className="text-xs text-text-tertiary block mb-3">
            Idioma de la interfaz
          </span>
          <SegmentedButton
            options={[
              { label: 'Espanol', value: 'es' },
              { label: 'English', value: 'en' },
            ]}
            value={language as string}
            onChange={(val) => handleSettingChange('language', val, 'Idioma')}
          />
        </div>
      </SettingsCard>

      {/* Cuenta */}
      <SettingsCard
        icon={UserCog}
        iconColor="#EF4444"
        title="Cuenta"
        delay={0.25}
        borderTopColor="#EF4444"
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            onClick={() => setShowPasswordModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-semibold text-accent-blue bg-[rgba(59,130,246,0.1)] border border-[rgba(59,130,246,0.25)] hover:bg-[rgba(59,130,246,0.2)] transition-all cursor-pointer"
          >
            <Key size={16} />
            Cambiar Contrasena
          </button>
          <button
            onClick={() => setShowLogoutModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-semibold text-accent-red bg-transparent border border-[rgba(239,68,68,0.25)] hover:bg-accent-red/10 transition-all cursor-pointer"
          >
            <LogOut size={16} />
            Cerrar Sesion
          </button>
        </div>
      </SettingsCard>

      {/* Modals */}
      <ChangePasswordModal
        open={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
      <LogoutConfirmModal
        open={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
      />
    </div>
  );
}
