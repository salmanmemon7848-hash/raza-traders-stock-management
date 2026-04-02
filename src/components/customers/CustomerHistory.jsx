import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';

const CustomerHistory = ({ customer, onClose }) => {
  if (!customer) return null;

  return (
    <Modal
      isOpen={!!customer}
      onClose={onClose}
      title={`Purchase History - ${customer.name}`}
      size="lg"
    >
      <div className="space-y-6">
        {/* Customer Info */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Phone</p>
              <p className="font-semibold">{customer.phone || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Address</p>
              <p className="font-semibold">{customer.address || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Spent</p>
              <p className="font-bold text-green-600">Rs. {customer.totalSpent.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Customer Since</p>
              <p className="font-semibold">
                {new Date(customer.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Purchase History */}
        <div>
          <h4 className="font-bold text-gray-900 mb-3">Purchase History</h4>
          
          {customer.purchaseHistory && customer.purchaseHistory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                      Invoice #
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {customer.purchaseHistory.map((purchase, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 text-sm font-semibold">
                        {purchase.invoiceId}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {new Date(purchase.date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-green-600">
                        Rs. {purchase.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No purchase history available</p>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CustomerHistory;
