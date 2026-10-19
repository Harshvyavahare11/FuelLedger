// src/components/charts/RevenueTrendChart.jsx
import { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { DAILY_SALES } from '../../data/seedData';
import { fmtDateShort, compactINR, FUEL_COLORS } from '../../utils/formatters';
import { useApp } from '../../context/AppContext';
import dayjs from 'dayjs';
import Card, { CardHeader } from '../ui/Card';
import { TrendingUp } from 'lucide-react';

const FUEL_TYPES = ['all', 'petrol', 'diesel', 'cng'];
const FUEL_LABELS_MAP = { all: 'All Fuels', petrol: 'Petrol', diesel: 'Diesel', cng: 'CNG' };

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-100 rounded-xl shadow-xl p-3 min-w-[160px]">
      <p className="text-xs font-semibold text-slate-600 mb-2">{label}</p>
      {payload.map(entry => (
        <div key={entry.name} className="flex items-center justify-between gap-4 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
            <span className="text-slate-500">{entry.name}</span>
          </span>
          <span className="font-semibold text-slate-800">{compactINR(entry.value)}</span>
        </div>
      ))}
    </div>
  );
};

export default function RevenueTrendChart() {
  const { dateRange } = useApp();
  const [fuelFilter, setFuelFilter] = useState('all');

  const filtered = DAILY_SALES.filter(d => d.date >= dateRange.start && d.date <= dateRange.end);

  const data = filtered.map(d => ({
    date: fmtDateShort(d.date),
    'Total': d.totalRevenue,
    'Petrol': d.petrolRevenue,
    'Diesel': d.dieselRevenue,
    'CNG': d.cngRevenue,
  }));

  const lines = fuelFilter === 'all'
    ? [
        { key: 'Total', color: '#0f172a', dash: false },
        { key: 'Petrol', color: FUEL_COLORS.petrol, dash: true },
        { key: 'Diesel', color: FUEL_COLORS.diesel, dash: true },
        { key: 'CNG', color: FUEL_COLORS.cng, dash: true },
      ]
    : [{ key: fuelFilter.charAt(0).toUpperCase() + fuelFilter.slice(1), color: FUEL_COLORS[fuelFilter], dash: false }];

  return (
    <Card padding={false} className="overflow-hidden">
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <CardHeader title="Revenue Trend" subtitle={dateRange.label} icon={TrendingUp} />
          <div className="flex gap-1 flex-wrap">
            {FUEL_TYPES.map(f => (
              <button
                key={f}
                onClick={() => setFuelFilter(f)}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors
                  ${fuelFilter === f
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
              >
                {FUEL_LABELS_MAP[f]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="h-64 px-2 pb-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v) => compactINR(v)}
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
              width={60}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
            />
            {lines.map(({ key, color, dash }) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={color}
                strokeWidth={dash ? 1.5 : 2}
                strokeDasharray={dash ? '4 2' : undefined}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
