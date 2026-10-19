// src/components/layout/AppLayout.jsx
import { useApp } from '../../context/AppContext';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function AppLayout({ children, title, subtitle }) {
  const { sidebarOpen } = useApp();

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar />

      {/* Main content area */}
      <div
        className={`flex flex-col flex-1 min-w-0 transition-all duration-300
          ${sidebarOpen ? 'lg:ml-60' : 'lg:ml-16'}
        `}
      >
        <TopBar title={title} subtitle={subtitle} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
