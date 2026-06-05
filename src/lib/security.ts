// ============================================
// FSB Pro - Security Module
// ============================================

/** Sanitize user input to prevent XSS attacks */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
}

/** Validate PIN format (exactly 4 digits) */
export function isValidPIN(pin: string): boolean {
  return /^\d{4}$/.test(pin);
}

/** Validate team code format (4 digits) */
export function isValidTeamCodeFormat(code: string): boolean {
  return /^\d{4}$/.test(code);
}

// ============================================
// Rate Limiter - Prevents brute force attacks
// ============================================
interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const RATE_LIMIT_KEY = 'fsb_rate_limit';
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

export function getRateLimitStorage(): Map<string, RateLimitRecord> {
  try {
    const stored = localStorage.getItem(RATE_LIMIT_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return new Map(Object.entries(parsed));
    }
  } catch { /* ignore */ }
  return new Map();
}

function saveRateLimit(map: Map<string, RateLimitRecord>): void {
  const obj: Record<string, RateLimitRecord> = {};
  map.forEach((v, k) => { obj[k] = v; });
  localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(obj));
}

export function canAttemptLogin(identifier: string): boolean {
  const map = getRateLimitStorage();
  const now = Date.now();
  const record = map.get(identifier);

  if (!record) return true;
  if (now > record.resetTime) {
    map.delete(identifier);
    saveRateLimit(map);
    return true;
  }
  return record.count < MAX_ATTEMPTS;
}

export function recordLoginAttempt(identifier: string): void {
  const map = getRateLimitStorage();
  const now = Date.now();
  const record = map.get(identifier);

  if (!record || now > record.resetTime) {
    map.set(identifier, { count: 1, resetTime: now + WINDOW_MS });
  } else {
    record.count++;
  }
  saveRateLimit(map);
}

export function getRateLimitRemainingMs(identifier: string): number {
  const map = getRateLimitStorage();
  const record = map.get(identifier);
  if (!record) return 0;
  return Math.max(0, record.resetTime - Date.now());
}

export function resetRateLimit(identifier: string): void {
  const map = getRateLimitStorage();
  map.delete(identifier);
  saveRateLimit(map);
}

// ============================================
// Audit Trail
// ============================================
export interface AuditEntry {
  timestamp: number;
  action: 'LOGIN' | 'LOGOUT' | 'CREATE_TICKET' | 'PAY_TICKET' | 'CANCEL_TICKET' | 'SETTINGS_CHANGE' | 'FAILED_LOGIN';
  userId: string;
  details: string;
}

const AUDIT_KEY = 'fsb_audit_log';
const MAX_AUDIT_ENTRIES = 500;

export function logAudit(entry: Omit<AuditEntry, 'timestamp'>): void {
  const logs: AuditEntry[] = JSON.parse(localStorage.getItem(AUDIT_KEY) || '[]');
  logs.push({ ...entry, timestamp: Date.now() });
  if (logs.length > MAX_AUDIT_ENTRIES) logs.splice(0, logs.length - MAX_AUDIT_ENTRIES);
  localStorage.setItem(AUDIT_KEY, JSON.stringify(logs));
}

export function getAuditLog(): AuditEntry[] {
  return JSON.parse(localStorage.getItem(AUDIT_KEY) || '[]');
}

export function clearAuditLog(): void {
  localStorage.removeItem(AUDIT_KEY);
}

// ============================================
// Session Management
// ============================================
const SESSION_KEY = 'fsb_session';
const SESSION_DURATION = 8 * 60 * 60 * 1000; // 8 hours

export interface Session {
  token: string;
  username: string;
  expiresAt: number;
}

export function createSession(username: string): Session {
  const session: Session = {
    token: generateToken(),
    username,
    expiresAt: Date.now() + SESSION_DURATION,
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export function getSession(): Session | null {
  try {
    const stored = localStorage.getItem(SESSION_KEY);
    if (!stored) return null;
    const session: Session = JSON.parse(stored);
    if (Date.now() > session.expiresAt) {
      destroySession();
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function isSessionValid(): boolean {
  return getSession() !== null;
}

export function destroySession(): void {
  localStorage.removeItem(SESSION_KEY);
}

function generateToken(): string {
  const arr = new Uint8Array(24);
  crypto.getRandomValues(arr);
  return Array.from(arr, b => b.toString(16).padStart(2, '0')).join('');
}

// ============================================
// Schema Versioning (for Supabase migration)
// ============================================
const SCHEMA_VERSION_KEY = 'fsb_schema_version';
const CURRENT_SCHEMA = '2.0';

export function checkSchemaVersion(): boolean {
  const stored = localStorage.getItem(SCHEMA_VERSION_KEY);
  return stored === CURRENT_SCHEMA;
}

export function setSchemaVersion(): void {
  localStorage.setItem(SCHEMA_VERSION_KEY, CURRENT_SCHEMA);
}
