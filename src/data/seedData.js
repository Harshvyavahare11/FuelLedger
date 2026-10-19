// src/data/seedData.js
// All demo data is synthetic and deterministic.
// Flagged with demo: true. Do not use for real financial decisions.

import dayjs from 'dayjs';

// ─── Station Config ────────────────────────────────────────────────────────────
export const STATION = {
  id: 'FL-PN-001',
  name: 'Bharat Petroleum',
  brand: 'BPCL',
  address: 'Plot 14, NH-44 Service Road, Nagpur, Maharashtra 440001',
  city: 'Nagpur',
  state: 'Maharashtra',
  pincode: '440001',
  gstin: '27AABCU9603R1Z0',
  phone: '+91-712-2234567',
  email: 'flpn001@bpcl.co.in',
  ownerName: 'Rajesh Kumar Sharma',
  licenseNo: 'MH/BP/2019/0042',
  currency: 'INR',
  timezone: 'Asia/Kolkata',
  operatingHours: '05:00 - 23:00',
  fuels: ['petrol', 'diesel', 'cng'],
  demo: true,
};

// ─── Unit Prices (historical price ladder) ────────────────────────────────────
export const FUEL_PRICES = {
  petrol: [
    { from: '2026-09-01', price: 96.72 },
    { from: '2026-09-15', price: 97.00 },
    { from: '2026-10-01', price: 97.50 },
  ],
  diesel: [
    { from: '2026-09-01', price: 89.62 },
    { from: '2026-09-15', price: 89.90 },
    { from: '2026-10-01', price: 90.25 },
  ],
  cng: [
    { from: '2026-09-01', price: 79.00 },
    { from: '2026-09-15', price: 79.50 },
    { from: '2026-10-01', price: 80.00 },
  ],
};

export function getPriceOnDate(fuelType, dateStr) {
  const ladder = FUEL_PRICES[fuelType] || [];
  let price = ladder[0]?.price ?? 96.72;
  for (const entry of ladder) {
    if (dateStr >= entry.from) price = entry.price;
    else break;
  }
  return price;
}

