// ============================================
// FSB Pro - localStorage Data Layer
// ============================================

// --- Types ---

export interface User {
  id: string;
  username: string;
  pinHash: string;
  passwordHash: string;
  role: 'admin' | 'seller';
  createdAt: number;
}

export interface Play {
  id: string;
  team: string;
  teamCode: string;
  playType: string;
  detail: string;
  line: number;
  player: string;
  points: number;
  odds: number;
  isIF: boolean;
}

export interface Ticket {
  id: string;
  seller: string;
  date: string;
  plays: Play[];
  amount: number;
  payout: number;
  profit: number;
  status: 'pendiente' | 'ganador' | 'perdedor' | 'cancelado' | 'pagado';
  createdAt: number;
  paidAt?: number;
}

export interface BettingLine {
  id: string;
  sport: string;
  period: string;
  awayTeam: string;
  awayTeamCode: string;
  homeTeam: string;
  homeTeamCode: string;
  time: string;
  moneyLine: { away: number; home: number };
  runLine: { away: number; home: number };
  spread: { away: number; home: number };
  solo: { away: number; home: number };
  points: { over: number; under: number; value: number };
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  category: string;
  notes?: string;
  createdAt: number;
}

export interface Transaction {
  id: string;
  ticketId: string;
  type: 'venta' | 'pago' | 'cancelacion';
  amount: number;
  date: string;
  seller: string;
  description: string;
  createdAt: number;
}

export interface Setting {
  key: string;
  value: string | number | boolean;
  category: string;
}

export interface LoginAttempt {
  count: number;
  lastAttempt: number;
  lockedUntil: number | null;
}

// --- Constants ---

const STORAGE_KEYS = {
  USER: 'fsb_user',
  USERS: 'fsb_users',
  AUTH_TOKEN: 'fsb_auth_token',
  AUTH_EXPIRY: 'fsb_auth_expiry',
  TICKETS: 'fsb_tickets',
  LINES: 'fsb_lines',
  CONTACTS: 'fsb_contacts',
  TRANSACTIONS: 'fsb_transactions',
  SETTINGS: 'fsb_settings',
  LOGIN_ATTEMPTS: 'fsb_login_attempts',
  ACTIVITY_LOG: 'fsb_activity_log',
  SELECTED_PLAYS: 'fsb_selected_plays',
} as const;

const DEFAULT_PIN = '1234';
const DEFAULT_USERNAME = 'mmw03';
const DEFAULT_PASSWORD = 'admin123';
const SESSION_DURATION = 2 * 60 * 60 * 1000; // 2 hours
const RATE_LIMIT_ATTEMPTS = 5;
const RATE_LOCKOUT = 15 * 60 * 1000; // 15 minutes

// --- localStorage Helpers ---

function getItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function setItem(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value));
}

function removeItem(key: string): void {
  localStorage.removeItem(key);
}

// --- Seeding ---

function seedUsers(): User[] {
  const users: User[] = [
    {
      id: 'user-001',
      username: DEFAULT_USERNAME,
      pinHash: btoa(DEFAULT_PIN), // simple hash for demo
      passwordHash: btoa(DEFAULT_PASSWORD),
      role: 'admin',
      createdAt: Date.now(),
    },
  ];
  setItem(STORAGE_KEYS.USERS, users);
  return users;
}

