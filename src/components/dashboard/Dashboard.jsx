import React from 'react';
import { useAppContext } from '../../contexts/AppContext';
import StatsCards from './StatsCards';
import SalesChart from './SalesChart';
import TopProducts from './TopProducts';
import LowStockAlert from './LowStockAlert';
import RecentTransactions from './RecentTransactions';
import RecentCustomers from './RecentCustomers';
import { AlertTriangle, IndianRupee } from 'lucide-react';

const Dashboard = () => {
  const { invoices } = useAppContext();
  
  // Calculate total credit (udhaar)
  const totalCredit = invoices
    .filter(inv => inv.isCredit || inv.paymentStatus === 'unpaid')
    .reduce((sum, inv) => sum + inv.grandTotal, 0);
  
  const pendingPaymentsCount = invoices.filter(inv => inv.isCredit || inv.paymentStatus === 'unpaid').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-sm text-gray-600 mt-1">Real-time business insights and analytics</p>
      </div>

      {/* Credit Alert - High Priority */}
      {pendingPaymentsCount > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-sm">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-red-600 flex-shrink-0" size={24} />
            <div className="flex-1">
              <h3 className="font-bold text-red-800">⚠️ Pending Payments Alert</h3>
              <p className="text-red-700 mt-1">
                You have <strong>{pendingPaymentsCount}</strong> unpaid invoice(s) totaling{' '}
                <strong className="text-lg">₹{totalCredit.toLocaleString()}</strong>
              </p>
              <p className="text-sm text-red-600 mt-2">
                💸 Track these in Reports → Billing History or Customers section
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <StatsCards />
      
      {/* Charts and Alerts - Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <SalesChart />
          <TopProducts />
        </div>
        <div>
          <LowStockAlert />
          <RecentTransactions />
          <RecentCustomers />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
