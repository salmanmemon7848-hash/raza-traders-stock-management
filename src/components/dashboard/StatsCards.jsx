import React from 'react';
import { DollarSign, TrendingUp, Package, Users, Receipt } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { calculateProfit } from '../../utils/calculations';

const StatsCards = () => {
  const { products, customers, invoices, expenses } = useAppContext();
  
  const totalSales = invoices.reduce((sum, invoice) => sum + invoice.grandTotal, 0);
  const grossProfit = calculateProfit(products, invoices);
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const netProfit = grossProfit - totalExpenses;
  const totalProducts = products.length;
  const totalCustomers = customers.length;

  const cards = [
    {
      title: 'Total Sales',
      value: `₹${totalSales.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-green-500',
      textColor: 'text-green-600'
    },
    {
      title: 'Total Expenses',
      value: `₹${totalExpenses.toLocaleString()}`,
      icon: Receipt,
      color: 'bg-red-500',
      textColor: 'text-red-600'
    },
    {
      title: 'Net Profit',
      value: `₹${netProfit.toLocaleString()}`,
      icon: TrendingUp,
      color: netProfit >= 0 ? 'bg-blue-500' : 'bg-orange-500',
      textColor: netProfit >= 0 ? 'text-blue-600' : 'text-orange-600'
    },
    {
      title: 'Customers',
      value: totalCustomers.toString(),
      icon: Users,
      color: 'bg-purple-500',
      textColor: 'text-purple-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div key={index} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
                <p className={`text-2xl font-bold ${card.textColor}`}>{card.value}</p>
              </div>
              <div className={`${card.color} p-3 rounded-lg`}>
                <Icon size={24} className="text-white" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;
