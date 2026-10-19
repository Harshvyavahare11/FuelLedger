// src/pages/Payments.jsx
import { useState } from 'react';
import AppLayout from '../components/layout/AppLayout';
import { useApp } from '../context/AppContext';
import Card, { CardHeader } from '../components/ui/Card';
import StatusPill from '../components/ui/StatusPill';
import Badge from '../components/ui/Badge';
import { PrimaryButton } from '../components/ui/Buttons';
import Modal from '../components/ui/Modal';
import { fmtCurrency, fmtDate } from '../utils/formatters';
import { CreditCard, AlertTriangle, CheckCircle2, Info, TrendingDown, Plus } from 'lucide-react';

function MismatchBanner({ rec }) {
  return (
    <div className="border-2 border-red-300 bg-red-50 rounded-2xl p-5">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-red-100 rounded-xl flex-shrink-0">
          <AlertTriangle className="w-5 h-5 text-red-600" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-bold text-red-800">UPI Reconciliation Mismatch Detected</h3>
            <Badge variant="red">DEMO EXAMPLE</Badge>
          </div>
          <p className="text-xs text-red-700 leading-relaxed">{rec.notes}</p>
          <div className="grid grid-cols-3 gap-3 mt-3">
            <div className="bg-white rounded-xl p-3 text-center">
              <p className="text-[10px] text-slate-500">System UPI Total</p>
              <p className="text-base font-bold text-slate-800">{fmtCurrency(rec.upiSales)}</p>
            </div>
            <div className="bg-white rounded-xl p-3 text-center border-2 border-red-200">
              <p className="text-[10px] text-red-500">Bank Credit</p>
              <p className="text-base font-bold text-red-700">{fmtCurrency(rec.actualTotal - rec.cashSales - rec.cardSales)}</p>
            </div>
            <div className="bg-red-100 rounded-xl p-3 text-center">
              <p className="text-[10px] text-red-600">Difference</p>
              <p className="text-base font-bold text-red-800">-{fmtCurrency(Math.abs(rec.variance))}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Payments() {
  const { reconciliation, dateRange } = useApp();
  const [addModal, setAddModal] = useState(false);

  const filtered = reconciliation.filter(r => r.date >= dateRange.start && r.date <= dateRange.end);
  const mismatch = reconciliation.find(r => r.status === 'Mismatch');
  const totalSales = filtered.reduce((s, r) => s + r.totalSales, 0);
  const totalVariance = filtered.reduce((s, r) => s + r.variance, 0);

  return (
    <AppLayout title="Payments & Reconciliation" subtitle="Daily shift balance and settlement tracking">
      <div className="space-y-5 animate-fade-in">
        {/* Intentional mismatch banner */}
        {mismatch && <MismatchBanner rec={mismatch} />}

        {/* Summary KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Sales', value: fmtCurrency(totalSales, true), color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Cash Collections', value: fmtCurrency(filtered.reduce((s, r) => s + r.cashSales, 0), true), color: 'text-slate-600', bg: 'bg-slate-100' },
            { label: 'UPI Collections', value: fmtCurrency(filtered.reduce((s, r) => s + r.upiSales, 0), true), color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Net Variance', value: fmtCurrency(Math.abs(totalVariance), true), color: totalVariance < 0 ? 'text-red-600' : 'text-emerald-600', bg: totalVariance < 0 ? 'bg-red-50' : 'bg-emerald-50' },
          ].map(kpi => (
            <Card key={kpi.label}>
              <p className="text-xs text-slate-500 mb-1">{kpi.label}</p>
              <p className={`text-xl font-bold ${kpi.color} font-tabular`}>{kpi.value}</p>
            </Card>
          ))}
        </div>

        {/* Reconciliation table */}
        <Card padding={false}>
          <div className="px-5 pt-5 pb-3 flex items-center justify-between border-b border-slate-100">
            <CardHeader title="Daily Reconciliation" subtitle={`${filtered.length} records`} icon={CreditCard} />
            <PrimaryButton size="sm" icon={Plus} onClick={() => setAddModal(true)}>New Record</PrimaryButton>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {['Date', 'Cash Sales', 'UPI Sales', 'Card Sales', 'Total Sales', 'Actual Collected', 'Variance', 'Status', 'Notes'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-semibold text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(filtered.length ? filtered : reconciliation).map(r => (
                  <tr key={r.id} className={`border-b border-slate-50 hover:bg-slate-50 ${r.status === 'Mismatch' ? 'bg-red-50/50' : ''}`}>
                    <td className="px-4 py-3 font-semibold text-slate-700">{fmtDate(r.date)}</td>
                    <td className="px-4 py-3 font-tabular">{fmtCurrency(r.cashSales)}</td>
                    <td className="px-4 py-3 font-tabular">{fmtCurrency(r.upiSales)}</td>
                    <td className="px-4 py-3 font-tabular">{fmtCurrency(r.cardSales)}</td>
                    <td className="px-4 py-3 font-tabular font-semibold">{fmtCurrency(r.totalSales)}</td>
                    <td className="px-4 py-3 font-tabular">{fmtCurrency(r.actualTotal)}</td>
                    <td className="px-4 py-3 font-tabular">
                      <span className={`font-bold ${r.variance < 0 ? 'text-red-600' : r.variance > 0 ? 'text-emerald-600' : 'text-slate-600'}`}>
                        {r.variance === 0 ? '₹0.00' : `${r.variance > 0 ? '+' : '-'}${fmtCurrency(Math.abs(r.variance))}`}
                      </span>
                    </td>
                    <td className="px-4 py-3"><StatusPill status={r.status} /></td>
                    <td className="px-4 py-3 text-slate-500 max-w-xs">
                      {r.notes ? (
                        <span className="flex items-start gap-1">
                          {r.status === 'Mismatch' && <AlertTriangle className="w-3 h-3 text-red-500 flex-shrink-0 mt-0.5" />}
                          <span className="truncate text-[10px]" title={r.notes}>{r.notes}</span>
                        </span>
                      ) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
