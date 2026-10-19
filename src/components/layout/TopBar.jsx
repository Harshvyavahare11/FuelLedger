// src/components/layout/TopBar.jsx
import { Bell, User, ChevronDown, Menu, Calendar, RefreshCw } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { fmtDateTime, DEMO_TODAY } from '../../utils/formatters';
import DateRangePicker from '../shared/DateRangePicker';
import dayjs from 'dayjs';

export default function TopBar({ title, subtitle }) {
  const { sidebarOpen, setSidebarOpen, station, alerts, dateRange } = useApp();
  const unresolvedAlerts = alerts.filter(a => !a.resolved).length;

  return (
    <header className="topbar-glass h-16 flex items-center px-4 gap-4 border-b border-gray-100 sticky top-0 z-10 flex-shrink-0">
      {/* Hamburger (mobile) */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors lg:hidden"
        aria-label="Toggle sidebar"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Page title */}
      <div className="flex-1 min-w-0">
        <h1 className="text-base font-semibold text-slate-800 truncate">{title}</h1>
        {subtitle && <p className="text-xs text-slate-500 truncate">{subtitle}</p>}
      </div>

      {/* Demo badge */}
      <div className="demo-badge hidden sm:block">Demo Data</div>

      {/* Date range picker */}
      <DateRangePicker />

      {/* Last updated */}
      <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-500">
        <RefreshCw className="w-3 h-3" />
        <span>Updated {dayjs(DEMO_TODAY).format('DD MMM, hh:mm A')}</span>
      </div>

      {/* Notification bell */}
      <button
        className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
        aria-label={`Notifications (${unresolvedAlerts} unread)`}
      >
        <Bell className="w-4.5 h-4.5" />
        {unresolvedAlerts > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
            {unresolvedAlerts}
          </span>
        )}
      </button>

      {/* Profile */}
      <button className="flex items-center gap-2 p-1.5 hover:bg-slate-100 rounded-xl transition-colors">
        <div className="w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center">
          <span className="text-white text-xs font-bold">
            {station.ownerName.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </span>
        </div>
        <div className="hidden md:block text-left">
          <p className="text-xs font-semibold text-slate-700 leading-none">{station.ownerName.split(' ')[0]}</p>
          <p className="text-[10px] text-slate-400 leading-none mt-0.5">Owner</p>
        </div>
        <ChevronDown className="w-3 h-3 text-slate-400 hidden md:block" />
      </button>
    </header>
  );
}
