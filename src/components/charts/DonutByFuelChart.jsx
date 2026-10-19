// src/components/charts/DonutByFuelChart.jsx
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DAILY_SALES } from '../../data/seedData';
import { useApp } from '../../context/AppContext';
import { fmtNumber, compactINR, FUEL_COLORS } from '../../utils/formatters';
import Card, { CardHeader } from '../ui/Card';
import { PieChart as PieIcon } from 'lucide-react';

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="bg-white border border-slate-100 rounded-xl shadow-xl p-3">
      <p className="text-xs font-semibold text-slate-700 mb-1">{item.name}</p>
      <p className="text-xs text-slate-500">Revenue: <span className="font-semibold text-slate-800">{compactINR(item.value)}</span></p>
      <p className="text-xs text-slate-500">Share: <span className="font-semibold text-slate-800">{item.payload.pct}%</span></p>
    </div>
  );
};

const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, pct }) => {
  if (pct < 5) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={700}>
      {pct}%
    </text>
  );
};

export default function DonutByFuelChart() {
  const { dateRange } = useApp();

  const filtered = DAILY_SALES.filter(d => d.date >= dateRange.start && d.date <= dateRange.end);
  const petrol = filtered.reduce((s, d) => s + d.petrolRevenue, 0);
  const diesel = filtered.reduce((s, d) => s + d.dieselRevenue, 0);
  const cng = filtered.reduce((s, d) => s + d.cngRevenue, 0);
  const total = petrol + diesel + cng;

  const data = [
    { name: 'Petrol', value: petrol, color: FUEL_COLORS.petrol, pct: total ? Math.round(petrol / total * 100) : 0 },
    { name: 'Diesel', value: diesel, color: FUEL_COLORS.diesel, pct: total ? Math.round(diesel / total * 100) : 0 },
    { name: 'CNG', value: cng, color: FUEL_COLORS.cng, pct: total ? Math.round(cng / total * 100) : 0 },
  ];

  return (
    <Card padding={false} className="overflow-hidden">
      <div className="px-5 pt-5 pb-0">
        <CardHeader title="Sales by Fuel Type" subtitle={dateRange.label} icon={PieIcon} />
      </div>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              dataKey="value"
              labelLine={false}
              label={renderCustomLabel}
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              iconType="circle"
              iconSize={8}
              formatter={(value, entry) => (
                <span className="text-xs text-slate-600">{value} ({entry.payload.pct}%)</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      {/* Legend table */}
      <div className="px-5 pb-4 space-y-1.5">
        {data.map(item => (
          <div key={item.name} className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: item.color }} />
              <span className="text-slate-600">{item.name}</span>
            </span>
            <span className="font-semibold text-slate-800 font-tabular">{compactINR(item.value)}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
