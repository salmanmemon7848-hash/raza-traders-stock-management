import React, { useState } from 'react';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Dashboard from './components/dashboard/Dashboard';
import StockManagement from './components/stock/StockManagement';
import BillingSystem from './components/billing/BillingSystem';
import CustomerManagement from './components/customers/CustomerManagement';
import Settings from './components/settings/Settings';
import Reports from './components/reports/Reports';
import Notifications from './components/common/Notifications';
import { AppProvider } from './contexts/AppContext';

const AppContent = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'stock':
        return <StockManagement />;
      case 'billing':
        return <BillingSystem />;
      case 'customers':
        return <CustomerManagement />;
      case 'reports':
        return <Reports />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  const getPageTitle = () => {
    const titles = {
      dashboard: 'Dashboard',
      stock: 'Stock Management',
      billing: 'Billing System',
      customers: 'Customers',
      reports: 'Reports',
      settings: 'Settings'
    };
    return titles[currentPage] || 'Raza Traders';
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          onMenuClick={() => setSidebarOpen(true)}
          title={getPageTitle()}
        />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {renderPage()}
        </main>
      </div>

      {/* Toast Notifications */}
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
