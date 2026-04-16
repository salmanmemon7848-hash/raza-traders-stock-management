import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import Button from '../common/Button';
import Input from '../common/Input';
import Modal from '../common/Modal';
import { Plus, X } from 'lucide-react';

const ReceivedPaymentForm = () => {
  const { customers, invoices, dispatch, success, error } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    customerId: '',
    customerName: '',
    invoiceId: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  // Get customer's unpaid invoices
  const getCustomerCreditInvoices = (customerId) => {
    return invoices.filter(inv => 
      inv.customer?.id === customerId && 
      (inv.isCredit || inv.paymentStatus === 'unpaid' || inv.paymentStatus === 'partial_credit')
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.customerId && !formData.customerName.trim()) {
      error('Please select a customer or enter customer name');
      return;
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      error('Please enter a valid amount');
      return;
    }

    const paymentData = {
      customerId: formData.customerId || null,
      customerName: formData.customerName || formData.customerId,
      invoiceId: formData.invoiceId || null,
      amount: parseFloat(formData.amount),
      date: formData.date,
      notes: formData.notes,
      type: 'received'
    };

    dispatch({ type: 'ADD_PAYMENT', payload: paymentData });
    success('✅ Payment received successfully!');

    // Reset form
    setFormData({
      customerId: '',
      customerName: '',
      invoiceId: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setIsOpen(false);
  };

  const handleCustomerChange = (customerId) => {
    const customer = customers.find(c => c.id === customerId);
    setFormData({
      ...formData,
      customerId,
      customerName: customer ? customer.name : '',
      invoiceId: '' // Reset invoice when customer changes
    });
  };

  const selectedCustomerInvoices = formData.customerId 
    ? getCustomerCreditInvoices(formData.customerId) 
    : [];

  return (
    <>
      {/* Open Modal Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors touch-target"
      >
        <Plus size={18} />
        <span>Receive Payment</span>
      </button>

      {/* Modal */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Receive Payment"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Customer Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Customer <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.customerId}
              onChange={(e) => handleCustomerChange(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">Select Customer (Optional)</option>
              {customers.map(customer => (
                <option key={customer.id} value={customer.id}>
                  {customer.name} {customer.phone ? `(${customer.phone})` : ''}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">Or enter name manually below</p>
          </div>

          {/* Manual Customer Name */}
          {!formData.customerId && (
            <Input
              label="Customer Name"
              type="text"
              value={formData.customerName}
              onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
              placeholder="Enter customer name"
              required
            />
          )}

          {/* Credit Invoice Selection */}
          {formData.customerId && selectedCustomerInvoices.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Link to Credit Invoice (Optional)
              </label>
              <select
                value={formData.invoiceId}
                onChange={(e) => setFormData({ ...formData, invoiceId: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Direct Payment (No Invoice Link)</option>
                {selectedCustomerInvoices.map(invoice => (
                  <option key={invoice.id} value={invoice.id}>
                    Invoice #{invoice.invoiceNumber} - Remaining: ₹{(invoice.creditAmount || 0).toLocaleString()}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Payment will automatically reduce the credit balance
              </p>
            </div>
          )}

          {/* Amount */}
          <Input
            label="Received Amount"
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            placeholder="Enter amount"
            min="0"
            step="0.01"
            required
          />

          {/* Date */}
          <Input
            label="Payment Date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add any notes about this payment..."
              rows="3"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
            >
              <Plus size={18} className="inline mr-1" />
              Receive Payment
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default ReceivedPaymentForm;