// ─── Deterministic pseudo-random (seeded) ────────────────────────────────────
function seededRand(seed) {
  let s = seed;
  return function () {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

// ─── Seed: 30-day daily sales ─────────────────────────────────────────────────
function generateDailySales() {
  const records = [];
  const baseDate = dayjs('2026-09-19');

  for (let d = 0; d < 30; d++) {
    const date = baseDate.add(d, 'day').format('YYYY-MM-DD');
    const rand = seededRand(d * 31337);
    const r = rand;

    // Petrol: 800-1100 L/day; Diesel: 1500-2000 L/day; CNG: 400-600 kg/day
    const petrolQty = Math.round(850 + r() * 250);
    const dieselQty = Math.round(1550 + r() * 450);
    const cngQty = Math.round(420 + r() * 180);

    const petrolPrice = getPriceOnDate('petrol', date);
    const dieselPrice = getPriceOnDate('diesel', date);
    const cngPrice = getPriceOnDate('cng', date);

    const petrolRev = +(petrolQty * petrolPrice).toFixed(2);
    const dieselRev = +(dieselQty * dieselPrice).toFixed(2);
    const cngRev = +(cngQty * cngPrice).toFixed(2);

    // Payment split
    const totalRev = petrolRev + dieselRev + cngRev;
    const cashPct = 0.35 + r() * 0.1;
    const upiPct = 0.40 + r() * 0.1;
    const cardPct = 1 - cashPct - upiPct;

    records.push({
      id: `DS-${date}`,
      date,
      petrolQty,
      dieselQty,
      cngQty,
      petrolPrice,
      dieselPrice,
      cngPrice,
      petrolRevenue: petrolRev,
      dieselRevenue: dieselRev,
      cngRevenue: cngRev,
      totalRevenue: +totalRev.toFixed(2),
      cashRevenue: +(totalRev * cashPct).toFixed(2),
      upiRevenue: +(totalRev * upiPct).toFixed(2),
      cardRevenue: +(totalRev * cardPct).toFixed(2),
      totalTransactions: Math.round(180 + r() * 80),
      demo: true,
    });
  }
  return records;
}

export const DAILY_SALES = generateDailySales();

// ─── Seed: Individual Fuel Transactions (last 10 days, ~8-12 per day) ─────────
const VEHICLE_TYPES = ['Two-Wheeler', 'Three-Wheeler', 'Car', 'SUV', 'Truck', 'Bus', 'Auto'];
const PAYMENT_METHODS = ['Cash', 'UPI', 'Card', 'Fleet Card'];
const CUSTOMER_NAMES = ['Walk-in', 'Ravi Kumar', 'Priya Singh', 'Mohammed Ali', 'Sunita Devi', 'Arjun Rao', 'Kavya Nair', 'Deepak Mehta', 'Ananya Joshi', 'Fleet-0042'];

function generateTransactions() {
  const txns = [];
  const baseDate = dayjs('2026-10-09');
  let txnCounter = 1000;

  for (let d = 0; d < 10; d++) {
    const date = baseDate.add(d, 'day');
    const dateStr = date.format('YYYY-MM-DD');
    const rand = seededRand(d * 99991 + 7777);
    const r = rand;
    const count = 8 + Math.round(r() * 4);

    for (let t = 0; t < count; t++) {
      txnCounter++;
      const fuelIdx = Math.floor(r() * 3);
      const fuel = ['petrol', 'diesel', 'cng'][fuelIdx];
      const unitPrice = getPriceOnDate(fuel, dateStr);
      const qty = fuel === 'cng'
        ? +(2 + r() * 18).toFixed(2)
        : +(5 + r() * 45).toFixed(2);
      const total = +(qty * unitPrice).toFixed(2);
      const hour = 6 + Math.floor(r() * 16);
      const minute = Math.floor(r() * 60);
      const timestamp = date.hour(hour).minute(minute).second(0).format('YYYY-MM-DDTHH:mm:ss');
      const payMethod = PAYMENT_METHODS[Math.floor(r() * PAYMENT_METHODS.length)];
      const custIdx = Math.floor(r() * CUSTOMER_NAMES.length);
      const vehIdx = Math.floor(r() * VEHICLE_TYPES.length);

      txns.push({
        id: `TXN-${txnCounter}`,
        date: dateStr,
        timestamp,
        fuelType: fuel,
        quantity: qty,
        unit: fuel === 'cng' ? 'kg' : 'L',
        unitPrice,
        totalAmount: total,
        paymentMethod: payMethod,
        customerName: CUSTOMER_NAMES[custIdx],
        vehicleType: VEHICLE_TYPES[vehIdx],
        vehicleNumber: `MH40${String.fromCharCode(65 + Math.floor(r() * 26))}${1000 + Math.floor(r() * 8999)}`,
        shiftId: `SH-${dateStr}-${hour < 14 ? 'A' : hour < 20 ? 'B' : 'C'}`,
        attendantId: `EMP-00${1 + Math.floor(r() * 5)}`,
        nozzleId: `NZ-${1 + Math.floor(r() * 6)}`,
        receiptNo: `RCP-${txnCounter}`,
        notes: '',
        demo: true,
      });
    }
  }
  return txns.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

export const TRANSACTIONS = generateTransactions();

// ─── Seed: Fuel Deliveries ────────────────────────────────────────────────────
export const DELIVERIES = [
  {
    id: 'DEL-001',
    date: '2026-09-22',
    fuelType: 'petrol',
    quantityOrdered: 10000,
    quantityReceived: 9980,
    unit: 'L',
    supplierName: 'BPCL Depot Nagpur',
    invoiceNumber: 'INV-BP-2026-00341',
    unitCost: 74.50,
    totalCost: 743510.00,
    tankId: 'TANK-P1',
    driverName: 'Mahesh Yadav',
    truckNumber: 'MH31BT4521',
    receivedBy: 'EMP-001',
    notes: 'Minor shortage of 20L noted. Supplier notified.',
    demo: true,
  },
  {
    id: 'DEL-002',
    date: '2026-09-25',
    fuelType: 'diesel',
    quantityOrdered: 15000,
    quantityReceived: 15000,
    unit: 'L',
    supplierName: 'BPCL Depot Nagpur',
    invoiceNumber: 'INV-BP-2026-00362',
    unitCost: 68.20,
    totalCost: 1023000.00,
    tankId: 'TANK-D1',
    driverName: 'Suresh Patil',
    truckNumber: 'MH31BT4889',
    receivedBy: 'EMP-002',
    notes: '',
    demo: true,
  },
  {
    id: 'DEL-003',
    date: '2026-10-02',
    fuelType: 'petrol',
    quantityOrdered: 10000,
    quantityReceived: 10000,
    unit: 'L',
    supplierName: 'BPCL Depot Nagpur',
    invoiceNumber: 'INV-BP-2026-00389',
    unitCost: 74.50,
    totalCost: 745000.00,
    tankId: 'TANK-P1',
    driverName: 'Anil Shinde',
    truckNumber: 'MH31BT5012',
    receivedBy: 'EMP-001',
    notes: '',
    demo: true,
  },
  {
    id: 'DEL-004',
    date: '2026-10-05',
    fuelType: 'diesel',
    quantityOrdered: 20000,
    quantityReceived: 20000,
    unit: 'L',
    supplierName: 'BPCL Depot Nagpur',
    invoiceNumber: 'INV-BP-2026-00411',
    unitCost: 68.40,
    totalCost: 1368000.00,
    tankId: 'TANK-D1',
    driverName: 'Prakash More',
    truckNumber: 'MH31BT5100',
    receivedBy: 'EMP-003',
    notes: '',
    demo: true,
  },
  {
    id: 'DEL-005',
    date: '2026-10-12',
    fuelType: 'cng',
    quantityOrdered: 2000,
    quantityReceived: 2000,
    unit: 'kg',
    supplierName: 'MGL CNG Supply',
    invoiceNumber: 'INV-MGL-2026-00055',
    unitCost: 55.00,
    totalCost: 110000.00,
    tankId: 'TANK-C1',
    driverName: 'N/A (Pipeline)',
    truckNumber: 'N/A',
    receivedBy: 'EMP-002',
    notes: 'Pipeline delivery',
    demo: true,
  },
];

// ─── Seed: Inventory Status ───────────────────────────────────────────────────
export const INVENTORY = {
  petrol: {
    tankId: 'TANK-P1',
    capacity: 25000,
    reorderThreshold: 5000,
    currentStock: 7240,
    unit: 'L',
    lastUpdated: '2026-10-18T23:00:00',
    demo: true,
  },
  diesel: {
    tankId: 'TANK-D1',
    capacity: 40000,
    reorderThreshold: 8000,
    currentStock: 12850,
    unit: 'L',
    lastUpdated: '2026-10-18T23:00:00',
    demo: true,
  },
  cng: {
    tankId: 'TANK-C1',
    capacity: 5000,
    reorderThreshold: 1000,
    currentStock: 1380,
    unit: 'kg',
    lastUpdated: '2026-10-18T23:00:00',
    demo: true,
  },
};

// ─── Seed: Reconciliation Records (includes intentional mismatch) ─────────────
// INTENTIONAL MISMATCH: Oct 14 UPI amount collected differs from bank statement by ₹1,250
// This is a simulated real-world scenario for demo purposes.
export const RECONCILIATION = [
  {
    id: 'REC-20261009',
    date: '2026-10-09',
    shift: 'All',
    openingCash: 15000,
    cashSales: 42310.50,
    upiSales: 51204.75,
    cardSales: 18930.25,
    totalSales: 112445.50,
    cashExpenses: 3200.00,
    cashHandedOver: 54110.50,
    systemTotal: 112445.50,
    actualTotal: 112445.50,
    variance: 0.00,
    status: 'Balanced',
    reconciledBy: 'EMP-001',
    notes: '',
    demo: true,
  },
  {
    id: 'REC-20261014',
    date: '2026-10-14',
    shift: 'All',
    openingCash: 15000,
    cashSales: 45820.00,
    upiSales: 55480.00,  // system shows 55480.00
    cardSales: 19200.00,
    totalSales: 120500.00,
    cashExpenses: 2800.00,
    cashHandedOver: 58020.00,
    systemTotal: 120500.00,
    actualTotal: 119250.00, // bank credited 54230.00 for UPI (difference ₹1250)
    variance: -1250.00,
    status: 'Mismatch',
    reconciledBy: 'EMP-002',
    notes: 'INTENTIONAL DEMO MISMATCH: UPI settlement from bank (₹54,230) differs from system UPI total (₹55,480) by ₹1,250. Possible pending UPI reversal or gateway hold. Flagged for investigation.',
    mismatchType: 'UPI Settlement Gap',
    mismatchAmount: 1250.00,
    demo: true,
    _metadata: {
      description: 'Simulated UPI reconciliation gap. In real scenario this would trigger investigation with payment gateway.',
      intentional: true,
    },
  },
  {
    id: 'REC-20261015',
    date: '2026-10-15',
    shift: 'All',
    openingCash: 15000,
    cashSales: 41200.00,
    upiSales: 49800.00,
    cardSales: 17500.00,
    totalSales: 108500.00,
    cashExpenses: 1500.00,
    cashHandedOver: 54700.00,
    systemTotal: 108500.00,
    actualTotal: 108500.00,
    variance: 0.00,
    status: 'Balanced',
    reconciledBy: 'EMP-001',
    notes: '',
    demo: true,
  },
  {
    id: 'REC-20261016',
    date: '2026-10-16',
    shift: 'All',
    openingCash: 15000,
    cashSales: 43500.00,
    upiSales: 52100.00,
    cardSales: 18800.00,
    totalSales: 114400.00,
    cashExpenses: 2100.00,
    cashHandedOver: 56400.00,
    systemTotal: 114400.00,
    actualTotal: 114400.00,
    variance: 0.00,
    status: 'Balanced',
    reconciledBy: 'EMP-003',
    notes: '',
    demo: true,
  },
  {
    id: 'REC-20261017',
    date: '2026-10-17',
    shift: 'All',
    openingCash: 15000,
    cashSales: 44100.00,
    upiSales: 53200.00,
    cardSales: 19100.00,
    totalSales: 116400.00,
    cashExpenses: 1800.00,
    cashHandedOver: 57300.00,
    systemTotal: 116400.00,
    actualTotal: 116400.00,
    variance: 0.00,
    status: 'Balanced',
    reconciledBy: 'EMP-001',
    notes: '',
    demo: true,
  },
];

// ─── Seed: Employees ──────────────────────────────────────────────────────────
export const EMPLOYEES = [
  { id: 'EMP-001', name: 'Ramesh Gupta', role: 'Manager', phone: '9876543210', shift: 'Morning', active: true, joinDate: '2021-03-15', demo: true },
  { id: 'EMP-002', name: 'Sunil Verma', role: 'Attendant', phone: '9812345678', shift: 'Afternoon', active: true, joinDate: '2022-07-01', demo: true },
  { id: 'EMP-003', name: 'Kavita Rane', role: 'Cashier', phone: '9898989898', shift: 'Morning', active: true, joinDate: '2023-01-10', demo: true },
  { id: 'EMP-004', name: 'Dinesh Patil', role: 'Attendant', phone: '9765432100', shift: 'Night', active: true, joinDate: '2023-06-20', demo: true },
  { id: 'EMP-005', name: 'Pooja Desai', role: 'Attendant', phone: '9654321089', shift: 'Afternoon', active: false, joinDate: '2024-02-14', demo: true },
];

// ─── Seed: EV Charging Sessions ───────────────────────────────────────────────
export const EV_SESSIONS = [
  {
    id: 'EV-001',
    date: '2026-10-15',
    startTime: '2026-10-15T09:15:00',
    endTime: '2026-10-15T10:42:00',
    durationMinutes: 87,
    chargerId: 'EVC-01',
    chargerType: 'DC Fast (50kW)',
    vehicleType: 'EV Car',
    vehicleNumber: 'MH40EV1234',
    energyDispensed: 42.5,
    unit: 'kWh',
    ratePerUnit: 18.50,
    totalAmount: 786.25,
    paymentMethod: 'UPI',
    customerName: 'Aditya Sharma',
    status: 'Completed',
    demo: true,
  },
  {
    id: 'EV-002',
    date: '2026-10-16',
    startTime: '2026-10-16T14:20:00',
    endTime: '2026-10-16T15:05:00',
    durationMinutes: 45,
    chargerId: 'EVC-02',
    chargerType: 'AC Slow (7.4kW)',
    vehicleType: 'EV Two-Wheeler',
    vehicleNumber: 'MH40EW5678',
    energyDispensed: 5.5,
    unit: 'kWh',
    ratePerUnit: 15.00,
    totalAmount: 82.50,
    paymentMethod: 'Cash',
    customerName: 'Walk-in',
    status: 'Completed',
    demo: true,
  },
  {
    id: 'EV-003',
    date: '2026-10-18',
    startTime: '2026-10-18T11:00:00',
    endTime: '2026-10-18T12:30:00',
    durationMinutes: 90,
    chargerId: 'EVC-01',
    chargerType: 'DC Fast (50kW)',
    vehicleType: 'EV Car',
    vehicleNumber: 'MH31EV9999',
    energyDispensed: 48.0,
    unit: 'kWh',
    ratePerUnit: 18.50,
    totalAmount: 888.00,
    paymentMethod: 'Card',
    customerName: 'Nirmala Joshi',
    status: 'Completed',
    demo: true,
  },
];

// ─── Seed: Expenses ───────────────────────────────────────────────────────────
export const EXPENSES = [
  { id: 'EXP-001', date: '2026-10-10', category: 'Utilities', description: 'Electricity Bill - October', amount: 12800, paymentMethod: 'Bank Transfer', demo: true },
  { id: 'EXP-002', date: '2026-10-11', category: 'Maintenance', description: 'Nozzle seal replacement NZ-3', amount: 2400, paymentMethod: 'Cash', demo: true },
  { id: 'EXP-003', date: '2026-10-13', category: 'Salaries', description: 'Staff salary advance - Ramesh', amount: 10000, paymentMethod: 'Bank Transfer', demo: true },
  { id: 'EXP-004', date: '2026-10-15', category: 'Consumables', description: 'Cleaning supplies', amount: 850, paymentMethod: 'Cash', demo: true },
  { id: 'EXP-005', date: '2026-10-17', category: 'License', description: 'Fire NOC renewal fee', amount: 5500, paymentMethod: 'Online', demo: true },
];

// ─── Alerts (system alerts) ───────────────────────────────────────────────────
export const SYSTEM_ALERTS = [
  {
    id: 'ALT-001',
    severity: 'critical',
    title: 'CNG Stock Below Reorder Level',
    description: 'CNG tank at 1,380 kg (27.6% of capacity). Reorder threshold is 1,000 kg. Estimated 2–3 days remaining at current usage.',
    timestamp: '2026-10-18T22:00:00',
    category: 'inventory',
    actionLabel: 'View Inventory',
    actionRoute: '/inventory',
    resolved: false,
    demo: true,
  },
  {
    id: 'ALT-002',
    severity: 'critical',
    title: 'UPI Reconciliation Mismatch — Oct 14',
    description: 'UPI settlement from bank (₹54,230) differs from system total (₹55,480) by ₹1,250. Requires investigation.',
    timestamp: '2026-10-15T08:30:00',
    category: 'reconciliation',
    actionLabel: 'View Reconciliation',
    actionRoute: '/payments',
    resolved: false,
    demo: true,
  },
  {
    id: 'ALT-003',
    severity: 'warning',
    title: 'Petrol Stock Approaching Reorder Level',
    description: 'Petrol tank at 7,240 L. Reorder threshold 5,000 L. Current daily usage ~950 L. ~2 days buffer.',
    timestamp: '2026-10-18T22:00:00',
    category: 'inventory',
    actionLabel: 'Order Stock',
    actionRoute: '/inventory',
    resolved: false,
    demo: true,
  },
  {
    id: 'ALT-004',
    severity: 'info',
    title: 'Daily Report Pending',
    description: 'Daily sales report for Oct 18 has not been generated yet.',
    timestamp: '2026-10-18T23:00:00',
    category: 'reports',
    actionLabel: 'Generate Report',
    actionRoute: '/reports',
    resolved: false,
    demo: true,
  },
];

// ─── Forecasting ──────────────────────────────────────────────────────────────
// Algorithm: 7-day weighted moving average for daily consumption
// Target stock = 7-day avg daily usage × safety_days (14)
// Recommended order = max(0, Target stock - Current stock + pipeline)
export function computeForecast(fuelType) {
  const inv = INVENTORY[fuelType];
  if (!inv) return null;

  const recentDays = DAILY_SALES.slice(-7);
  const qtyKey = `${fuelType}Qty`;
  const totalQty = recentDays.reduce((s, d) => s + (d[qtyKey] || 0), 0);
  const avgDaily = totalQty / 7;
  const safetyDays = 14;
  const targetStock = Math.round(avgDaily * safetyDays);
  const recommendedOrder = Math.max(0, targetStock - inv.currentStock);
  const daysRemaining = inv.currentStock > 0 ? Math.round(inv.currentStock / avgDaily) : 0;

  return {
    fuelType,
    avgDailyUsage: +avgDaily.toFixed(1),
    daysRemaining,
    targetStock,
    recommendedOrder,
    currentStock: inv.currentStock,
    reorderThreshold: inv.reorderThreshold,
    unit: inv.unit,
    demo: true,
  };
}

export const FORECASTS = {
  petrol: computeForecast('petrol'),
  diesel: computeForecast('diesel'),
  cng: computeForecast('cng'),
};

// ─── KPI computation helpers ──────────────────────────────────────────────────
export function getKPIs(periodDays = 7) {
  const today = dayjs('2026-10-18');
  const currentPeriod = DAILY_SALES.filter(d => {
    const diff = today.diff(dayjs(d.date), 'day');
    return diff >= 0 && diff < periodDays;
  });
  const prevPeriod = DAILY_SALES.filter(d => {
    const diff = today.diff(dayjs(d.date), 'day');
    return diff >= periodDays && diff < periodDays * 2;
  });

  const sum = (arr, key) => arr.reduce((s, d) => s + (d[key] || 0), 0);
  const pct = (curr, prev) => prev === 0 ? 0 : +((curr - prev) / prev * 100).toFixed(1);

  const currRev = sum(currentPeriod, 'totalRevenue');
  const prevRev = sum(prevPeriod, 'totalRevenue');
  const currTxn = sum(currentPeriod, 'totalTransactions');
  const prevTxn = sum(prevPeriod, 'totalTransactions');
  const currPetrol = sum(currentPeriod, 'petrolQty');
  const prevPetrol = sum(prevPeriod, 'petrolQty');
  const currDiesel = sum(currentPeriod, 'dieselQty');
  const prevDiesel = sum(prevPeriod, 'dieselQty');
  const currCNG = sum(currentPeriod, 'cngQty');
  const prevCNG = sum(prevPeriod, 'cngQty');
  const totalQty = currPetrol + currDiesel + currCNG;
  const prevQty = prevPetrol + prevDiesel + prevCNG;

  // Gross margin estimate: selling price - cost price (approx 3.5% margin for demo)
  const marginPct = 0.035;
  const currMargin = currRev * marginPct;
  const prevMargin = prevRev * marginPct;

  return {
    totalRevenue: { value: currRev, prev: prevRev, change: pct(currRev, prevRev) },
    totalTransactions: { value: currTxn, prev: prevTxn, change: pct(currTxn, prevTxn) },
    totalVolume: { value: totalQty, prev: prevQty, change: pct(totalQty, prevQty) },
    petrolVolume: { value: currPetrol, prev: prevPetrol, change: pct(currPetrol, prevPetrol) },
    dieselVolume: { value: currDiesel, prev: prevDiesel, change: pct(currDiesel, prevDiesel) },
    grossMarginEstimate: { value: currMargin, prev: prevMargin, change: pct(currMargin, prevMargin), isEstimate: true },
  };
}
