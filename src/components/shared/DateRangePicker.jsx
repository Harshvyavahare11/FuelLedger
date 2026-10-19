// src/components/shared/DateRangePicker.jsx
import { useState } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const PRESETS = [
  { key: 'today', label: 'Today' },
  { key: '7d', label: 'Last 7 Days' },
  { key: '30d', label: 'Last 30 Days' },
];

export default function DateRangePicker() {
  const { dateRange, setPreset } = useApp();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-white hover:border-slate-300 transition-colors"
      >
        <Calendar className="w-3.5 h-3.5 text-slate-400" />
        <span className="hidden sm:block">{dateRange.label}</span>
        <ChevronDown className="w-3 h-3 text-slate-400" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-40 bg-white border border-slate-200 rounded-xl shadow-xl py-1 min-w-[140px]">
            {PRESETS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => { setPreset(key); setOpen(false); }}
                className={`w-full text-left px-4 py-2 text-xs font-medium transition-colors hover:bg-slate-50
                  ${dateRange.label === label ? 'text-emerald-600 bg-emerald-50' : 'text-slate-600'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