function seedLines(): BettingLine[] {
  const sports = ['NBA', 'MLB', 'NFL', 'WNBA', 'CFL'];
  const teams: Record<string, [string, string, string, string][]> = {
    NBA: [
      ['Lakers', 'LAL', 'Warriors', 'GSW'],
      ['Celtics', 'BOS', 'Heat', 'MIA'],
      ['Bulls', 'CHI', 'Knicks', 'NYK'],
      ['Suns', 'PHX', 'Nuggets', 'DEN'],
      ['Bucks', 'MIL', '76ers', 'PHI'],
      ['Mavericks', 'DAL', 'Clippers', 'LAC'],
    ],
    MLB: [
      ['Yankees', 'NYY', 'Red Sox', 'BOS'],
      ['Dodgers', 'LAD', 'Giants', 'SF'],
      ['Cubs', 'CHC', 'Cardinals', 'STL'],
      ['Astros', 'HOU', 'Rangers', 'TEX'],
    ],
    NFL: [
      ['Chiefs', 'KC', 'Bills', 'BUF'],
      ['Cowboys', 'DAL', 'Eagles', 'PHI'],
      ['Packers', 'GB', 'Bears', 'CHI'],
      ['49ers', 'SF', 'Seahawks', 'SEA'],
    ],
    WNBA: [
      ['Aces', 'LVA', 'Liberty', 'NYL'],
      ['Sky', 'CHI', 'Fever', 'IND'],
      ['Storm', 'SEA', 'Mercury', 'PHX'],
    ],
    CFL: [
      ['Argonauts', 'TOR', 'Tiger-Cats', 'HAM'],
      ['Roughriders', 'SSK', 'Blue Bombers', 'WPG'],
    ],
  };

  const periods = ['Juego Completo', 'Primera Mitad', 'Periodos'];
  const lines: BettingLine[] = [];
  let idCounter = 1;

  sports.forEach((sport) => {
    const sportTeams = teams[sport] || [];
    sportTeams.forEach(([awayName, awayCode, homeName, homeCode]) => {
      periods.forEach((period) => {
        const mlAway = Math.random() > 0.5
          ? +(100 + Math.floor(Math.random() * 150)).toString()
          : -(100 + Math.floor(Math.random() * 180)).toString();
        const mlHome = Math.random() > 0.5
          ? +(100 + Math.floor(Math.random() * 150)).toString()
          : -(100 + Math.floor(Math.random() * 180)).toString();

        lines.push({
          id: `line-${idCounter++}`,
          sport,
          period,
          awayTeam: awayName,
          awayTeamCode: awayCode,
          homeTeam: homeName,
          homeTeamCode: homeCode,
          time: `${Math.floor(Math.random() * 12) + 1}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')} ${Math.random() > 0.5 ? 'PM' : 'AM'}`,
          moneyLine: {
            away: +mlAway,
            home: +mlHome,
          },
          runLine: {
            away: +(Math.random() * 10 + 1).toFixed(1),
            home: +(-(Math.random() * 10 + 1)).toFixed(1),
          },
          spread: {
            away: +(Math.random() * 15 + 1).toFixed(1),
            home: +(-(Math.random() * 15 + 1)).toFixed(1),
          },
          solo: {
            away: +(100 + Math.floor(Math.random() * 50)),
            home: -(100 + Math.floor(Math.random() * 50)),
          },
          points: {
            over: +(Math.random() * 30 + 180).toFixed(1),
            under: +(Math.random() * 30 + 180).toFixed(1),
            value: +(Math.random() * 10 + 5).toFixed(1),
          },
        });
      });
    });
  });

  setItem(STORAGE_KEYS.LINES, lines);
  return lines;
}

function seedContacts(): Contact[] {
  const contacts: Contact[] = [
    { id: 'c-1', name: 'Juan Perez', phone: '809-555-0101', category: 'Jugador', createdAt: Date.now() },
    { id: 'c-2', name: 'Maria Garcia', phone: '809-555-0102', category: 'Jugador', createdAt: Date.now() },
    { id: 'c-3', name: 'Pedro Rodriguez', phone: '809-555-0103', category: 'Cobrador', createdAt: Date.now() },
    { id: 'c-4', name: 'Ana Martinez', phone: '809-555-0104', category: 'Administrador', createdAt: Date.now() },
    { id: 'c-5', name: 'Luis Sanchez', phone: '809-555-0105', category: 'Jugador', createdAt: Date.now() },
  ];
  setItem(STORAGE_KEYS.CONTACTS, contacts);
  return contacts;
}

function seedSettings(): Setting[] {
  const settings: Setting[] = [
    { key: 'language', value: 'es', category: 'general' },
    { key: 'print_auto', value: true, category: 'print' },
    { key: 'sms_enabled', value: false, category: 'notifications' },
    { key: 'code_length', value: 6, category: 'general' },
    { key: 'max_bet_amount', value: 50000, category: 'limits' },
    { key: 'min_bet_amount', value: 100, category: 'limits' },
  ];
  setItem(STORAGE_KEYS.SETTINGS, settings);
  return settings;
}

export function seedInitialData(): void {
  const existingUsers = localStorage.getItem(STORAGE_KEYS.USERS);
  if (!existingUsers) {
    seedUsers();
  }

  const existingLines = localStorage.getItem(STORAGE_KEYS.LINES);
  if (!existingLines) {
    seedLines();
  }

  const existingContacts = localStorage.getItem(STORAGE_KEYS.CONTACTS);
  if (!existingContacts) {
    seedContacts();
  }

  const existingSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  if (!existingSettings) {
    seedSettings();
  }

  // Ensure login attempts tracking exists
  const existingAttempts = localStorage.getItem(STORAGE_KEYS.LOGIN_ATTEMPTS);
  if (!existingAttempts) {
    setItem(STORAGE_KEYS.LOGIN_ATTEMPTS, {
      count: 0,
      lastAttempt: 0,
      lockedUntil: null,
    });
  }
}

// --- Auth Functions ---

