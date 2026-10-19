// src/components/charts/PaymentBreakdownChart.jsx
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import { DAILY_SALES } from '../../data/seedData';
import { useApp } from '../../context/AppContext';
import { compactINR, PAYMENT_COLORS } from '../../utils/formatters';
import Card, { CardHeader } from '../ui/Card';
import { CreditCard } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-100 rounded-xl shadow-xl p-3">
      <p className="text-xs font-semibold text-slate-600 mb-2">{label}</p>
      {payload.map(entry => (
        <div key={entry.name} className="flex items-center justify-between gap-4 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: entry.fill }} />
            <span className="text-slate-500">{entry.name}</span>
          </span>
          <span className="font-semibold">{compactINR(entry.value)}</span>
        </div>
      ))}
    </div>
  );
};

export default function PaymentBreakdownChart() {
  const { dateRange } = useApp();

  const filtered = DAILY_SALES.filter(d => d.date >= dateRange.start && d.date <= dateRange.end);
  const cash = filtered.reduce((s, d) => s + d.cashRevenue, 0);
  const upi = filtered.reduce((s, d) => s + d.upiRevenue, 0);
  const card = filtered.reduce((s, d) => s + d.cardRevenue, 0);
  const total = cash + upi + card;

  const data = [
    { name: 'Cash', value: cash, color: PAYMENT_COLORS.Cash, pct: total ? Math.round(cash / total * 100) : 0 },
    { name: 'UPI', value: upi, color: PAYMENT_COLORS.UPI, pct: total ? Math.round(upi / total * 100) : 0 },
    { name: 'Card', value: card, color: PAYMENT_COLORS.Card, pct: total ? Math.round(card / total * 100) : 0 },
  ];

  return (
    <Card padding={false} className="overflow-hidden">
      <div className="px-5 pt-5 pb-0">
        <CardHeader title="Payment Breakdown" subtitle={dateRange.label} icon={CreditCard} />
      </div>
      <div className="h-48 px-2 pb-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }} barSize={40}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={(v) => compactINR(v)} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={55} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      {/* Stats row */}
      <div className="px-5 pb-4 grid grid-cols-3 gap-2">
        {data.map(item => (
          <div key={item.name} className="text-center">
            <p className="text-lg font-bold text-slate-800 font-tabular" style={{ color: item.color }}>{item.pct}%</p>
            <p className="text-[10px] text-slate-500">{item.name}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
