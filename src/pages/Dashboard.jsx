// src/pages/Dashboard.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getKPIs } from '../data/seedData';
import AppLayout from '../components/layout/AppLayout';
import KPICard from '../components/shared/KPICard';
import RevenueTrendChart from '../components/charts/RevenueTrendChart';
import DonutByFuelChart from '../components/charts/DonutByFuelChart';
import PaymentBreakdownChart from '../components/charts/PaymentBreakdownChart';
import InventoryBarsChart from '../components/charts/InventoryBarsChart';
import Modal from '../components/ui/Modal';
import TransactionForm from '../components/forms/TransactionForm';
import DeliveryForm from '../components/forms/DeliveryForm';
import Card, { CardHeader } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import StatusPill from '../components/ui/StatusPill';
import { PrimaryButton, SecondaryButton, GhostButton } from '../components/ui/Buttons';
import { fmtCurrency, fmtDateTime, fmtDate, FUEL_LABELS, FUEL_COLORS } from '../utils/formatters';
import {
  IndianRupee, Droplets, CreditCard, TrendingUp, AlertTriangle,
  Plus, Truck, Receipt, Users, FileText, ShoppingCart, ChevronRight,
  Bell, Fuel, Package, ArrowUpRight, X, CheckCircle2, Info,
} from 'lucide-react';

// ─── Quick Actions ─────────────────────────────────────────────────────────────
const QUICK_ACTIONS = [
  { id: 'sale', label: 'Record Fuel Sale', icon: Fuel, color: 'bg-emerald-500', desc: 'Log a new fuel transaction' },
  { id: 'delivery', label: 'Add Stock Delivery', icon: Truck, color: 'bg-blue-500', desc: 'Record fuel tank refill' },
  { id: 'expense', label: 'Record Expense', icon: Receipt, color: 'bg-violet-500', desc: 'Petty cash or bill' },
  { id: 'employee', label: 'Staff Attendance', icon: Users, color: 'bg-amber-500', desc: 'Mark attendance' },
  { id: 'reconcile', label: 'View Reconciliation', icon: CreditCard, color: 'bg-slate-700', desc: 'Daily shift balance' },
  { id: 'report', label: 'Generate Report', icon: FileText, color: 'bg-pink-500', desc: 'Daily/weekly PDF' },
];

