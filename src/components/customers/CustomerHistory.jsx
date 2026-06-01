import React from 'react';
import { useAppContext } from '../../contexts/AppContext';
import Modal from '../common/Modal';
import Badge from '../common/Badge';
import EmptyState from '../common/EmptyState';
import { formatINR, getInvoiceOutstanding } from '../../utils/calculations';
import { formatDate } from '../../utils/dates';
import { Receipt } from 'lucide-react';

const CustomerHistory = ({ customer, onClose }) => {
  const { invoices, payments } = useAppContext();
  if (!customer) return null;

  const customerInvoices = invoices
    .filter(inv => inv.customer?.id === customer.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const customerPayments = payments
    .filter(p => p.customerId === customer.id)
    .sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));

  const totalOutstanding = customerInvoices.reduce((s, inv) => s + getInvoiceOutstanding(inv), 0);

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={customer.name}
      subtitle={customer.phone || 'No phone'}
      size="lg"
    >
      <div className="space-y-5">
        {/* Snapshot */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="card p-3">
            <p className="text-xs text-slate-500">Total Spent</p>
            <p className="text-lg font-bold text-slate-900 num-display">{formatINR(customer.totalSpent || 0)}</p>
          </div>
          <div className="card p-3">
            <p className="text-xs text-slate-500">Outstanding</p>
            <p className={`text-lg font-bold num-display ${totalOutstanding > 0 ? 'text-danger-700' : 'text-success-700'}`}>
              {formatINR(totalOutstanding)}
            </p>
          </div>
          <div className="card p-3">
            <p className="text-xs text-slate-500">Bills</p>
            <p className="text-lg font-bold text-slate-900 num-display">{customerInvoices.length}</p>
          </div>
          <div className="card p-3">
            <p className="text-xs text-slate-500">Since</p>
            <p className="text-sm font-semibold text-slate-700">{formatDate(customer.createdAt)}</p>
          </div>
        </div>

        {customer.address && (
          <div className="text-sm">
            <span className="text-slate-500">Address: </span>
            <span className="text-slate-900">{customer.address}</span>
          </div>
        )}

        {/* Invoices */}
        <div>
          <h4 className="text-sm font-semibold text-slate-900 mb-2">Bills</h4>
          {customerInvoices.length === 0 ? (
            <EmptyState icon={Receipt} title="No bills yet" />
          ) : (
            <ul className="divide-y divide-slate-100 border border-slate-200 rounded-xl">
              {customerInvoices.map(inv => {
                const outstanding = getInvoiceOutstanding(inv);
                return (
                  <li key={inv.id} className="p-3 flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{inv.invoiceNumber}</p>
                      <p className="text-xs text-slate-500">{formatDate(inv.createdAt)} · {inv.items?.length || 0} items</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-900 num-display">{formatINR(inv.grandTotal)}</p>
                      {outstanding > 0 ? (
                        <Badge variant="warning">{formatINR(outstanding)} due</Badge>
                      ) : (
                        <Badge variant="success">Paid</Badge>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Payments */}
        {customerPayments.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-2">Payments received</h4>
            <ul className="divide-y divide-slate-100 border border-slate-200 rounded-xl">
              {customerPayments.map(p => (
                <li key={p.id} className="p-3 flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm text-slate-700">{formatDate(p.date || p.createdAt)}</p>
                    {p.notes && <p className="text-xs text-slate-500">{p.notes}</p>}
                  </div>
                  <p className="text-sm font-semibold text-success-700 num-display">+ {formatINR(p.amount)}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default CustomerHistory;
