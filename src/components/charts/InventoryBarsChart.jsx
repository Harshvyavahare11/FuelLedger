// src/components/charts/InventoryBarsChart.jsx
import { useApp } from '../../context/AppContext';
import { FORECASTS } from '../../data/seedData';
import { fmtNumber, FUEL_COLORS, FUEL_LABELS } from '../../utils/formatters';
import Card, { CardHeader } from '../ui/Card';
import { Package, Truck, AlertTriangle } from 'lucide-react';

function InventoryBar({ fuel, data, forecast }) {
  const pct = Math.min(100, Math.round((data.currentStock / data.capacity) * 100));
  const reorderPct = Math.round((data.reorderThreshold / data.capacity) * 100);
  const isLow = data.currentStock <= data.reorderThreshold * 1.5;
  const isCritical = data.currentStock <= data.reorderThreshold;
  const color = isCritical ? '#ef4444' : isLow ? '#f59e0b' : FUEL_COLORS[fuel];

  return (
    <div className="py-3 border-b border-slate-50 last:border-0">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
          <span className="text-sm font-semibold text-slate-700">{FUEL_LABELS[fuel]}</span>
          {isCritical && (
            <span className="flex items-center gap-1 px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-[10px] font-bold">
              <AlertTriangle className="w-3 h-3" /> CRITICAL
            </span>
          )}
          {isLow && !isCritical && (
            <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-[10px] font-bold">LOW</span>
          )}
        </div>
        <div className="text-right">
          <span className="text-sm font-bold text-slate-800 font-tabular">
            {fmtNumber(data.currentStock)} {data.unit}
          </span>
          <span className="text-xs text-slate-400 ml-1">/ {fmtNumber(data.capacity)}</span>
        </div>
      </div>

      {/* Bar */}
      <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden">
        {/* Reorder threshold marker */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-slate-400 z-10 opacity-60"
          style={{ left: `${reorderPct}%` }}
        />
        {/* Fill */}
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>

      {/* Info row */}
      <div className="flex items-center justify-between mt-1.5">
        <span className="text-[10px] text-slate-400">
          Reorder: {fmtNumber(data.reorderThreshold)} {data.unit} (↑ marker)
        </span>
        <div className="flex items-center gap-3 text-[10px] text-slate-500">
          {forecast && (
            <>
              <span>~{forecast.daysRemaining}d remaining</span>
              <span className="text-slate-300">|</span>
              <span>Order: {fmtNumber(forecast.recommendedOrder)} {data.unit}</span>
            </>
          )}
          <span className="font-semibold" style={{ color }}>{pct}%</span>
        </div>
      </div>
    </div>
  );
}

export default function InventoryBarsChart() {
  const { inventory } = useApp();

  const fuels = ['petrol', 'diesel', 'cng'];

  return (
    <Card padding={false} className="overflow-hidden">
      <div className="flex items-start gap-4 px-5 pt-5 pb-3">
        {/* AI image placeholder - fuel truck */}
        <div className="hidden lg:block w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-slate-800">
          <img
            src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=160&h=160&fit=crop&q=80"
            alt="Fuel delivery truck"
            className="w-full h-full object-cover opacity-80"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentElement.innerHTML = `<div class="w-full h-full flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="1.5"><path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3m0 0h1l4 4v3h-5V8Z"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg></div>`;
            }}
          />
        </div>
        <div className="flex-1">
          <CardHeader title="Fuel Inventory Status" subtitle="Current stock vs capacity" icon={Package} />
        </div>
      </div>

      <div className="px-5 pb-5">
        {fuels.map(fuel => (
          <InventoryBar
            key={fuel}
            fuel={fuel}
            data={inventory[fuel] || { currentStock: 0, capacity: 1, reorderThreshold: 0, unit: 'L' }}
            forecast={FORECASTS[fuel]}
          />
        ))}
      </div>

      <div className="px-5 pb-4 bg-slate-50 rounded-b-xl">
        <p className="text-[10px] text-slate-400 pt-3">
          ↑ Red marker = reorder threshold. Stock levels are demo data updated nightly at 23:00 IST.
        </p>
      </div>
    </Card>
  );
}
