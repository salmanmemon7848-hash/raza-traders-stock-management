import React from 'react';
import { useAppContext } from '../../contexts/AppContext';

const RecentCustomers = () => {
  const { customers } = useAppContext();
  const recentCustomers = [...customers]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Customers</h3>
      
      {recentCustomers.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No customers yet</p>
      ) : (
        <div className="space-y-3">
          {recentCustomers.map((customer) => (
            <div 
              key={customer.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-semibold">
                  {customer.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{customer.name}</p>
                  <p className="text-sm text-gray-600">{customer.phone || 'No phone'}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Total Spent</p>
                <p className="font-bold text-green-600">Rs. {customer.totalSpent.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentCustomers;
