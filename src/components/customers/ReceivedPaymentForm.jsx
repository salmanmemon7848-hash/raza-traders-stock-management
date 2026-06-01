import React, { useMemo, useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { Plus, Wallet } from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';
import Modal from '../common/Modal';
import {
  formatINR,
  getInvoiceOutstanding,
  getReceiptOutstanding,
} from '../../utils/calculations';

const today = () => new Date().toISOString().split('T')[0];

const ReceivedPaymentForm = () => {
  const { customers, invoices, receipts, dispatch, success, error } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({
    customerId: '',
    customerName: '',
    applyTo: '',  // value format: "invoice:<id>" or "receipt:<id>"
    amount: '',
    date: today(),
    notes: '',
  });

  // Open dues for the selected customer — both invoices and receipts
  const openDues = useMemo(() => {
    if (!form.customerId) return { invoices: [], receipts: [] };
    return {
      invoices: invoices.filter(inv => inv.customer?.id === form.customerId && getInvoiceOutstanding(inv) > 0),
      receipts: receipts.filter(r => r.customerId === form.customerId && getReceiptOutstanding(r) > 0),
    };
  }, [form.customerId, invoices, receipts]);

  const onChangeCustomer = (id) => {
    const c = customers.find(c => c.id === id);
    setForm({ ...form, customerId: id, customerName: c?.name || '', applyTo: '' });
  };

  const submit = (e) => {
    e.preventDefault();
    if (!form.customerName.trim() && !form.customerId) {
      error('Please pick or enter a customer name');
      return;
    }
    if (!form.amount || parseFloat(form.amount) <= 0) {
      error('Enter a valid amount');
      return;
    }

    let invoiceId = null;
    let receiptId = null;
    if (form.applyTo.startsWith('invoice:')) invoiceId = form.applyTo.slice(8);
    if (form.applyTo.startsWith('receipt:')) receiptId = form.applyTo.slice(8);

    dispatch({
      type: 'ADD_PAYMENT',
      payload: {
        customerId: form.customerId || null,
        customerName: form.customerName,
        invoiceId,
        receiptId,
        amount: parseFloat(form.amount),
        date: form.date,
        notes: form.notes,
        type: 'received',
      },
    });
    success('Payment recorded');
    setIsOpen(false);
    setForm({ customerId: '', customerName: '', applyTo: '', amount: '', date: today(), notes: '' });
  };

  const hasOpenDues = openDues.invoices.length > 0 || openDues.receipts.length > 0;

  return (
    <>
      <Button icon={<Plus size={16} />} variant="success" onClick={() => setIsOpen(true)}>
        Receive Payment
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Record received payment"
        subtitle="Track cash inflows and link them to open dues"
        size="md"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button variant="success" icon={<Wallet size={16} />} onClick={submit}>Save payment</Button>
          </div>
        }
      >
        <form onSubmit={submit} className="space-y-4">
          <Select
            label="Customer"
            value={form.customerId}
            onChange={(e) => onChangeCustomer(e.target.value)}
          >
            <option value="">— Walk-in / Manual entry —</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>{c.name}{c.phone ? ` · ${c.phone}` : ''}</option>
            ))}
          </Select>

          {!form.customerId && (
            <Input
              label="Customer name"
              value={form.customerName}
              onChange={(e) => setForm({ ...form, customerName: e.target.value })}
              placeholder="Enter name"
              required
            />
          )}

          {hasOpenDues && (
            <Select
              label="Apply to"
              hint="Auto-reduces the outstanding amount on the chosen item"
              value={form.applyTo}
              onChange={(e) => setForm({ ...form, applyTo: e.target.value })}
            >
              <option value="">Direct payment (not linked)</option>
              {openDues.invoices.length > 0 && (
                <optgroup label="🧾 Invoices">
                  {openDues.invoices.map(inv => (
                    <option key={inv.id} value={`invoice:${inv.id}`}>
                      {inv.invoiceNumber} — Outstanding {formatINR(getInvoiceOutstanding(inv))}
                    </option>
                  ))}
                </optgroup>
              )}
              {openDues.receipts.length > 0 && (
                <optgroup label="📜 Receipts (parchi)">
                  {openDues.receipts.map(r => (
                    <option key={r.id} value={`receipt:${r.id}`}>
                      {(r.productName || 'Receipt')} — Outstanding {formatINR(getReceiptOutstanding(r))}
                    </option>
                  ))}
                </optgroup>
              )}
            </Select>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Amount"
              type="number"
              required
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              prefix="₹"
              placeholder="0"
            />
            <Input
              label="Date"
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </div>

          <div>
            <label className="form-label">Notes (optional)</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
              className="pretty-input resize-none"
              placeholder="e.g. UPI transaction id, cheque #"
            />
          </div>
        </form>
      </Modal>
    </>
  );
};

export default ReceivedPaymentForm;
