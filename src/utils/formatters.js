// src/utils/formatters.js
// Indian locale formatters using Intl.NumberFormat with 'en-IN'

import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);

// ─── Currency ─────────────────────────────────────────────────────────────────
export const fmtCurrency = (value, compact = false) => {
  if (value === null || value === undefined) return '—';
  if (compact) {
    if (Math.abs(value) >= 1e7) return `₹${(value / 1e7).toFixed(2)} Cr`;
    if (Math.abs(value) >= 1e5) return `₹${(value / 1e5).toFixed(2)} L`;
    if (Math.abs(value) >= 1e3) return `₹${(value / 1e3).toFixed(1)}K`;
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export const fmtNumber = (value, decimals = 0) => {
  if (value === null || value === undefined) return '—';
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

export const fmtVolume = (value, unit = 'L') => {
  if (value === null || value === undefined) return '—';
  return `${fmtNumber(value, 1)} ${unit}`;
};

export const fmtPercent = (value, sign = true) => {
  if (value === null || value === undefined) return '—';
  const prefix = sign && value > 0 ? '+' : '';
  return `${prefix}${value.toFixed(1)}%`;
};

// ─── Dates ────────────────────────────────────────────────────────────────────
export const fmtDate = (dateStr) => {
  if (!dateStr) return '—';
  return dayjs(dateStr).format('DD MMM YYYY');
};

export const fmtDateTime = (dateStr) => {
  if (!dateStr) return '—';
  return dayjs(dateStr).format('DD MMM YYYY, hh:mm A');
};

export const fmtTime = (dateStr) => {
  if (!dateStr) return '—';
  return dayjs(dateStr).format('hh:mm A');
};

export const fmtDateShort = (dateStr) => {
  if (!dateStr) return '—';
  return dayjs(dateStr).format('DD MMM');
};

// ─── Fuel type display ────────────────────────────────────────────────────────
export const FUEL_LABELS = {
  petrol: 'Petrol',
  diesel: 'Diesel',
  cng: 'CNG',
};

export const FUEL_COLORS = {
  petrol: '#10b981',   // emerald
  diesel: '#3b82f6',   // blue
  cng: '#f59e0b',      // amber
  ev: '#8b5cf6',       // violet
};

export const FUEL_UNITS = {
  petrol: 'L',
  diesel: 'L',
  cng: 'kg',
};

export const PAYMENT_COLORS = {
  Cash: '#10b981',
  UPI: '#3b82f6',
  Card: '#8b5cf6',
  'Fleet Card': '#f59e0b',
};

// ─── Status badge colors ──────────────────────────────────────────────────────
export const STATUS_STYLES = {
  Balanced: { bg: 'bg-emerald-100', text: 'text-emerald-800', dot: 'bg-emerald-500' },
  Mismatch: { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500' },
  Pending: { bg: 'bg-amber-100', text: 'text-amber-800', dot: 'bg-amber-500' },
  Completed: { bg: 'bg-emerald-100', text: 'text-emerald-800', dot: 'bg-emerald-500' },
  Active: { bg: 'bg-blue-100', text: 'text-blue-800', dot: 'bg-blue-500' },
  Inactive: { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' },
  Critical: { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500' },
  Warning: { bg: 'bg-amber-100', text: 'text-amber-800', dot: 'bg-amber-500' },
  Info: { bg: 'bg-blue-100', text: 'text-blue-800', dot: 'bg-blue-500' },
};

// ─── Indian number compact ─────────────────────────────────────────────────────
export const compactINR = (value) => {
  if (value >= 1e7) return `₹${(value / 1e7).toFixed(2)} Cr`;
  if (value >= 1e5) return `₹${(value / 1e5).toFixed(2)} L`;
  if (value >= 1e3) return `₹${(value / 1e3).toFixed(1)}K`;
  return `₹${value.toFixed(0)}`;
};

// ─── Date range helpers ───────────────────────────────────────────────────────
export function getDateRange(preset) {
  const today = dayjs('2026-10-18'); // demo: fixed today
  switch (preset) {
    case 'today':
      return { start: today.format('YYYY-MM-DD'), end: today.format('YYYY-MM-DD'), label: 'Today' };
    case '7d':
      return { start: today.subtract(6, 'day').format('YYYY-MM-DD'), end: today.format('YYYY-MM-DD'), label: 'Last 7 Days' };
    case '30d':
      return { start: today.subtract(29, 'day').format('YYYY-MM-DD'), end: today.format('YYYY-MM-DD'), label: 'Last 30 Days' };
    default:
      return { start: today.subtract(6, 'day').format('YYYY-MM-DD'), end: today.format('YYYY-MM-DD'), label: 'Last 7 Days' };
  }
}

export const DEMO_TODAY = '2026-10-18';