export function getLoginAttempts(): LoginAttempt {
  return getItem<LoginAttempt>(STORAGE_KEYS.LOGIN_ATTEMPTS, {
    count: 0,
    lastAttempt: 0,
    lockedUntil: null,
  });
}

export function recordLoginAttempt(success: boolean): void {
  const attempts = getLoginAttempts();
  if (success) {
    setItem(STORAGE_KEYS.LOGIN_ATTEMPTS, {
      count: 0,
      lastAttempt: Date.now(),
      lockedUntil: null,
    });
  } else {
    const newCount = attempts.count + 1;
    const lockedUntil = newCount >= RATE_LIMIT_ATTEMPTS ? Date.now() + RATE_LOCKOUT : null;
    setItem(STORAGE_KEYS.LOGIN_ATTEMPTS, {
      count: newCount,
      lastAttempt: Date.now(),
      lockedUntil,
    });
  }
}

export function isRateLimited(): { limited: boolean; remainingMs: number } {
  const attempts = getLoginAttempts();
  if (attempts.lockedUntil && Date.now() < attempts.lockedUntil) {
    return { limited: true, remainingMs: attempts.lockedUntil - Date.now() };
  }
  // Auto-reset if lockout expired
  if (attempts.lockedUntil && Date.now() >= attempts.lockedUntil) {
    setItem(STORAGE_KEYS.LOGIN_ATTEMPTS, {
      count: 0,
      lastAttempt: 0,
      lockedUntil: null,
    });
  }
  return { limited: false, remainingMs: 0 };
}

export function loginWithPin(pin: string): boolean {
  const { limited } = isRateLimited();
  if (limited) return false;

  const users = getItem<User[]>(STORAGE_KEYS.USERS, []);
  const user = users.find((u) => u.username === DEFAULT_USERNAME);
  if (!user) return false;

  const pinMatch = btoa(pin) === user.pinHash;
  if (pinMatch) {
    recordLoginAttempt(true);
    const token = btoa(`${user.id}:${Date.now()}`);
    setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    setItem(STORAGE_KEYS.AUTH_EXPIRY, Date.now() + SESSION_DURATION);
    setItem(STORAGE_KEYS.USER, user);
    logActivity('login', 'Inicio de sesion con PIN');
    return true;
  }

  recordLoginAttempt(false);
  return false;
}

export function loginWithPassword(username: string, password: string): boolean {
  const { limited } = isRateLimited();
  if (limited) return false;

  const users = getItem<User[]>(STORAGE_KEYS.USERS, []);
  const user = users.find(
    (u) => u.username.toLowerCase() === username.trim().toLowerCase()
  );
  if (!user) {
    recordLoginAttempt(false);
    return false;
  }

  const passwordMatch = btoa(password) === user.passwordHash;
  if (passwordMatch) {
    recordLoginAttempt(true);
    const token = btoa(`${user.id}:${Date.now()}`);
    setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    setItem(STORAGE_KEYS.AUTH_EXPIRY, Date.now() + SESSION_DURATION);
    setItem(STORAGE_KEYS.USER, user);
    logActivity('login', 'Inicio de sesion con usuario y contrasena');
    return true;
  }

  recordLoginAttempt(false);
  return false;
}

export function logout(): void {
  logActivity('logout', 'Cierre de sesion');
  removeItem(STORAGE_KEYS.AUTH_TOKEN);
  removeItem(STORAGE_KEYS.AUTH_EXPIRY);
  removeItem(STORAGE_KEYS.USER);
  removeItem(STORAGE_KEYS.SELECTED_PLAYS);
}

export function isAuthenticated(): boolean {
  const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  const expiry = localStorage.getItem(STORAGE_KEYS.AUTH_EXPIRY);
  if (!token || !expiry) return false;

  const expiryTime = parseInt(JSON.parse(expiry), 10);
  if (Date.now() > expiryTime) {
    logout();
    return false;
  }

  // Extend session on activity check
  setItem(STORAGE_KEYS.AUTH_EXPIRY, Date.now() + SESSION_DURATION);
  return true;
}

export function getCurrentUser(): User | null {
  return getItem<User | null>(STORAGE_KEYS.USER, null);
}

// --- Activity Logging ---

export function logActivity(action: string, description: string): void {
  const log = getItem<Array<{ action: string; description: string; timestamp: number }>>(
    STORAGE_KEYS.ACTIVITY_LOG,
    []
  );
  log.unshift({ action, description, timestamp: Date.now() });
  // Keep last 100 entries
  if (log.length > 100) log.pop();
  setItem(STORAGE_KEYS.ACTIVITY_LOG, log);
}

// --- Lines ---

export function getLines(sport?: string, period?: string): BettingLine[] {
  const lines = getItem<BettingLine[]>(STORAGE_KEYS.LINES, []);
  return lines.filter((l) => {
    if (sport && sport !== 'Todos' && l.sport !== sport) return false;
    if (period && l.period !== period) return false;
    return true;
  });
}

