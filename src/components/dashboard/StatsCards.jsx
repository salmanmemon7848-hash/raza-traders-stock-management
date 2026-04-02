import React from 'react';
import { DollarSign, TrendingUp, Package, Users } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { calculateProfit } from '../../utils/calculations';

const StatsCards = () => {
  const { products, customers, invoices } = useAppContext();
  
  const totalSales = invoices.reduce((sum, invoice) => sum + invoice.grandTotal, 0);
  const totalProfit = calculateProfit(products, invoices);
  const totalProducts = products.length;
  const totalCustomers = customers.length;

  const cards = [
    {
      title: 'Total Sales',
      value: `Rs. ${totalSales.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-green-500',
      textColor: 'text-green-600'
    },
    {
      title: 'Total Profit',
      value: `Rs. ${totalProfit.toLocaleString()}`,
      icon: TrendingUp,
      color: 'bg-blue-500',
      textColor: 'text-blue-600'
    },
    {
      title: 'Total Products',
      value: totalProducts.toString(),
      icon: Package,
      color: 'bg-purple-500',
      textColor: 'text-purple-600'
    },
    {
      title: 'Total Customers',
      value: totalCustomers.toString(),
      icon: Users,
      color: 'bg-orange-500',
      textColor: 'text-orange-600'
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
