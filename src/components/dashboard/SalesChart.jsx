import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const SalesChart = () => {
  const { invoices } = useAppContext();
  const [viewType, setViewType] = useState('monthly');

  // Group sales by day or month
  const salesData = React.useMemo(() => {
    const grouped = {};
    
    invoices.forEach(invoice => {
      const date = new Date(invoice.createdAt);
      let key;
      
      if (viewType === 'daily') {
        key = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } else {
        key = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      }
      
      if (!grouped[key]) {
        grouped[key] = {
          name: key,
          sales: 0,
          orders: 0
        };
      }
      
      grouped[key].sales += invoice.grandTotal;
      grouped[key].orders += 1;
    });
    
    return Object.values(grouped).slice(-12); // Last 12 data points
  }, [invoices, viewType]);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">Sales Overview</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setViewType('daily')}
            className={`px-3 py-1 text-sm rounded-lg transition-colors ${
              viewType === 'daily'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Daily
          </button>
          <button
            onClick={() => setViewType('monthly')}
            className={`px-3 py-1 text-sm rounded-lg transition-colors ${
              viewType === 'monthly'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Monthly
          </button>
        </div>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={salesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip 
              formatter={(value) => `Rs. ${value.toLocaleString()}`}
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0' }}
            />
            <Bar dataKey="sales" fill="#0ea5e9" name="Sales" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SalesChart;
