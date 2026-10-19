// src/services/localStorageService.js
// LocalStorage persistence layer. All data is namespaced under 'fl_' prefix.

const KEYS = {
  TRANSACTIONS: 'fl_transactions',
  DELIVERIES: 'fl_deliveries',
  INVENTORY: 'fl_inventory',
  RECONCILIATION: 'fl_reconciliation',
  EXPENSES: 'fl_expenses',
  EMPLOYEES: 'fl_employees',
  EV_SESSIONS: 'fl_ev_sessions',
  SETTINGS: 'fl_settings',
  SEEDED: 'fl_seeded_v2',
};

function safeGet(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function safeSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    console.warn(`LocalStorage write failed for key: ${key}`);
    return false;
  }
}

// ─── Transactions ─────────────────────────────────────────────────────────────
export const txnService = {
  getAll: () => safeGet(KEYS.TRANSACTIONS, []),
  save: (txns) => safeSet(KEYS.TRANSACTIONS, txns),
  add: (txn) => {
    const existing = safeGet(KEYS.TRANSACTIONS, []);
    const updated = [txn, ...existing];
    safeSet(KEYS.TRANSACTIONS, updated);
    return updated;
  },
  update: (id, patch) => {
    const existing = safeGet(KEYS.TRANSACTIONS, []);
    const updated = existing.map(t => t.id === id ? { ...t, ...patch } : t);
    safeSet(KEYS.TRANSACTIONS, updated);
    return updated;
  },
  delete: (id) => {
    const existing = safeGet(KEYS.TRANSACTIONS, []);
    const updated = existing.filter(t => t.id !== id);
    safeSet(KEYS.TRANSACTIONS, updated);
    return updated;
  },
};

// ─── Deliveries ───────────────────────────────────────────────────────────────
export const deliveryService = {
  getAll: () => safeGet(KEYS.DELIVERIES, []),
  add: (delivery) => {
    const existing = safeGet(KEYS.DELIVERIES, []);
    const updated = [delivery, ...existing];
    safeSet(KEYS.DELIVERIES, updated);
    return updated;
  },
};

// ─── Inventory ────────────────────────────────────────────────────────────────
export const inventoryService = {
  getAll: () => safeGet(KEYS.INVENTORY, null),
  save: (inv) => safeSet(KEYS.INVENTORY, inv),
};

// ─── Reconciliation ───────────────────────────────────────────────────────────
export const reconciliationService = {
  getAll: () => safeGet(KEYS.RECONCILIATION, []),
  add: (rec) => {
    const existing = safeGet(KEYS.RECONCILIATION, []);
    const updated = [rec, ...existing];
    safeSet(KEYS.RECONCILIATION, updated);
    return updated;
  },
  update: (id, patch) => {
    const existing = safeGet(KEYS.RECONCILIATION, []);
    const updated = existing.map(r => r.id === id ? { ...r, ...patch } : r);
    safeSet(KEYS.RECONCILIATION, updated);
    return updated;
  },
};

// ─── Expenses ─────────────────────────────────────────────────────────────────
export const expenseService = {
  getAll: () => safeGet(KEYS.EXPENSES, []),
  add: (exp) => {
    const existing = safeGet(KEYS.EXPENSES, []);
    const updated = [exp, ...existing];
    safeSet(KEYS.EXPENSES, updated);
    return updated;
  },
};

// ─── Employees ────────────────────────────────────────────────────────────────
export const employeeService = {
  getAll: () => safeGet(KEYS.EMPLOYEES, []),
  save: (emps) => safeSet(KEYS.EMPLOYEES, emps),
};

// ─── EV Sessions ──────────────────────────────────────────────────────────────
export const evService = {
  getAll: () => safeGet(KEYS.EV_SESSIONS, []),
  add: (session) => {
    const existing = safeGet(KEYS.EV_SESSIONS, []);
    const updated = [session, ...existing];
    safeSet(KEYS.EV_SESSIONS, updated);
    return updated;
  },
};

// ─── Seeding ──────────────────────────────────────────────────────────────────
export function isSeeded() {
  return localStorage.getItem(KEYS.SEEDED) === 'true';
}

export function markSeeded() {
  localStorage.setItem(KEYS.SEEDED, 'true');
}

export function resetAllData() {
  Object.values(KEYS).forEach(k => localStorage.removeItem(k));
}

export { KEYS };