export function getSports(): string[] {
  const lines = getItem<BettingLine[]>(STORAGE_KEYS.LINES, []);
  const sports = new Set(lines.map((l) => l.sport));
  return ['Todos', ...Array.from(sports).sort()];
}

export function getPeriods(): string[] {
  return ['Juego Completo', 'Primera Mitad', 'Segunda Mitad', 'Periodos', 'Ponches'];
}

// --- Tickets ---

export function getTickets(): Ticket[] {
  return getItem<Ticket[]>(STORAGE_KEYS.TICKETS, []);
}

export function getTicketById(id: string): Ticket | undefined {
  const tickets = getTickets();
  return tickets.find((t) => t.id === id);
}

export function createTicket(ticket: Omit<Ticket, 'id' | 'createdAt'>): Ticket {
  const tickets = getTickets();
  const randomNum = Math.floor(Math.random() * 900000 + 100000);
  const newTicket: Ticket = {
    ...ticket,
    id: `MMW-003-${randomNum}`,
    createdAt: Date.now(),
  };
  tickets.unshift(newTicket);
  setItem(STORAGE_KEYS.TICKETS, tickets);
  logActivity('ticket_created', `Ticket creado: ${newTicket.id}`);
  return newTicket;
}

export function updateTicketStatus(
  id: string,
  status: Ticket['status']
): Ticket | null {
  const tickets = getTickets();
  const idx = tickets.findIndex((t) => t.id === id);
  if (idx === -1) return null;

  tickets[idx] = {
    ...tickets[idx],
    status,
    ...(status === 'pagado' ? { paidAt: Date.now() } : {}),
  };
  setItem(STORAGE_KEYS.TICKETS, tickets);
  logActivity('ticket_updated', `Ticket ${id} actualizado a ${status}`);
  return tickets[idx];
}

export function getPendientes(): Ticket[] {
  return getTickets().filter((t) => t.status === 'ganador' && !t.paidAt);
}

// --- Selected Plays (Dashboard State) ---

export function getSelectedPlays(): Play[] {
  return getItem<Play[]>(STORAGE_KEYS.SELECTED_PLAYS, []);
}

export function addSelectedPlay(play: Play): void {
  const plays = getSelectedPlays();
  plays.push(play);
  setItem(STORAGE_KEYS.SELECTED_PLAYS, plays);
}

export function removeSelectedPlay(playId: string): void {
  const plays = getSelectedPlays().filter((p) => p.id !== playId);
  setItem(STORAGE_KEYS.SELECTED_PLAYS, plays);
}

export function clearSelectedPlays(): void {
  setItem(STORAGE_KEYS.SELECTED_PLAYS, []);
}

// --- Contacts ---

export function getContacts(): Contact[] {
  return getItem<Contact[]>(STORAGE_KEYS.CONTACTS, []);
}

export function addContact(contact: Omit<Contact, 'id' | 'createdAt'>): Contact {
  const contacts = getContacts();
  const newContact: Contact = {
    ...contact,
    id: `c-${Date.now()}`,
    createdAt: Date.now(),
  };
  contacts.push(newContact);
  setItem(STORAGE_KEYS.CONTACTS, contacts);
  return newContact;
}

// --- Transactions ---

export function getTransactions(): Transaction[] {
  return getItem<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, []);
}

export function addTransaction(
  tx: Omit<Transaction, 'id' | 'createdAt'>
): Transaction {
  const txs = getTransactions();
  const newTx: Transaction = {
    ...tx,
    id: `tx-${Date.now()}`,
    createdAt: Date.now(),
  };
  txs.unshift(newTx);
  setItem(STORAGE_KEYS.TRANSACTIONS, txs);
  return newTx;
}

// --- Settings ---

export function getSettings(): Setting[] {
  return getItem<Setting[]>(STORAGE_KEYS.SETTINGS, []);
}

export function getSetting(key: string): Setting | undefined {
  return getSettings().find((s) => s.key === key);
}

export function updateSetting(key: string, value: string | number | boolean): void {
  const settings = getSettings();
  const idx = settings.findIndex((s) => s.key === key);
  if (idx >= 0) {
    settings[idx] = { ...settings[idx], value };
  } else {
    settings.push({ key, value, category: 'general' });
  }
  setItem(STORAGE_KEYS.SETTINGS, settings);
}

// --- Formatting Helpers ---

export function formatAmount(amount: number): string {
  return `$${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatOdds(value: number): string {
  return value >= 0 ? `+${value}` : `${value}`;
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('es-DO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('es-DO', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

export function formatCountdown(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}
