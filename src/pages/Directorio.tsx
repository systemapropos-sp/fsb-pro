import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserPlus,
  Users,
  Search,
  X,
  Pencil,
  Trash2,
  DollarSign,
  Phone,
  User,
  Save,
  MessageSquare,
} from 'lucide-react';
import type { Contact } from '@/lib/storage';
import { getContacts, addContact, addAbono } from '@/lib/storage';

const STORAGE_KEY = 'fsb_contacts';

function getStoredContacts(): Contact[] {
  const existing = getContacts();
  if (existing.length === 0) {
    const seeded: Contact[] = [
      { id: 'c-1', name: 'Juan Perez', phone: '809-555-0101', category: 'Jugador', createdAt: Date.now(), creditLimit: 5000, creditUsed: 1200, isActive: true },
      { id: 'c-2', name: 'Maria Garcia', phone: '809-555-0102', category: 'Jugador', createdAt: Date.now(), creditLimit: 3000, creditUsed: 0, isActive: true },
      { id: 'c-3', name: 'Pedro Rodriguez', phone: '809-555-0103', category: 'Cobrador', createdAt: Date.now(), creditLimit: 0, creditUsed: 0, isActive: true },
      { id: 'c-4', name: 'Ana Martinez', phone: '809-555-0104', category: 'Administrador', createdAt: Date.now(), creditLimit: 0, creditUsed: 0, isActive: true },
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }
  return existing;
}

function saveContacts(contacts: Contact[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
}

const easeSpring = [0.16, 1, 0.3, 1] as [number, number, number, number];

export default function Directorio() {
  const [activeTab, setActiveTab] = useState<'crear' | 'lista'>('crear');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [search, setSearch] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setContacts(getStoredContacts());
  }, []);

  const filteredContacts = contacts.filter((c) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      c.phone.replace(/\D/g, '').includes(q.replace(/\D/g, ''))
    );
  });

  const validate = (): boolean => {
    const errs: { name?: string; phone?: string } = {};
    const nameTrim = name.trim();
    if (!nameTrim) {
      errs.name = 'El nombre es obligatorio';
    } else if (nameTrim.length < 3) {
      errs.name = 'Minimo 3 caracteres';
    }
    const phoneDigits = phone.replace(/\D/g, '');
    if (!phoneDigits) {
      errs.phone = 'El numero es obligatorio';
    } else if (phoneDigits.length < 10) {
      errs.phone = 'Minimo 10 digitos';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const resetForm = () => {
    setName('');
    setPhone('');
    setErrors({});
    setEditingId(null);
  };

  const handleSave = () => {
    if (!validate()) return;

    if (editingId) {
      const updated = contacts.map((c) =>
        c.id === editingId ? { ...c, name: name.trim(), phone } : c
      );
      setContacts(updated);
      saveContacts(updated);
    } else {
      const newContact = addContact({
        name: name.trim(),
        phone,
        category: 'Jugador',
        notes: '',
        creditLimit: 0,
        creditUsed: 0,
        isActive: true,
      });
      const updated = [...contacts, newContact];
      setContacts(updated);
      saveContacts(updated);
    }

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 1500);
    resetForm();
    setActiveTab('lista');
  };

  const handleEdit = (contact: Contact) => {
    setName(contact.name);
    setPhone(contact.phone);
    setEditingId(contact.id);
    setErrors({});
    setActiveTab('crear');
  };

  const handleDelete = (id: string) => {
    const updated = contacts.filter((c) => c.id !== id);
    setContacts(updated);
    saveContacts(updated);
  };

  const handleAbono = (contact: Contact) => {
    const amount = parseFloat(prompt(`Registrar abono para ${contact.name}\nCredito usado: $${contact.creditUsed.toFixed(2)}\nLimite: $${contact.creditLimit.toFixed(2)}\n\nMonto del abono:`, '0') || '0');
    if (amount > 0) {
      addAbono(contact.id, amount);
      // Refresh contacts
      setContacts(getContacts());
      alert(`Abono de $${amount.toFixed(2)} registrado para ${contact.name}`);
    }
  };

  const formatPhoneInput = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  return (
    <div className="px-4 md:px-6 lg:px-8 py-5">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-semibold text-text-primary">Directorio Telefonico</h1>
          <button
            onClick={() => {
              resetForm();
              setActiveTab('crear');
            }}
            className="flex items-center gap-2 px-5 min-h-[44px] text-sm font-semibold text-white rounded-md gradient-accent hover:brightness-110 hover:-translate-y-px hover:shadow-accent transition-all duration-200 active:scale-[0.98]"
          >
            <UserPlus size={16} />
            Crear contacto
          </button>
        </div>
        <p className="text-xs text-text-tertiary mb-4 md:mb-6">Inicio / Directorio</p>
      </motion.div>

      <div className="flex flex-col md:flex-row gap-4 md:gap-6">
        {/* Left: Tabs + Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, ease: easeSpring }}
          className="w-full md:w-[400px] md:shrink-0"
        >
          {/* Tabs */}
          <div className="flex gap-1 p-1 rounded-md bg-[rgba(17,24,39,0.8)] mb-4 overflow-x-auto flex-nowrap">
            <button
              onClick={() => setActiveTab('crear')}
              className={`flex items-center gap-2 px-5 py-2 text-sm font-medium rounded-sm transition-all duration-200 flex-1 justify-center ${
                activeTab === 'crear'
                  ? 'text-text-primary bg-[rgba(59,130,246,0.15)] border border-[rgba(59,130,246,0.3)]'
                  : 'text-text-muted bg-transparent hover:text-text-secondary'
              }`}
            >
              <UserPlus size={15} />
              Crear
            </button>
            <button
              onClick={() => setActiveTab('lista')}
              className={`flex items-center gap-2 px-5 py-2 text-sm font-medium rounded-sm transition-all duration-200 flex-1 justify-center ${
                activeTab === 'lista'
                  ? 'text-text-primary bg-[rgba(59,130,246,0.15)] border border-[rgba(59,130,246,0.3)]'
                  : 'text-text-muted bg-transparent hover:text-text-secondary'
              }`}
            >
              <Users size={15} />
              Lista
            </button>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'crear' ? (
              <motion.div
                key="crear"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="gradient-panel rounded-lg border border-border-subtle p-4 md:p-5"
              >
                <h3 className="text-base md:text-lg font-semibold text-text-primary mb-4">
                  {editingId ? 'Editar Contacto' : 'Crear Contacto'}
                </h3>

                {/* Name */}
                <div className="mb-4">
                  <label className="block text-xs text-text-tertiary mb-1.5">
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.name) setErrors((p) => ({ ...p, name: undefined }));
                    }}
                    placeholder="Ej: Juan Perez"
                    className={`w-full px-3.5 py-2.5 bg-[rgba(30,41,59,0.6)] border rounded-md text-body text-text-primary placeholder-text-tertiary outline-none transition-all duration-200 focus:border-accent-blue focus:ring-[0_0_0_3px_rgba(59,130,246,0.2)] ${
                      errors.name ? 'border-accent-red' : 'border-border-default'
                    }`}
                  />
                  {errors.name && (
                    <p className="text-xs text-accent-red mt-1">{errors.name}</p>
                  )}
                </div>

                {/* Phone */}
                <div className="mb-5">
                  <label className="block text-xs text-text-tertiary mb-1.5">
                    Numero de telefono
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => {
                      setPhone(formatPhoneInput(e.target.value));
                      if (errors.phone) setErrors((p) => ({ ...p, phone: undefined }));
                    }}
                    placeholder="809-555-0000"
                    className={`w-full px-3.5 py-2.5 bg-[rgba(30,41,59,0.6)] border rounded-md text-body text-text-primary placeholder-text-tertiary outline-none transition-all duration-200 focus:border-accent-blue focus:ring-[0_0_0_3px_rgba(59,130,246,0.2)] ${
                      errors.phone ? 'border-accent-red' : 'border-border-default'
                    }`}
                  />
                  {errors.phone && (
                    <p className="text-xs text-accent-red mt-1">{errors.phone}</p>
                  )}
                </div>

                {/* Submit */}
                <button
                  onClick={handleSave}
                  className={`w-full flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-md transition-all duration-200 active:scale-[0.98] ${
                    saveSuccess
                      ? 'bg-accent-green hover:brightness-110'
                      : 'gradient-accent hover:brightness-110 hover:-translate-y-px hover:shadow-accent'
                  }`}
                >
                  {saveSuccess ? (
                    <>
                      <Save size={16} />
                      Guardado
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      {editingId ? 'ACTUALIZAR CONTACTO' : 'GUARDAR CONTACTO'}
                    </>
                  )}
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="lista-placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="gradient-panel rounded-lg border border-border-subtle p-6 md:p-8 text-center"
              >
                <Users size={48} className="mx-auto mb-3" style={{ color: 'rgba(100,116,139,0.2)' }} />
                <p className="text-body-lg text-text-tertiary mb-1">Seleccione la pestana Lista</p>
                <p className="text-sm text-text-muted">
                  Use la pestana "Lista" para ver todos los contactos
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Right: Contact List */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, ease: easeSpring, delay: 0.1 }}
          className="flex-1"
        >
          {/* Search */}
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <label className="text-sm text-text-secondary font-medium">Buscar:</label>
            <div className="relative w-full md:flex-1 md:max-w-sm">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nombre o telefono..."
                className="w-full pl-9 pr-9 py-2 bg-[rgba(30,41,59,0.6)] border border-border-default rounded-md text-sm text-text-primary placeholder-text-tertiary outline-none transition-all duration-200 focus:border-accent-blue focus:ring-[0_0_0_3px_rgba(59,130,246,0.2)]"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary transition-colors"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Results count */}
          <p className="text-xs text-text-tertiary mb-3">
            Resultados: {filteredContacts.length}
          </p>

          {/* Contact list */}
          {filteredContacts.length === 0 ? (
            <div className="gradient-panel rounded-lg border border-border-subtle p-10 text-center">
              <Search size={48} className="mx-auto mb-3" style={{ color: 'rgba(100,116,139,0.2)' }} />
              <p className="text-sm text-text-tertiary mb-1">No se encontraron datos</p>
              <p className="text-xs text-text-muted">Intente con otro termino de busqueda</p>
            </div>
          ) : (
            <div className="space-y-2">
              <AnimatePresence>
                {filteredContacts.map((contact, idx) => (
                  <motion.div
                    key={contact.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.15, delay: idx * 0.04 }}
                    className="group flex items-center justify-between px-4 py-3.5 rounded-md bg-[rgba(30,41,59,0.4)] border border-[rgba(148,163,184,0.08)] hover:bg-[rgba(59,130,246,0.06)] transition-colors duration-150"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-accent-blue/20 flex items-center justify-center shrink-0">
                        <User size={16} className="text-accent-blue" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-text-primary">
                          {contact.name}
                        </p>
                        <div className="flex items-center gap-1.5 text-text-tertiary">
                          <Phone size={12} />
                          <span className="text-sm font-mono text-text-secondary">
                            {contact.phone}
                          </span>
                        </div>
                        {contact.creditLimit > 0 && (
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{
                              background: (contact.creditLimit - contact.creditUsed) < contact.creditLimit * 0.2
                                ? 'rgba(229,57,53,0.1)' : (contact.creditLimit - contact.creditUsed) < contact.creditLimit * 0.5
                                ? 'rgba(255,152,0,0.1)' : 'rgba(0,200,83,0.1)',
                              color: (contact.creditLimit - contact.creditUsed) < contact.creditLimit * 0.2
                                ? '#E53935' : (contact.creditLimit - contact.creditUsed) < contact.creditLimit * 0.5
                                ? '#FF9800' : '#00C853',
                            }}>
                              Cred: ${(contact.creditLimit - contact.creditUsed).toFixed(0)} / ${contact.creditLimit.toFixed(0)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                      {contact.creditLimit > 0 && (
                        <button
                          onClick={() => handleAbono(contact)}
                          className="w-8 h-8 flex items-center justify-center rounded-md bg-[rgba(0,200,83,0.08)] hover:bg-[rgba(0,200,83,0.15)] text-text-secondary hover:text-[#00C853] transition-colors"
                          title="Registrar abono"
                        >
                          <DollarSign size={14} />
                        </button>
                      )}
                      <button
                        onClick={() => handleEdit(contact)}
                        className="w-8 h-8 flex items-center justify-center rounded-md bg-[rgba(148,163,184,0.06)] hover:bg-[rgba(148,163,184,0.12)] text-text-secondary hover:text-text-primary transition-colors"
                        title="Editar"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(contact.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-md bg-[rgba(148,163,184,0.06)] hover:bg-accent-red/10 text-text-secondary hover:text-accent-red transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 size={14} />
                      </button>
                      <button
                        className="w-8 h-8 flex items-center justify-center rounded-md bg-[rgba(148,163,184,0.06)] hover:bg-accent-green/10 text-text-secondary hover:text-accent-green transition-colors"
                        title="Enviar SMS"
                      >
                        <MessageSquare size={14} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
