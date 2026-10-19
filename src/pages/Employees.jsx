// src/pages/Employees.jsx
import AppLayout from '../components/layout/AppLayout';
import { useApp } from '../context/AppContext';
import Card, { CardHeader } from '../components/ui/Card';
import StatusPill from '../components/ui/StatusPill';
import { fmtDate } from '../utils/formatters';
import { Users, User, Phone } from 'lucide-react';

export default function Employees() {
  const { employees } = useApp();

  return (
    <AppLayout title="Employees" subtitle="Staff management and attendance">
      <div className="space-y-5 animate-fade-in">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {employees.map(emp => (
            <Card key={emp.id} hover>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-white text-base font-bold flex-shrink-0">
                  {emp.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-slate-800 truncate">{emp.name}</p>
                    <StatusPill status={emp.active ? 'Active' : 'Inactive'} size="xs" />
                  </div>
                  <p className="text-xs text-slate-500">{emp.role} · {emp.shift} Shift</p>
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                    <Phone className="w-3 h-3" /> {emp.phone}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">ID: {emp.id} · Since {fmtDate(emp.joinDate)}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
        <Card>
          <p className="text-xs text-slate-500 text-center py-4">Full attendance management, shift records, and salary advances — coming in Phase 3. Demo data shown.</p>
        </Card>
      </div>
    </AppLayout>
  );
}
