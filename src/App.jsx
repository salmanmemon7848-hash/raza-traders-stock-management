import React, { useState } from 'react';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Dashboard from './components/dashboard/Dashboard';
import StockManagement from './components/stock/StockManagement';
import BillingSystem from './components/billing/BillingSystem';
import CustomerManagement from './components/customers/CustomerManagement';
import ExpenseManagement from './components/expenses/ExpenseManagement';
import Settings from './components/settings/Settings';
import Reports from './components/reports/Reports';
import ProductRequests from './components/requests/ProductRequests';
import Notifications from './components/common/Notifications';
import { AppProvider } from './contexts/AppContext';

const PAGE_TITLES = {
  dashboard: 'Dashboard',
  stock: 'Stock',
  billing: 'New Bill',
  customers: 'Customers',
  requests: 'Product Requests',
  expenses: 'Expenses',
  reports: 'Reports',
  settings: 'Settings',
};

const AppContent = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard onNavigate={setCurrentPage} />;
      case 'stock':     return <StockManagement />;
      case 'billing':   return <BillingSystem />;
      case 'customers': return <CustomerManagement />;
      case 'requests':  return <ProductRequests />;
      case 'expenses':  return <ExpenseManagement />;
      case 'reports':   return <Reports />;
      case 'settings':  return <Settings />;
      default:          return <Dashboard onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          title={PAGE_TITLES[currentPage] || 'Raza Traders'}
          onQuickAction={
            currentPage !== 'billing' ? () => setCurrentPage('billing') : undefined
          }
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {renderPage()}
        </main>
      </div>

      <Notifications />
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
