import React, { useMemo } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import StatsCards from './StatsCards';
import SalesChart from './SalesChart';
import TopProducts from './TopProducts';
import LowStockAlert from './LowStockAlert';
import RecentTransactions from './RecentTransactions';
import RecentCustomers from './RecentCustomers';
import { AlertTriangle, IndianRupee, TrendingUp, TrendingDown } from 'lucide-react';

const Dashboard = () => {
  const { invoices, expenses } = useAppContext();
  
  // Calculate today's metrics
  const today = useMemo(() => new Date().toDateString(), []);
  
  const todaySales = useMemo(() => {
    return invoices
      .filter(inv => new Date(inv.createdAt).toDateString() === today)
      .reduce((sum, inv) => sum + inv.grandTotal, 0);
  }, [invoices, today]);

  const todayExpenses = useMemo(() => {
    return expenses
      .filter(exp => new Date(exp.date).toDateString() === today)
      .reduce((sum, exp) => sum + exp.amount, 0);
  }, [expenses, today]);

  const todayProfit = useMemo(() => todaySales - todayExpenses, [todaySales, todayExpenses]);
  
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

      {/* Today's Metrics - New Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Today's Sales */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg shadow-sm border-2 border-green-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-green-700">Today's Sales</h3>
            <IndianRupee size={20} className="text-green-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-green-800">₹{todaySales.toLocaleString()}</p>
          <p className="text-xs text-green-600 mt-1">Revenue from today's invoices</p>
        </div>

        {/* Today's Expenses */}
        <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg shadow-sm border-2 border-red-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-red-700">Today's Expenses</h3>
            <TrendingDown size={20} className="text-red-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-red-800">₹{todayExpenses.toLocaleString()}</p>
          <p className="text-xs text-red-600 mt-1">Spent on today's expenses</p>
        </div>

        {/* Today's Profit */}
        <div className={`bg-gradient-to-br ${todayProfit >= 0 ? 'from-blue-50 to-blue-100 border-blue-200' : 'from-orange-50 to-orange-100 border-orange-200'} p-4 rounded-lg shadow-sm border-2`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className={`text-sm font-semibold ${todayProfit >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>Today's Profit</h3>
            <TrendingUp size={20} className={todayProfit >= 0 ? 'text-blue-600' : 'text-orange-600'} />
          </div>
          <p className={`text-2xl sm:text-3xl font-bold ${todayProfit >= 0 ? 'text-blue-800' : 'text-orange-800'}`}>₹{todayProfit.toLocaleString()}</p>
          <p className={`text-xs ${todayProfit >= 0 ? 'text-blue-600' : 'text-orange-600'} mt-1`}>Sales - Expenses</p>
        </div>
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
