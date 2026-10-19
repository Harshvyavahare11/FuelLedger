// src/context/AppContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  txnService, deliveryService, inventoryService,
  reconciliationService, expenseService, employeeService,
  evService, isSeeded, markSeeded, resetAllData,
} from '../services/localStorageService';
import {
  TRANSACTIONS, DELIVERIES, INVENTORY, RECONCILIATION,
  EXPENSES, EMPLOYEES, EV_SESSIONS, SYSTEM_ALERTS, STATION,
} from '../data/seedData';
import { getDateRange, DEMO_TODAY } from '../utils/formatters';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [transactions, setTransactions] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [inventory, setInventory] = useState({});
  const [reconciliation, setReconciliation] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [evSessions, setEvSessions] = useState([]);
  const [alerts, setAlerts] = useState(SYSTEM_ALERTS);
  const [dateRange, setDateRange] = useState(getDateRange('7d'));
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  // Seed on first load
  useEffect(() => {
    if (!isSeeded()) {
      txnService.save(TRANSACTIONS);
      deliveryService.save && null; // use add pattern
      inventoryService.save(INVENTORY);
      reconciliationService.save && null;
      
      // Bulk seed
      localStorage.setItem('fl_transactions', JSON.stringify(TRANSACTIONS));
      localStorage.setItem('fl_deliveries', JSON.stringify(DELIVERIES));
      localStorage.setItem('fl_inventory', JSON.stringify(INVENTORY));
      localStorage.setItem('fl_reconciliation', JSON.stringify(RECONCILIATION));
      localStorage.setItem('fl_expenses', JSON.stringify(EXPENSES));
      localStorage.setItem('fl_employees', JSON.stringify(EMPLOYEES));
      localStorage.setItem('fl_ev_sessions', JSON.stringify(EV_SESSIONS));
      markSeeded();
    }

    setTransactions(txnService.getAll());
    setDeliveries(JSON.parse(localStorage.getItem('fl_deliveries') || '[]'));
    setInventory(inventoryService.getAll() || INVENTORY);
    setReconciliation(JSON.parse(localStorage.getItem('fl_reconciliation') || '[]'));
    setExpenses(JSON.parse(localStorage.getItem('fl_expenses') || '[]'));
    setEmployees(JSON.parse(localStorage.getItem('fl_employees') || '[]'));
    setEvSessions(JSON.parse(localStorage.getItem('fl_ev_sessions') || '[]'));
    setIsLoaded(true);
  }, []);

  // ─── Transaction actions ────────────────────────────────────────────────────
  const addTransaction = useCallback((txn) => {
    const updated = txnService.add(txn);
    setTransactions(updated);
  }, []);

  const updateTransaction = useCallback((id, patch) => {
    const updated = txnService.update(id, patch);
    setTransactions(updated);
  }, []);

  const deleteTransaction = useCallback((id) => {
    const updated = txnService.delete(id);
    setTransactions(updated);
  }, []);

  // ─── Delivery actions ───────────────────────────────────────────────────────
  const addDelivery = useCallback((delivery) => {
    const existing = JSON.parse(localStorage.getItem('fl_deliveries') || '[]');
    const updated = [delivery, ...existing];
    localStorage.setItem('fl_deliveries', JSON.stringify(updated));
    setDeliveries(updated);

    // Update inventory
    setInventory(prev => {
      const next = { ...prev };
      if (next[delivery.fuelType]) {
        next[delivery.fuelType] = {
          ...next[delivery.fuelType],
          currentStock: next[delivery.fuelType].currentStock + delivery.quantityReceived,
          lastUpdated: new Date().toISOString(),
        };
        inventoryService.save(next);
      }
      return next;
    });
  }, []);

  // ─── Expense actions ────────────────────────────────────────────────────────
  const addExpense = useCallback((exp) => {
    const existing = JSON.parse(localStorage.getItem('fl_expenses') || '[]');
    const updated = [exp, ...existing];
    localStorage.setItem('fl_expenses', JSON.stringify(updated));
    setExpenses(updated);
  }, []);

  // ─── Reconciliation actions ─────────────────────────────────────────────────
  const addReconciliation = useCallback((rec) => {
    const existing = JSON.parse(localStorage.getItem('fl_reconciliation') || '[]');
    const updated = [rec, ...existing];
    localStorage.setItem('fl_reconciliation', JSON.stringify(updated));
    setReconciliation(updated);
  }, []);

  // ─── Date range ─────────────────────────────────────────────────────────────
  const setPreset = useCallback((preset) => {
    setDateRange(getDateRange(preset));
  }, []);

  const setCustomRange = useCallback((start, end) => {
    setDateRange({ start, end, label: `${start} – ${end}` });
  }, []);

  // ─── Alert management ───────────────────────────────────────────────────────
  const dismissAlert = useCallback((id) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, resolved: true } : a));
  }, []);

  // ─── Reset demo ─────────────────────────────────────────────────────────────
  const resetDemo = useCallback(() => {
    resetAllData();
    window.location.reload();
  }, []);

  const value = {
    // Data
    transactions,
    deliveries,
    inventory,
    reconciliation,
    expenses,
    employees,
    evSessions,
    alerts,
    station: STATION,
    demoToday: DEMO_TODAY,
    isLoaded,

    // Actions
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addDelivery,
    addExpense,
    addReconciliation,
    dismissAlert,
    resetDemo,

    // Date range
    dateRange,
    setPreset,
    setCustomRange,

    // UI
    sidebarOpen,
    setSidebarOpen,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
