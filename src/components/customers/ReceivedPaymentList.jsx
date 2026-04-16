import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { IndianRupee, Calendar, Trash2, Edit, Filter } from 'lucide-react';
import ReceivedPaymentForm from './ReceivedPaymentForm';

const ReceivedPaymentList = () => {
  const { payments, dispatch, success, error } = useAppContext();
  const [filterType, setFilterType] = useState('all'); // all, today, week, month

  // Filter payments based on date
  const getFilteredPayments = () => {
    const now = new Date();
    const today = new Date().toDateString();
    
    return payments.filter(payment => {
      const paymentDate = new Date(payment.date || payment.createdAt);
      
      if (filterType === 'today') {
        return paymentDate.toDateString() === today;
      } else if (filterType === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return paymentDate >= weekAgo;
      } else if (filterType === 'month') {
        return paymentDate.getMonth() === now.getMonth() && 
               paymentDate.getFullYear() === now.getFullYear();
      }
      return true; // 'all'
    }).sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
  };

  const filteredPayments = getFilteredPayments();

  // Calculate total received
  const totalReceived = filteredPayments.reduce((sum, payment) => sum + payment.amount, 0);

  const handleDeletePayment = (paymentId) => {
    if (window.confirm('Are you sure you want to delete this payment record?')) {
      dispatch({ type: 'DELETE_PAYMENT', payload: paymentId });
      success('Payment record deleted');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Received Payments</h2>
          <p className="text-sm text-gray-600 mt-1">
            {filteredPayments.length} payment{filteredPayments.length !== 1 ? 's' : ''} • Total: ₹{totalReceived.toLocaleString()}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Filter Dropdown */}
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-500" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>

          {/* Add Payment Button */}
          <ReceivedPaymentForm />
        </div>
      </div>

      {/* Payment List */}
      {filteredPayments.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="text-gray-400 mb-4">
            <IndianRupee size={48} className="mx-auto" />
          </div>
          <p className="text-gray-600 font-medium">No payments received yet</p>
          <p className="text-sm text-gray-500 mt-1">Click "Receive Payment" to add your first payment</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Invoice</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Notes</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPayments.map(payment => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-gray-400" />
                        {formatDate(payment.date || payment.createdAt)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {payment.customerName}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {payment.invoiceId ? (
                        <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                          Linked
                        </span>
                      ) : (
                        <span className="text-gray-400">Direct</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-green-600 text-right">
                      ₹{payment.amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                      {payment.notes || '-'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleDeletePayment(payment.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete payment"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-gray-200">
            {filteredPayments.map(payment => (
              <div key={payment.id} className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{payment.customerName}</p>
                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                      <Calendar size={14} />
                      {formatDate(payment.date || payment.createdAt)}
                    </div>
                  </div>
                  <p className="text-lg font-bold text-green-600">₹{payment.amount.toLocaleString()}</p>
                </div>
                
                {payment.notes && (
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">{payment.notes}</p>
                )}

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    payment.invoiceId 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {payment.invoiceId ? 'Invoice Linked' : 'Direct Payment'}
                  </span>
                  <button
                    onClick={() => handleDeletePayment(payment.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Delete payment"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceivedPaymentList;
