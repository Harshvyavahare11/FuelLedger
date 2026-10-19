// src/components/layout/Sidebar.jsx
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Fuel, Package, CreditCard, Users, BarChart3,
  Bot, Settings, ChevronLeft, ChevronRight, Zap, TrendingUp, X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/', end: true },
  { label: 'Fuel Sales', icon: Fuel, path: '/sales' },
  { label: 'Inventory', icon: Package, path: '/inventory' },
  { label: 'Payments', icon: CreditCard, path: '/payments' },
  { label: 'Employees', icon: Users, path: '/employees' },
  { label: 'EV Charging', icon: Zap, path: '/ev' },
  { label: 'Reports', icon: BarChart3, path: '/reports' },
  { label: 'AI Assistant', icon: Bot, path: '/ai' },
];

export default function Sidebar() {
  const { sidebarOpen, setSidebarOpen } = useApp();

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-30 h-full sidebar-gradient flex flex-col sidebar-transition
          ${sidebarOpen ? 'w-60' : 'w-16'}
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className={`flex items-center h-16 px-4 border-b border-white/10 flex-shrink-0 ${sidebarOpen ? 'justify-between' : 'justify-center'}`}>
          {sidebarOpen ? (
            <>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Fuel className="w-4 h-4 text-white" />
                </div>
                <div>
                  <span className="text-white font-bold text-sm block leading-tight">FuelLedger</span>
                  <span className="text-emerald-400 text-[10px] font-semibold tracking-wider">AI PLATFORM</span>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors lg:flex hidden"
                aria-label="Collapse sidebar"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors lg:hidden"
                aria-label="Close sidebar"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button
              onClick={() => setSidebarOpen(true)}
              className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center"
              aria-label="Expand sidebar"
            >
              <Fuel className="w-4 h-4 text-white" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto" aria-label="Main navigation">
          {NAV_ITEMS.map(({ label, icon: Icon, path, end }) => (
            <NavLink
              key={path}
              to={path}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group
                ${isActive
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-white/10'
                }
                ${!sidebarOpen ? 'justify-center' : ''}`
              }
              title={!sidebarOpen ? label : undefined}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {sidebarOpen && <span className="text-sm font-medium truncate">{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Bottom: Station info */}
        {sidebarOpen && (
          <div className="px-4 py-4 border-t border-white/10 flex-shrink-0">
            <div className="bg-white/10 rounded-xl p-3">
              <p className="text-white text-xs font-semibold truncate">FL-PN-001</p>
              <p className="text-slate-400 text-[10px] mt-0.5">Bharat Petroleum · Nagpur</p>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="status-dot demo" />
                <span className="text-amber-400 text-[10px] font-semibold">DEMO DATA MODE</span>
              </div>
            </div>
          </div>
        )}

        {/* Collapse toggle (desktop, collapsed state) */}
        {!sidebarOpen && (
          <div className="px-2 py-4 border-t border-white/10 flex-shrink-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="w-full flex justify-center p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
              aria-label="Expand sidebar"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