// ─── Alerts Panel ──────────────────────────────────────────────────────────────
function AlertsPanel() {
  const { alerts, dismissAlert } = useApp();
  const navigate = useNavigate();
  const active = alerts.filter(a => !a.resolved);

  const severityIcon = (sev) => ({
    critical: <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />,
    info: <Info className="w-4 h-4 text-blue-500 flex-shrink-0" />,
    success: <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />,
  })[sev];

  const alertStyle = {
    critical: 'alert-critical',
    warning: 'alert-warning',
    info: 'alert-info',
    success: 'alert-success',
  };

  return (
    <Card padding={false} className="overflow-hidden">
      <div className="px-5 pt-5 pb-3">
        <CardHeader
          title="Alerts & Notifications"
          subtitle={`${active.length} active`}
          icon={Bell}
          action={
            active.length > 0 && (
              <Badge variant="red">{active.length}</Badge>
            )
          }
        />
      </div>
      <div className="divide-y divide-slate-50">
        {active.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <p className="text-sm text-slate-500">All clear! No active alerts.</p>
          </div>
        ) : (
          active.map(alert => (
            <div key={alert.id} className={`px-5 py-3 ${alertStyle[alert.severity]}`}>
              <div className="flex items-start gap-3">
                {severityIcon(alert.severity)}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-800">{alert.title}</p>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{alert.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => navigate(alert.actionRoute)}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      {alert.actionLabel} <ArrowUpRight className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => dismissAlert(alert.id)}
                      className="text-xs text-slate-400 hover:text-slate-600 ml-auto"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}

// ─── Recent Transactions Table ─────────────────────────────────────────────────
function RecentTransactions({ onAddTxn }) {
  const { transactions } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const recent = transactions
    .filter(t =>
      !search ||
      t.fuelType.includes(search.toLowerCase()) ||
      t.vehicleNumber?.toLowerCase().includes(search.toLowerCase()) ||
      t.customerName?.toLowerCase().includes(search.toLowerCase()) ||
      t.id.toLowerCase().includes(search.toLowerCase())
    )
    .slice(0, 10);

  return (
    <Card padding={false} className="overflow-hidden">
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <CardHeader title="Recent Transactions" subtitle={`Last ${recent.length} records`} icon={ShoppingCart} />
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search..."
              className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:border-emerald-400 w-36"
            />
            <PrimaryButton size="sm" icon={Plus} onClick={onAddTxn}>Add</PrimaryButton>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs" role="table" aria-label="Recent fuel transactions">
          <thead>
            <tr className="bg-slate-50 border-y border-slate-100">
              <th className="px-5 py-2.5 text-left font-semibold text-slate-500">TXN ID</th>
              <th className="px-3 py-2.5 text-left font-semibold text-slate-500">Date/Time</th>
              <th className="px-3 py-2.5 text-left font-semibold text-slate-500">Fuel</th>
              <th className="px-3 py-2.5 text-right font-semibold text-slate-500">Qty</th>
              <th className="px-3 py-2.5 text-right font-semibold text-slate-500">Amount</th>
              <th className="px-3 py-2.5 text-left font-semibold text-slate-500">Payment</th>
              <th className="px-3 py-2.5 text-left font-semibold text-slate-500">Vehicle</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((t, i) => (
              <tr key={t.id} className={`border-b border-slate-50 hover:bg-slate-50 transition-colors ${i % 2 === 0 ? '' : 'bg-slate-50/40'}`}>
                <td className="px-5 py-2.5">
                  <span className="font-mono text-slate-600">{t.id}</span>
                </td>
                <td className="px-3 py-2.5 text-slate-500">{fmtDateTime(t.timestamp)}</td>
                <td className="px-3 py-2.5">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: FUEL_COLORS[t.fuelType] }} />
                    <span className="text-slate-700">{FUEL_LABELS[t.fuelType]}</span>
                  </span>
                </td>
                <td className="px-3 py-2.5 text-right font-tabular text-slate-700">
                  {t.quantity.toFixed(1)} {t.unit}
                </td>
                <td className="px-3 py-2.5 text-right font-tabular font-semibold text-slate-800">
                  {fmtCurrency(t.totalAmount)}
                </td>
                <td className="px-3 py-2.5">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold
                    ${t.paymentMethod === 'Cash' ? 'bg-emerald-100 text-emerald-700' :
                      t.paymentMethod === 'UPI' ? 'bg-blue-100 text-blue-700' :
                      t.paymentMethod === 'Card' ? 'bg-violet-100 text-violet-700' :
                      'bg-amber-100 text-amber-700'}`}>
                    {t.paymentMethod}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-slate-500 font-mono">{t.vehicleNumber || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-5 py-3 bg-slate-50 rounded-b-xl flex items-center justify-between">
        <p className="text-xs text-slate-400">Showing {recent.length} of {transactions.length} transactions</p>
        <GhostButton onClick={() => navigate('/sales')} icon={ChevronRight}>
          View All Transactions
        </GhostButton>
      </div>
    </Card>
  );
}

// ─── Main Dashboard Page ───────────────────────────────────────────────────────
export default function Dashboard() {
  const { station, dateRange } = useApp();
  const navigate = useNavigate();
  const [modal, setModal] = useState(null); // 'sale' | 'delivery' | 'expense'

  const kpis = getKPIs(dateRange.label === 'Last 30 Days' ? 30 : dateRange.label === 'Today' ? 1 : 7);

  const KPI_CONFIG = [
    {
      title: 'Total Revenue',
      key: 'totalRevenue',
      icon: IndianRupee,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      format: v => fmtCurrency(v, true),
    },
    {
      title: 'Total Transactions',
      key: 'totalTransactions',
      icon: ShoppingCart,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      format: v => v.toLocaleString('en-IN'),
    },
    {
      title: 'Total Volume',
      key: 'totalVolume',
      icon: Droplets,
      iconBg: 'bg-slate-100',
      iconColor: 'text-slate-600',
      format: v => `${(v / 1000).toFixed(1)}K L`,
    },
    {
      title: 'Petrol Volume',
      key: 'petrolVolume',
      icon: Fuel,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      format: v => `${v.toLocaleString('en-IN')} L`,
    },
    {
      title: 'Diesel Volume',
      key: 'dieselVolume',
      icon: Package,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      format: v => `${v.toLocaleString('en-IN')} L`,
    },
    {
      title: 'Gross Margin (Est.)',
      key: 'grossMarginEstimate',
      icon: TrendingUp,
      iconBg: 'bg-violet-50',
      iconColor: 'text-violet-600',
      format: v => fmtCurrency(v, true),
      isEstimate: true,
    },
  ];

  return (
    <AppLayout
      title={station.name}
      subtitle={`${station.address} · ${station.id}`}
    >
      <div className="space-y-6 animate-fade-in">
        {/* Station Hero */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-5 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400 rounded-full -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-blue-400 rounded-full translate-y-1/2" />
          </div>
          <div className="relative flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                  <Fuel className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">{station.name}</h2>
                  <p className="text-slate-300 text-xs">{station.city}, {station.state} · {station.id}</p>
                </div>
              </div>
              <p className="text-slate-400 text-xs">{station.address}</p>
            </div>
            <div className="flex flex-col gap-1.5 text-right">
              <div className="flex items-center gap-2 justify-end">
                <span className="status-dot demo" />
                <span className="text-amber-400 text-xs font-semibold">DEMO DATA MODE</span>
              </div>
              <p className="text-slate-400 text-xs">GSTIN: {station.gstin}</p>
              <p className="text-slate-400 text-xs">Reporting: {dateRange.label}</p>
            </div>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {KPI_CONFIG.map(cfg => {
            const data = kpis[cfg.key];
            return (
              <KPICard
                key={cfg.key}
                title={cfg.title}
                value={cfg.format(data.value)}
                change={data.change}
                isEstimate={cfg.isEstimate}
                icon={cfg.icon}
                iconBg={cfg.iconBg}
                iconColor={cfg.iconColor}
              />
            );
          })}
        </div>

        {/* Charts row 1 */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2">
            <RevenueTrendChart />
          </div>
          <DonutByFuelChart />
        </div>

        {/* Charts row 2 + Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <PaymentBreakdownChart />
          <div className="lg:col-span-2">
            <InventoryBarsChart />
          </div>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader title="Quick Actions" subtitle="Common operations" icon={Plus} />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {QUICK_ACTIONS.map(action => (
              <button
                key={action.id}
                onClick={() => {
                  if (action.id === 'sale') setModal('sale');
                  else if (action.id === 'delivery') setModal('delivery');
                  else if (action.id === 'expense') setModal('expense');
                  else if (action.id === 'reconcile') navigate('/payments');
                  else if (action.id === 'report') navigate('/reports');
                  else if (action.id === 'employee') navigate('/employees');
                }}
                className="flex flex-col items-center gap-2 p-4 bg-slate-50 hover:bg-white border border-slate-100 hover:border-slate-200 rounded-xl transition-all hover:shadow-sm group"
              >
                <div className={`p-2.5 rounded-xl ${action.color}`}>
                  <action.icon className="w-5 h-5 text-white" />
                </div>
                <div className="text-center">
                  <p className="text-xs font-semibold text-slate-700 leading-tight">{action.label}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5 hidden sm:block">{action.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Alerts + Recent Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2">
            <AlertsPanel />
          </div>
          <div className="lg:col-span-3">
            <RecentTransactions onAddTxn={() => setModal('sale')} />
          </div>
        </div>
      </div>

      {/* Modals */}
      <Modal isOpen={modal === 'sale'} onClose={() => setModal(null)} title="Record Fuel Sale" size="lg">
        <TransactionForm
          onSuccess={() => setModal(null)}
          onCancel={() => setModal(null)}
        />
      </Modal>

      <Modal isOpen={modal === 'delivery'} onClose={() => setModal(null)} title="Add Stock Delivery" size="lg">
        <DeliveryForm
          onSuccess={() => setModal(null)}
          onCancel={() => setModal(null)}
        />
      </Modal>

      <Modal isOpen={modal === 'expense'} onClose={() => setModal(null)} title="Record Expense" size="md">
        <ExpenseForm onSuccess={() => setModal(null)} onCancel={() => setModal(null)} />
      </Modal>
    </AppLayout>
  );
}

// ─── Expense Form (inline) ─────────────────────────────────────────────────────
function ExpenseForm({ onSuccess, onCancel }) {
  const { addExpense } = useApp();
  const [form, setForm] = useState({
    date: '2026-10-18', category: 'Utilities', description: '', amount: '', paymentMethod: 'Cash',
  });
  const [saved, setSaved] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.description || !form.amount) return;
    const exp = { id: `EXP-${Date.now()}`, ...form, amount: parseFloat(form.amount), demo: true };
    setTimeout(() => { addExpense(exp); setSaved(true); setTimeout(onSuccess, 800); }, 500);
  }

  const fc = 'w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-emerald-400 transition-colors';
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-xs font-medium text-slate-600 mb-1">Date</label>
          <input type="date" value={form.date} onChange={e => set('date', e.target.value)} className={fc} /></div>
        <div><label className="block text-xs font-medium text-slate-600 mb-1">Category</label>
          <select value={form.category} onChange={e => set('category', e.target.value)} className={fc}>
            {['Utilities', 'Maintenance', 'Salaries', 'Consumables', 'License', 'Other'].map(c => <option key={c}>{c}</option>)}
          </select></div>
      </div>
      <div><label className="block text-xs font-medium text-slate-600 mb-1">Description <span className="text-red-400">*</span></label>
        <input type="text" value={form.description} onChange={e => set('description', e.target.value)} placeholder="e.g., Electricity Bill" className={fc} required /></div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-xs font-medium text-slate-600 mb-1">Amount (₹) <span className="text-red-400">*</span></label>
          <input type="number" value={form.amount} onChange={e => set('amount', e.target.value)} placeholder="0.00" min="0" className={fc} required /></div>
        <div><label className="block text-xs font-medium text-slate-600 mb-1">Payment Method</label>
          <select value={form.paymentMethod} onChange={e => set('paymentMethod', e.target.value)} className={fc}>
            {['Cash', 'Bank Transfer', 'Online'].map(m => <option key={m}>{m}</option>)}
          </select></div>
      </div>
      <div className="flex justify-end gap-3">
        <SecondaryButton onClick={onCancel} type="button">Cancel</SecondaryButton>
        <PrimaryButton type="submit" disabled={saved}>
          {saved ? <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Saved!</span> : 'Record Expense'}
        </PrimaryButton>
      </div>
    </form>
  );
}
