// src/pages/EVCharging.jsx
import AppLayout from '../components/layout/AppLayout';
import { useApp } from '../context/AppContext';
import Card, { CardHeader } from '../components/ui/Card';
import StatusPill from '../components/ui/StatusPill';
import Badge from '../components/ui/Badge';
import { fmtCurrency, fmtDateTime } from '../utils/formatters';
import { Zap, Battery, Clock, IndianRupee } from 'lucide-react';

export default function EVCharging() {
  const { evSessions } = useApp();

  const totalEnergy = evSessions.reduce((s, e) => s + e.energyDispensed, 0);
  const totalRev = evSessions.reduce((s, e) => s + e.totalAmount, 0);

  return (
    <AppLayout title="EV Charging" subtitle="Electric vehicle charging session management">
      <div className="space-y-5 animate-fade-in">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Sessions', value: evSessions.length, icon: Zap, color: 'text-violet-600', bg: 'bg-violet-50' },
            { label: 'Energy Dispensed', value: `${totalEnergy.toFixed(1)} kWh`, icon: Battery, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Total Revenue', value: fmtCurrency(totalRev, true), icon: IndianRupee, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Avg Session', value: `${Math.round(evSessions.reduce((s, e) => s + e.durationMinutes, 0) / evSessions.length)} min`, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
          ].map(kpi => (
            <Card key={kpi.label}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-slate-500">{kpi.label}</p>
                <div className={`p-1.5 rounded-lg ${kpi.bg}`}><kpi.icon className={`w-3.5 h-3.5 ${kpi.color}`} /></div>
              </div>
              <p className={`text-xl font-bold ${kpi.color} font-tabular`}>{kpi.value}</p>
            </Card>
          ))}
        </div>

        <Card padding={false}>
          <div className="px-5 pt-5 pb-3 border-b border-slate-100">
            <CardHeader title="Charging Sessions" subtitle="Demo EV charging data" icon={Zap} />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {['Session ID', 'Date & Time', 'Charger', 'Vehicle', 'Energy (kWh)', 'Rate', 'Amount', 'Payment', 'Duration', 'Status'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-semibold text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {evSessions.map(s => (
                  <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-slate-600">{s.id}</td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{fmtDateTime(s.startTime)}</td>
                    <td className="px-4 py-3">
                      <span className="px-1.5 py-0.5 bg-violet-100 text-violet-700 rounded text-[10px] font-semibold">{s.chargerId}</span>
                      <p className="text-[10px] text-slate-400 mt-0.5">{s.chargerType}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-mono text-slate-700">{s.vehicleNumber}</p>
                      <p className="text-[10px] text-slate-400">{s.vehicleType}</p>
                    </td>
                    <td className="px-4 py-3 font-tabular font-semibold text-violet-700">{s.energyDispensed.toFixed(1)}</td>
                    <td className="px-4 py-3 font-tabular">₹{s.ratePerUnit.toFixed(2)}/kWh</td>
                    <td className="px-4 py-3 font-tabular font-semibold">{fmtCurrency(s.totalAmount)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${s.paymentMethod === 'UPI' ? 'bg-blue-100 text-blue-700' : s.paymentMethod === 'Card' ? 'bg-violet-100 text-violet-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {s.paymentMethod}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{s.durationMinutes} min</td>
                    <td className="px-4 py-3"><StatusPill status={s.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-violet-100 rounded-xl"><Zap className="w-5 h-5 text-violet-600" /></div>
            <div>
              <p className="text-sm font-semibold text-slate-700">EV Charging Management — Phase 5</p>
              <p className="text-xs text-slate-500">Real-time charger monitoring, OCPP integration, booking management, and fleet accounts coming in Phase 5. Above shows demo session data.</p>
            </div>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
