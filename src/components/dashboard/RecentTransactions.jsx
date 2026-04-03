import React from 'react';
import { useAppContext } from '../../contexts/AppContext';

const RecentTransactions = () => {
  const { invoices } = useAppContext();
  const recentInvoices = [...invoices]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-6">
      <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">Recent Transactions</h3>
      
      {recentInvoices.length === 0 ? (
        <p className="text-gray-500 text-center py-8 text-sm sm:text-base">No transactions yet</p>
      ) : (
        <div className="space-y-2 sm:space-y-3">
          {recentInvoices.map((invoice) => (
            <div 
              key={invoice.id}
              className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex-1 min-w-0 mr-2 sm:mr-4">
                <p className="font-semibold text-gray-900 text-xs sm:text-sm truncate">{invoice.invoiceNumber}</p>
                <p className="text-xs text-gray-600 truncate">{invoice.customer?.name || 'Customer'}</p>
                <p className="text-xs text-gray-500 hidden sm:block">
                  {new Date(invoice.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-green-600 text-xs sm:text-sm">₹{invoice.grandTotal.toLocaleString()}</p>
                <p className="text-xs text-gray-500">{invoice.items.length} items</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentTransactions;
