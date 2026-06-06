import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserPlus, Users, Search, X, Pencil, Trash2, DollarSign,
  Phone, User, Save, MessageSquare, AlertTriangle,
} from 'lucide-react';
import type { Contact } from '@/lib/storage';
import { getContacts, addContact, addAbono } from '@/lib/storage';

const STORAGE_KEY = 'fsb_contacts';
const AUTH_PIN = '1234';

function getStoredContacts(): Contact[] {
  const existing = getContacts();
  if (existing.length === 0) {
    const seeded: Contact[] = [
      { id: 'c-1', name: 'Juan Perez', phone: '809-555-0101', category: 'Jugador', createdAt: Date.now(), creditLimit: 5000, creditUsed: 1200, isActive: true },
      { id: 'c-2', name: 'Maria Garcia', phone: '809-555-0102', category: 'Jugador', createdAt: Date.now(), creditLimit: 3000, creditUsed: 0, isActive: true },
      { id: 'c-3', name: 'Pedro Rodriguez', phone: '809-555-0103', category: 'Cobrador', createdAt: Date.now(), creditLimit: 0, creditUsed: 0, isActive: true },
      { id: 'c-4', name: 'Ana Martinez', phone: '809-555-0104', category: 'Administrador', createdAt: Date.now(), creditLimit: 0, creditUsed: 0, isActive: true },
      { id: 'c-5', name: 'Carlos Reyes', phone: '809-555-0105', category: 'Jugador', createdAt: Date.now(), creditLimit: 8000, creditUsed: 2500, isActive: true },
      { id: 'c-6', name: 'Diana Lopez', phone: '809-555-0106', category: 'Jugador', createdAt: Date.now(), creditLimit: 6000, creditUsed: 3200, isActive: true },
      { id: 'c-7', name: 'Roberto Diaz', phone: '809-555-0107', category: 'Jugador', createdAt: Date.now(), creditLimit: 4000, creditUsed: 3900, isActive: true },
      { id: 'c-8', name: 'Sofia Morales', phone: '809-555-0108', category: 'Jugador', createdAt: Date.now(), creditLimit: 1500, creditUsed: 0, isActive: true },
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

/* ================================================================ */
/*  MODAL COMPONENT                                                  */
/* ================================================================ */
function Modal({ open, onClose, title, children, maxWidth = '400px' }: {
  open: boolean; onClose: () => void; title: string; children: React.ReactNode; maxWidth?: string;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.25, ease: easeSpring }}
            style={{ maxWidth, width: '100%' }}
            className="rounded-xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4" style={{ background: '#FFFFFF', borderBottom: '1px solid #E0E0E0' }}>
              <h3 className="text-base font-bold" style={{ color: '#191919' }}>{title}</h3>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                <X size={18} style={{ color: '#555555' }} />
              </button>
            </div>
            {/* Body */}
            <div style={{ background: '#FFFFFF' }}>
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ================================================================ */
/*  MAIN COMPONENT                                                   */
/* ================================================================ */
export default function Directorio() {
  const [activeTab, setActiveTab] = useState<'crear' | 'lista'>('crear');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [search, setSearch] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [creditLimit, setCreditLimit] = useState('');
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  /* -- modals -- */
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editContact, setEditContact] = useState<Contact | null>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editCreditLimit, setEditCreditLimit] = useState('');

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteContact, setDeleteContact] = useState<Contact | null>(null);
  const [deletePin, setDeletePin] = useState(['', '', '', '']);
  const [deleteError, setDeleteError] = useState('');

  const [abonoModalOpen, setAbonoModalOpen] = useState(false);
  const [abonoContact, setAbonoContact] = useState<Contact | null>(null);
  const [abonoAmount, setAbonoAmount] = useState('');

  const [smsModalOpen, setSmsModalOpen] = useState(false);
  const [smsContact, setSmsContact] = useState<Contact | null>(null);
  const [smsMessage, setSmsMessage] = useState('');

  const pinRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

  useEffect(() => {
    setContacts(getStoredContacts());
  }, []);

  /* -- keyboard: Enter to apply, Escape to close -- */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setEditModalOpen(false);
        setDeleteModalOpen(false);
        setAbonoModalOpen(false);
        setSmsModalOpen(false);
        return;
      }
      if (e.key === 'Enter') {
        if (editModalOpen) { handleEditSave(); return; }
        if (deleteModalOpen && deletePin.every((d) => d)) { confirmDelete(); return; }
        if (abonoModalOpen) { handleAbonoSave(); return; }
        if (smsModalOpen) { handleSmsSend(); return; }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [editModalOpen, deleteModalOpen, abonoModalOpen, smsModalOpen, deletePin, editName, editPhone, editCreditLimit, abonoAmount, smsMessage]);

  const filteredContacts = contacts.filter((c) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return c.name.toLowerCase().includes(q) || c.phone.replace(/\D/g, '').includes(q.replace(/\D/g, ''));
  });

  const validate = (): boolean => {
    const errs: { name?: string; phone?: string } = {};
    if (!name.trim()) errs.name = 'El nombre es obligatorio';
    else if (name.trim().length < 3) errs.name = 'Minimo 3 caracteres';
    const digits = phone.replace(/\D/g, '');
    if (!digits) errs.phone = 'El numero es obligatorio';
    else if (digits.length < 10) errs.phone = 'Minimo 10 digitos';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const resetForm = () => {
    setName(''); setPhone(''); setCreditLimit(''); setErrors({}); setEditingId(null);
  };

  const handleSave = () => {
    if (!validate()) return;
    if (editingId) {
      const updated = contacts.map((c) =>
        c.id === editingId ? { ...c, name: name.trim(), phone, creditLimit: parseFloat(creditLimit) || c.creditLimit } : c
      );
      setContacts(updated);
      saveContacts(updated);
    } else {
      const newContact = addContact({
        name: name.trim(), phone, category: 'Jugador', notes: '',
        creditLimit: parseFloat(creditLimit) || 0, creditUsed: 0, isActive: true,
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

  /* -- editar -- */
  const openEdit = (contact: Contact) => {
    setEditContact(contact);
    setEditName(contact.name);
    setEditPhone(contact.phone);
    setEditCreditLimit(contact.creditLimit.toString());
    setEditModalOpen(true);
  };

  const handleEditSave = () => {
    if (!editContact) return;
    const updated = contacts.map((c) =>
      c.id === editContact.id ? { ...c, name: editName.trim(), phone: editPhone, creditLimit: parseFloat(editCreditLimit) || c.creditLimit } : c
    );
    setContacts(updated);
    saveContacts(updated);
    setEditModalOpen(false);
    setEditContact(null);
  };

  /* -- borrar con PIN -- */
  const openDelete = (contact: Contact) => {
    setDeleteContact(contact);
    setDeletePin(['', '', '', '']);
    setDeleteError('');
    setDeleteModalOpen(true);
  };

  const handleDeletePin = (idx: number, val: string) => {
    const digit = val.replace(/\D/g, '').slice(0, 1);
    const newPin = [...deletePin];
    newPin[idx] = digit;
    setDeletePin(newPin);
    if (digit && idx < 3) pinRefs[idx + 1].current?.focus();
  };

  const confirmDelete = () => {
    if (deletePin.join('') !== AUTH_PIN) {
      setDeleteError('PIN incorrecto');
      setDeletePin(['', '', '', '']);
      pinRefs[0].current?.focus();
      return;
    }
    if (deleteContact) {
      const updated = contacts.filter((c) => c.id !== deleteContact.id);
      setContacts(updated);
      saveContacts(updated);
    }
    setDeleteModalOpen(false);
    setDeleteContact(null);
  };

  /* -- abono -- */
  const openAbono = (contact: Contact) => {
    setAbonoContact(contact);
    setAbonoAmount('');
    setAbonoModalOpen(true);
  };

  const handleAbonoSave = () => {
    const amount = parseFloat(abonoAmount);
    if (!abonoContact || !amount || amount <= 0) return;
    addAbono(abonoContact.id, amount);
    setContacts(getContacts());
    setAbonoModalOpen(false);
    setAbonoContact(null);
  };

  /* -- sms -- */
  const openSms = (contact: Contact) => {
    setSmsContact(contact);
    setSmsMessage(`Hola ${contact.name}, `);
    setSmsModalOpen(true);
  };

  const handleSmsSend = () => {
    if (smsContact) {
      const text = encodeURIComponent(smsMessage);
      window.open(`https://wa.me/${smsContact.phone.replace(/\D/g, '')}?text=${text}`, '_blank');
    }
    setSmsModalOpen(false);
  };

  const formatPhoneInput = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  const getCreditColor = (c: Contact) => {
    const avail = c.creditLimit - c.creditUsed;
    if (avail < c.creditLimit * 0.2) return { bg: 'rgba(229,57,53,0.1)', text: '#E53935' };
    if (avail < c.creditLimit * 0.5) return { bg: 'rgba(255,152,0,0.1)', text: '#FF9800' };
    return { bg: 'rgba(0,200,83,0.1)', text: '#00C853' };
  };

  /* ================================================================ */
  return (
    <div className="px-4 md:px-6 lg:px-8 py-5" style={{ background: '#F0F2F5', minHeight: '100%' }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-semibold" style={{ color: '#191919' }}>Directorio de Clientes</h1>
          <button
            onClick={() => { resetForm(); setActiveTab('crear'); }}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-lg transition-all active:scale-95"
            style={{ background: '#0288D1' }}
          >
            <UserPlus size={16} /> Crear cliente
          </button>
        </div>
        <p className="text-sm mb-4 md:mb-6" style={{ color: '#555555' }}>Gestiona clientes, creditos y abonos</p>
      </motion.div>

      <div className="flex flex-col md:flex-row gap-4 md:gap-6">
        {/* Left: Form */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, ease: easeSpring }} className="w-full md:w-[380px] md:shrink-0">
          {/* Tabs */}
          <div className="flex gap-1 p-1 rounded-lg mb-4" style={{ background: '#FFFFFF', border: '1px solid #E0E0E0' }}>
            <button onClick={() => setActiveTab('crear')} className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-md transition-all flex-1 justify-center ${activeTab === 'crear' ? 'text-white' : 'text-gray-500 hover:text-gray-700'}`} style={activeTab === 'crear' ? { background: '#0288D1' } : {}}>
              <UserPlus size={15} /> Crear
            </button>
            <button onClick={() => setActiveTab('lista')} className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-md transition-all flex-1 justify-center ${activeTab === 'lista' ? 'text-white' : 'text-gray-500 hover:text-gray-700'}`} style={activeTab === 'lista' ? { background: '#0288D1' } : {}}>
              <Users size={15} /> Lista ({contacts.length})
            </button>
          </div>

          {activeTab === 'crear' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl p-5 md:p-6" style={{ background: '#FFFFFF', border: '1px solid #E0E0E0' }}>
              <h3 className="text-base font-bold mb-4" style={{ color: '#191919' }}>{editingId ? 'Editar Cliente' : 'Nuevo Cliente'}</h3>

              {/* Name */}
              <div className="mb-4">
                <label className="block text-xs font-bold mb-1.5" style={{ color: '#555555' }}>Nombre completo</label>
                <input type="text" value={name} onChange={(e) => { setName(e.target.value); if (errors.name) setErrors((p) => ({ ...p, name: undefined })); }}
                  placeholder="Ej: Juan Perez" className="w-full px-3.5 py-2.5 border rounded-lg text-sm outline-none transition-all focus:ring-2" style={{ background: '#F9F9F9', borderColor: errors.name ? '#E53935' : '#E0E0E0', color: '#191919' }} />
                {errors.name && <p className="text-xs mt-1" style={{ color: '#E53935' }}>{errors.name}</p>}
              </div>

              {/* Phone */}
              <div className="mb-4">
                <label className="block text-xs font-bold mb-1.5" style={{ color: '#555555' }}>Numero de telefono</label>
                <input type="text" value={phone} onChange={(e) => { setPhone(formatPhoneInput(e.target.value)); if (errors.phone) setErrors((p) => ({ ...p, phone: undefined })); }}
                  placeholder="809-555-0000" className="w-full px-3.5 py-2.5 border rounded-lg text-sm outline-none transition-all focus:ring-2" style={{ background: '#F9F9F9', borderColor: errors.phone ? '#E53935' : '#E0E0E0', color: '#191919' }} />
                {errors.phone && <p className="text-xs mt-1" style={{ color: '#E53935' }}>{errors.phone}</p>}
              </div>

              {/* Credit Limit */}
              <div className="mb-5">
                <label className="block text-xs font-bold mb-1.5" style={{ color: '#555555' }}>Limite de credito ($)</label>
                <input type="number" value={creditLimit} onChange={(e) => setCreditLimit(e.target.value)}
                  placeholder="0 = Sin credito" className="w-full px-3.5 py-2.5 border rounded-lg text-sm outline-none transition-all focus:ring-2" style={{ background: '#F9F9F9', borderColor: '#E0E0E0', color: '#191919' }} />
              </div>

              <button onClick={handleSave} className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-bold text-white rounded-lg transition-all active:scale-95" style={{ background: saveSuccess ? '#00C853' : '#0288D1' }}>
                <Save size={16} /> {saveSuccess ? 'Guardado!' : (editingId ? 'ACTUALIZAR' : 'GUARDAR')}
              </button>
            </motion.div>
          )}

          {activeTab === 'lista' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl p-8 text-center" style={{ background: '#FFFFFF', border: '1px solid #E0E0E0' }}>
              <Users size={48} className="mx-auto mb-3" style={{ color: '#E0E0E0' }} />
              <p className="text-sm" style={{ color: '#555555' }}>Seleccione "Crear" para agregar un nuevo cliente</p>
              <p className="text-xs mt-1" style={{ color: '#ABABAB' }}>Los clientes apareceran en la lista de la derecha</p>
            </motion.div>
          )}
        </motion.div>

        {/* Right: List */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, ease: easeSpring, delay: 0.1 }} className="flex-1">
          {/* Search */}
          <div className="flex items-center gap-3 mb-3">
            <div className="relative flex-1 max-w-sm">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#ABABAB' }} />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nombre o telefono..." className="w-full pl-9 pr-9 py-2.5 border rounded-lg text-sm outline-none transition-all focus:ring-2" style={{ background: '#FFFFFF', borderColor: '#E0E0E0', color: '#191919' }} />
              {search && <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2" style={{ color: '#ABABAB' }}><X size={14} /></button>}
            </div>
          </div>

          <p className="text-xs mb-3" style={{ color: '#ABABAB' }}>Resultados: {filteredContacts.length}</p>

          {/* Contact List */}
          {filteredContacts.length === 0 ? (
            <div className="rounded-xl p-10 text-center" style={{ background: '#FFFFFF', border: '1px solid #E0E0E0' }}>
              <Search size={48} className="mx-auto mb-3" style={{ color: '#E0E0E0' }} />
              <p className="text-sm" style={{ color: '#555555' }}>No se encontraron datos</p>
            </div>
          ) : (
            <div className="space-y-2">
              <AnimatePresence>
                {filteredContacts.map((contact, idx) => {
                  const cc = getCreditColor(contact);
                  return (
                    <motion.div key={contact.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.15, delay: idx * 0.04 }}
                      className="flex items-center justify-between px-4 py-3.5 rounded-xl transition-all" style={{ background: '#FFFFFF', border: '1px solid #E8E8E8' }}>

                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(2,136,209,0.1)' }}>
                          <User size={18} style={{ color: '#0288D1' }} />
                        </div>
                        <div>
                          <p className="text-sm font-bold" style={{ color: '#191919' }}>{contact.name}</p>
                          <div className="flex items-center gap-1.5">
                            <Phone size={12} style={{ color: '#ABABAB' }} />
                            <span className="text-sm font-mono" style={{ color: '#555555' }}>{contact.phone}</span>
                          </div>
                          {contact.creditLimit > 0 && (
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: cc.bg, color: cc.text }}>
                                Cred: ${(contact.creditLimit - contact.creditUsed).toFixed(0)} / ${contact.creditLimit.toFixed(0)}
                              </span>
                              <span className="text-[10px]" style={{ color: '#ABABAB' }}>Usado: ${contact.creditUsed.toFixed(0)}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions - always visible */}
                      <div className="flex items-center gap-1">
                        {contact.creditLimit > 0 && (
                          <button onClick={() => openAbono(contact)} className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors" style={{ background: 'rgba(0,200,83,0.08)', color: '#00C853' }} title="Abonar">
                            <DollarSign size={14} />
                          </button>
                        )}
                        <button onClick={() => openEdit(contact)} className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:bg-gray-100" style={{ color: '#555555' }} title="Editar">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => openDelete(contact)} className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:bg-red-50" style={{ color: '#E53935' }} title="Eliminar">
                          <Trash2 size={14} />
                        </button>
                        <button onClick={() => openSms(contact)} className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:bg-green-50" style={{ color: '#128C7E' }} title="WhatsApp">
                          <MessageSquare size={14} />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>

      {/* ===================== MODAL: EDITAR ===================== */}
      <Modal open={editModalOpen} onClose={() => setEditModalOpen(false)} title="Editar Cliente">
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold mb-1.5" style={{ color: '#555555' }}>Nombre</label>
            <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full px-3.5 py-2.5 border rounded-lg text-sm outline-none" style={{ background: '#F9F9F9', borderColor: '#E0E0E0', color: '#191919' }} />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1.5" style={{ color: '#555555' }}>Telefono</label>
            <input type="text" value={editPhone} onChange={(e) => setEditPhone(formatPhoneInput(e.target.value))} className="w-full px-3.5 py-2.5 border rounded-lg text-sm outline-none" style={{ background: '#F9F9F9', borderColor: '#E0E0E0', color: '#191919' }} />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1.5" style={{ color: '#555555' }}>Limite de credito ($)</label>
            <input type="number" value={editCreditLimit} onChange={(e) => setEditCreditLimit(e.target.value)} className="w-full px-3.5 py-2.5 border rounded-lg text-sm outline-none" style={{ background: '#F9F9F9', borderColor: '#E0E0E0', color: '#191919' }} />
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={() => setEditModalOpen(false)} className="flex-1 py-2.5 rounded-lg text-sm font-bold transition-all" style={{ background: '#F5F5F5', color: '#555555' }}>Cancelar</button>
            <button onClick={handleEditSave} className="flex-1 py-2.5 rounded-lg text-sm font-bold text-white transition-all" style={{ background: '#0288D1' }}>Guardar</button>
          </div>
        </div>
      </Modal>

      {/* ===================== MODAL: BORRAR CON PIN ===================== */}
      <Modal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Confirmar Eliminacion">
        <div className="p-5">
          <div className="flex items-center gap-3 mb-4 p-3 rounded-lg" style={{ background: 'rgba(229,57,53,0.08)' }}>
            <AlertTriangle size={24} style={{ color: '#E53935' }} />
            <div>
              <p className="text-sm font-bold" style={{ color: '#E53935' }}>Eliminar {deleteContact?.name}?</p>
              <p className="text-xs" style={{ color: '#555555' }}>Esta accion no se puede deshacer.</p>
            </div>
          </div>

          <p className="text-xs font-bold mb-2" style={{ color: '#555555' }}>Ingrese PIN de autorizacion (1234):</p>
          <div className="flex gap-2 justify-center mb-3">
            {[0, 1, 2, 3].map((i) => (
              <input key={i} ref={pinRefs[i]} type="password" inputMode="numeric" maxLength={1}
                value={deletePin[i]} onChange={(e) => handleDeletePin(i, e.target.value)}
                className="w-12 h-12 text-center text-xl font-bold border-2 rounded-lg outline-none transition-all"
                style={{ background: '#F9F9F9', borderColor: deleteError ? '#E53935' : '#E0E0E0', color: '#191919' }} />
            ))}
          </div>
          {deleteError && <p className="text-xs text-center mb-3" style={{ color: '#E53935' }}>{deleteError}</p>}

          <div className="flex gap-2">
            <button onClick={() => setDeleteModalOpen(false)} className="flex-1 py-2.5 rounded-lg text-sm font-bold transition-all" style={{ background: '#F5F5F5', color: '#555555' }}>Cancelar</button>
            <button onClick={confirmDelete} className="flex-1 py-2.5 rounded-lg text-sm font-bold text-white transition-all" style={{ background: '#E53935' }}>Eliminar</button>
          </div>
        </div>
      </Modal>

      {/* ===================== MODAL: ABONO ===================== */}
      <Modal open={abonoModalOpen} onClose={() => setAbonoModalOpen(false)} title="Registrar Abono">
        <div className="p-5">
          {abonoContact && (
            <div className="mb-4 p-3 rounded-lg" style={{ background: '#F9F9F9' }}>
              <p className="text-sm font-bold" style={{ color: '#191919' }}>{abonoContact.name}</p>
              <p className="text-xs" style={{ color: '#555555' }}>Credito usado: <span className="font-bold" style={{ color: '#FF9800' }}>${abonoContact.creditUsed.toFixed(2)}</span></p>
              <p className="text-xs" style={{ color: '#555555' }}>Disponible: <span className="font-bold" style={{ color: '#00C853' }}>${(abonoContact.creditLimit - abonoContact.creditUsed).toFixed(2)}</span></p>
            </div>
          )}
          <label className="block text-xs font-bold mb-1.5" style={{ color: '#555555' }}>Monto del abono ($)</label>
          <input type="number" value={abonoAmount} onChange={(e) => setAbonoAmount(e.target.value)}
            placeholder="0.00" className="w-full px-3.5 py-2.5 border rounded-lg text-sm outline-none mb-4" style={{ background: '#F9F9F9', borderColor: '#E0E0E0', color: '#191919' }} />
          <div className="flex gap-2">
            <button onClick={() => setAbonoModalOpen(false)} className="flex-1 py-2.5 rounded-lg text-sm font-bold transition-all" style={{ background: '#F5F5F5', color: '#555555' }}>Cancelar</button>
            <button onClick={handleAbonoSave} className="flex-1 py-2.5 rounded-lg text-sm font-bold text-white transition-all" style={{ background: '#00C853' }}>Registrar</button>
          </div>
        </div>
      </Modal>

      {/* ===================== MODAL: SMS / WHATSAPP ===================== */}
      <Modal open={smsModalOpen} onClose={() => setSmsModalOpen(false)} title="Enviar WhatsApp">
        <div className="p-5">
          {smsContact && (
            <div className="mb-4 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(18,140,126,0.1)' }}>
                <MessageSquare size={16} style={{ color: '#128C7E' }} />
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: '#191919' }}>{smsContact.name}</p>
                <p className="text-xs font-mono" style={{ color: '#555555' }}>{smsContact.phone}</p>
              </div>
            </div>
          )}
          <label className="block text-xs font-bold mb-1.5" style={{ color: '#555555' }}>Mensaje</label>
          <textarea value={smsMessage} onChange={(e) => setSmsMessage(e.target.value)} rows={4}
            className="w-full px-3.5 py-2.5 border rounded-lg text-sm outline-none resize-none mb-4" style={{ background: '#F9F9F9', borderColor: '#E0E0E0', color: '#191919' }} />
          <div className="flex gap-2">
            <button onClick={() => setSmsModalOpen(false)} className="flex-1 py-2.5 rounded-lg text-sm font-bold transition-all" style={{ background: '#F5F5F5', color: '#555555' }}>Cancelar</button>
            <button onClick={handleSmsSend} className="flex-1 py-2.5 rounded-lg text-sm font-bold text-white transition-all flex items-center justify-center gap-2" style={{ background: '#128C7E' }}>
              <MessageSquare size={14} /> Enviar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
