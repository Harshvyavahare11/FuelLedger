import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Dashboard from './pages/Dashboard';
import FuelSales from './pages/FuelSales';
import Inventory from './pages/Inventory';
import Payments from './pages/Payments';
import Employees from './pages/Employees';
import EVCharging from './pages/EVCharging';
import Reports from './pages/Reports';
import AIAssistant from './pages/AIAssistant';

export default function App() {
  return (
    <HashRouter>
      <AppProvider>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/sales" element={<FuelSales />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/ev" element={<EVCharging />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/ai" element={<AIAssistant />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppProvider>
    </HashRouter>
  );
}
