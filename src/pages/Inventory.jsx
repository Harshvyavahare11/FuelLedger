// src/pages/Inventory.jsx
import { useState } from 'react';
import AppLayout from '../components/layout/AppLayout';
import { useApp } from '../context/AppContext';
import { FORECASTS, DELIVERIES } from '../data/seedData';
import Card, { CardHeader } from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import DeliveryForm from '../components/forms/DeliveryForm';
import { PrimaryButton, SecondaryButton } from '../components/ui/Buttons';
import { fmtCurrency, fmtDate, fmtNumber, FUEL_LABELS, FUEL_COLORS } from '../utils/formatters';
import { Package, Truck, AlertTriangle, TrendingDown, ChevronRight, Plus, BarChart3 } from 'lucide-react';

function ForecastCard({ fuelType }) {
  const forecast = FORECASTS[fuelType];
  if (!forecast) return null;
  const isCritical = forecast.currentStock <= forecast.reorderThreshold;
  const isLow = forecast.currentStock <= forecast.reorderThreshold * 1.5;

  return (
    <Card className={`border-2 ${isCritical ? 'border-red-200' : isLow ? 'border-amber-200' : 'border-emerald-100'}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full" style={{ background: FUEL_COLORS[fuelType] }} />
          <h3 className="text-sm font-bold text-slate-800">{FUEL_LABELS[fuelType]}</h3>
        </div>
        {isCritical && <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded-full flex items-center gap-1"><AlertTriangle className="w-3 h-3" />CRITICAL</span>}
        {isLow && !isCritical && <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full">LOW STOCK</span>}
      </div>

      <div className="space-y-3">
        {/* Stock bar */}
        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-slate-500">Current Stock</span>
            <span className="font-bold text-slate-800">{fmtNumber(forecast.currentStock)} {forecast.unit}</span>
          </div>
          <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.min(100, (forecast.currentStock / (forecast.currentStock + forecast.recommendedOrder)) * 100)}%`,
                background: FUEL_COLORS[fuelType],
              }}
            />
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-slate-50 rounded-lg p-2">
            <p className="text-[10px] text-slate-500">Avg Daily Usage</p>
            <p className="text-sm font-bold text-slate-800">{fmtNumber(forecast.avgDailyUsage)} {forecast.unit}</p>
          </div>
          <div className={`rounded-lg p-2 ${isCritical ? 'bg-red-50' : 'bg-slate-50'}`}>
            <p className="text-[10px] text-slate-500">Days Remaining</p>
            <p className={`text-sm font-bold ${isCritical ? 'text-red-600' : 'text-slate-800'}`}>{forecast.daysRemaining} days</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-2">
            <p className="text-[10px] text-slate-500">Target Stock (14d)</p>
            <p className="text-sm font-bold text-slate-800">{fmtNumber(forecast.targetStock)} {forecast.unit}</p>
          </div>
          <div className={`rounded-lg p-2 ${forecast.recommendedOrder > 0 ? 'bg-amber-50' : 'bg-emerald-50'}`}>
            <p className="text-[10px] text-slate-500">Recommended Order</p>
            <p className={`text-sm font-bold ${forecast.recommendedOrder > 0 ? 'text-amber-700' : 'text-emerald-600'}`}>
              {fmtNumber(forecast.recommendedOrder)} {forecast.unit}
            </p>
          </div>
        </div>

        {/* Formula note */}
        <p className="text-[10px] text-slate-400 leading-relaxed">
          Formula: Target = avg7d × 14 days. Order = Target − Current. Based on 7-day moving avg.
        </p>
      </div>
    </Card>
  );
}

