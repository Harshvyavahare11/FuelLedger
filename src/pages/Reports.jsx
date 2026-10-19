// src/pages/Reports.jsx
import { useState } from 'react';
import AppLayout from '../components/layout/AppLayout';
import { useApp } from '../context/AppContext';
import { DAILY_SALES } from '../data/seedData';
import Card, { CardHeader } from '../components/ui/Card';
import { PrimaryButton } from '../components/ui/Buttons';
import { fmtCurrency, fmtDate, fmtNumber, FUEL_LABELS, FUEL_COLORS } from '../utils/formatters';
import { BarChart3, Download, FileText, Calendar, TrendingUp, Droplets } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell
} from 'recharts';
import dayjs from 'dayjs';

export default function Reports() {
  const { dateRange } = useApp();
  const [reportType, setReportType] = useState('daily');

  const filtered = DAILY_SALES.filter(d => d.date >= dateRange.start && d.date <= dateRange.end);
  const today = filtered.find(d => d.date === '2026-10-18') || filtered[filtered.length - 1];

  const chartData = filtered.map(d => ({
    date: dayjs(d.date).format('DD/MM'),
    Petrol: Math.round(d.petrolRevenue / 1000),
    Diesel: Math.round(d.dieselRevenue / 1000),
    CNG: Math.round(d.cngRevenue / 1000),
  }));

  return (
    <AppLayout title="Reports" subtitle="Daily, weekly, and custom period reports">
      <div className="space-y-5 animate-fade-in">
        {/* Report type selector */}
        <div className="flex gap-2">
          {['daily', 'weekly', 'monthly'].map(type => (
            <button
              key={type}
              onClick={() => setReportType(type)}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition-colors capitalize
                ${reportType === type ? 'bg-slate-800 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              {type} Report
            </button>
          ))}
        </div>

        {/* Daily Summary Card */}
        {today && (
          <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-0">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-white font-bold text-base">Daily Summary — {fmtDate(today.date)}</h3>
                <p className="text-slate-400 text-xs">Bharat Petroleum · FL-PN-001 · Demo Data</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500 text-white text-xs font-semibold rounded-lg hover:bg-emerald-600 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> Export
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Revenue', value: fmtCurrency(today.totalRevenue, true), icon: '₹' },
                { label: 'Transactions', value: today.totalTransactions, icon: '#' },
                { label: 'Petrol Sold', value: `${fmtNumber(today.petrolQty)} L`, icon: '⛽' },
                { label: 'Diesel Sold', value: `${fmtNumber(today.dieselQty)} L`, icon: '🛢' },
              ].map(item => (
                <div key={item.label} className="bg-white/10 rounded-xl p-3">
                  <p className="text-slate-400 text-xs mb-1">{item.label}</p>
                  <p className="text-white text-lg font-bold">{item.value}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4">
              {[
                { label: 'Cash', value: today.cashRevenue, color: '#10b981' },
                { label: 'UPI', value: today.upiRevenue, color: '#3b82f6' },
                { label: 'Card', value: today.cardRevenue, color: '#8b5cf6' },
              ].map(p => (
                <div key={p.label} className="bg-white/10 rounded-xl p-3">
                  <p className="text-slate-400 text-xs mb-1">{p.label}</p>
                  <p className="font-bold font-tabular" style={{ color: p.color }}>{fmtCurrency(p.value, true)}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Revenue stacked bar chart */}
        <Card padding={false}>
          <div className="px-5 pt-5 pb-3">
            <CardHeader title="Revenue by Fuel Type" subtitle={`${dateRange.label} (₹000s)`} icon={BarChart3} />
          </div>
          <div className="h-64 px-2 pb-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}K`} width={55} />
                <Tooltip formatter={(v) => [`₹${v}K`, '']} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="Petrol" stackId="a" fill={FUEL_COLORS.petrol} radius={[0, 0, 0, 0]} />
                <Bar dataKey="Diesel" stackId="a" fill={FUEL_COLORS.diesel} />
                <Bar dataKey="CNG" stackId="a" fill={FUEL_COLORS.cng} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Detailed table */}
        <Card padding={false}>
          <div className="px-5 pt-5 pb-3 border-b border-slate-100">
            <CardHeader title="Period Detail" subtitle={`${filtered.length} days`} icon={Calendar} />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {['Date', 'Petrol (L)', 'Diesel (L)', 'CNG (kg)', 'Transactions', 'Total Revenue', 'Cash', 'UPI', 'Card'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-semibold text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...filtered].reverse().map(d => (
                  <tr key={d.date} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="px-4 py-3 font-semibold text-slate-700">{fmtDate(d.date)}</td>
                    <td className="px-4 py-3 font-tabular text-emerald-700">{fmtNumber(d.petrolQty)}</td>
                    <td className="px-4 py-3 font-tabular text-blue-700">{fmtNumber(d.dieselQty)}</td>
                    <td className="px-4 py-3 font-tabular text-amber-700">{fmtNumber(d.cngQty)}</td>
                    <td className="px-4 py-3 font-tabular">{d.totalTransactions}</td>
                    <td className="px-4 py-3 font-tabular font-semibold">{fmtCurrency(d.totalRevenue, true)}</td>
                    <td className="px-4 py-3 font-tabular">{fmtCurrency(d.cashRevenue, true)}</td>
                    <td className="px-4 py-3 font-tabular">{fmtCurrency(d.upiRevenue, true)}</td>
                    <td className="px-4 py-3 font-tabular">{fmtCurrency(d.cardRevenue, true)}</td>
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