export default function Inventory() {
  const { inventory, deliveries } = useApp();
  const [deliveryModal, setDeliveryModal] = useState(false);

  const allDeliveries = [...(deliveries || [])].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <AppLayout title="Inventory & Forecasting" subtitle="Stock levels, deliveries, and demand forecasting">
      <div className="space-y-5 animate-fade-in">
        {/* Action bar */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-600">7-day weighted moving average forecasting.</p>
            <p className="text-xs text-slate-400">Safety stock target: 14 days of usage. Demo data only.</p>
          </div>
          <PrimaryButton icon={Plus} onClick={() => setDeliveryModal(true)}>Add Delivery</PrimaryButton>
        </div>

        {/* Forecast cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['petrol', 'diesel', 'cng'].map(fuel => (
            <ForecastCard key={fuel} fuelType={fuel} />
          ))}
        </div>

        {/* Inventory summary hero */}
        <Card>
          <CardHeader title="Tank Inventory Status" subtitle="Horizontal view of all tanks" icon={Package} />
          <div className="space-y-5">
            {['petrol', 'diesel', 'cng'].map(fuel => {
              const inv = inventory[fuel];
              if (!inv) return null;
              const pct = Math.min(100, Math.round((inv.currentStock / inv.capacity) * 100));
              const reorderPct = Math.round((inv.reorderThreshold / inv.capacity) * 100);
              const isCritical = inv.currentStock <= inv.reorderThreshold;
              const isLow = inv.currentStock <= inv.reorderThreshold * 1.5;
              const color = isCritical ? '#ef4444' : isLow ? '#f59e0b' : FUEL_COLORS[fuel];

              return (
                <div key={fuel} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                      <span className="text-sm font-semibold text-slate-700">{FUEL_LABELS[fuel]}</span>
                      <span className="text-xs text-slate-400">{inv.tankId}</span>
                      {isCritical && <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded">CRITICAL</span>}
                      {isLow && !isCritical && <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded">LOW</span>}
                    </div>
                    <div className="text-right text-xs">
                      <span className="font-bold text-slate-800">{fmtNumber(inv.currentStock)} {inv.unit}</span>
                      <span className="text-slate-400"> / {fmtNumber(inv.capacity)} {inv.unit}</span>
                      <span className="ml-2 font-bold" style={{ color }}>{pct}%</span>
                    </div>
                  </div>
                  <div className="relative h-5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="absolute inset-y-0 w-0.5 bg-slate-500 z-10" style={{ left: `${reorderPct}%` }} />
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-white drop-shadow">{pct}% full</span>
                    </div>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Reorder at {fmtNumber(inv.reorderThreshold)} {inv.unit}</span>
                    <span>Capacity: {fmtNumber(inv.capacity)} {inv.unit}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Deliveries */}
        <Card padding={false}>
          <div className="px-5 pt-5 pb-3 flex items-center justify-between border-b border-slate-100">
            <CardHeader title="Delivery History" subtitle={`${allDeliveries.length} deliveries`} icon={Truck} />
            <PrimaryButton size="sm" icon={Plus} onClick={() => setDeliveryModal(true)}>New Delivery</PrimaryButton>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {['Del. ID', 'Date', 'Fuel', 'Ordered', 'Received', 'Invoice', 'Unit Cost', 'Total', 'Supplier', 'Notes'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-semibold text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allDeliveries.map(d => {
                  const shortage = d.quantityOrdered - d.quantityReceived;
                  return (
                    <tr key={d.id} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="px-4 py-3 font-mono text-slate-600">{d.id}</td>
                      <td className="px-4 py-3 text-slate-600">{fmtDate(d.date)}</td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full" style={{ background: FUEL_COLORS[d.fuelType] }} />
                          {FUEL_LABELS[d.fuelType]}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-tabular">{fmtNumber(d.quantityOrdered)} {d.unit}</td>
                      <td className="px-4 py-3 font-tabular">
                        <span className={shortage > 0 ? 'text-red-600 font-bold' : ''}>
                          {fmtNumber(d.quantityReceived)} {d.unit}
                          {shortage > 0 && <span className="ml-1 text-[10px]">(-{shortage})</span>}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-600">{d.invoiceNumber}</td>
                      <td className="px-4 py-3 font-tabular">₹{d.unitCost.toFixed(2)}</td>
                      <td className="px-4 py-3 font-tabular font-semibold">{fmtCurrency(d.totalCost, true)}</td>
                      <td className="px-4 py-3 text-slate-600">{d.supplierName}</td>
                      <td className="px-4 py-3 text-slate-400 max-w-xs truncate">{d.notes || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <Modal isOpen={deliveryModal} onClose={() => setDeliveryModal(false)} title="Add Stock Delivery" size="lg">
        <DeliveryForm onSuccess={() => setDeliveryModal(false)} onCancel={() => setDeliveryModal(false)} />
      </Modal>
    </AppLayout>
  );
}
