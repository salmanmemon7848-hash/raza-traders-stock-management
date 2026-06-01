import React, { useMemo, useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import {
  Plus, Search, Edit, Trash2, Receipt as ReceiptIcon, Phone,
  MessageCircle, Wallet, Filter,
} from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';
import Modal from '../common/Modal';
import Badge from '../common/Badge';
import PageHeader from '../common/PageHeader';
import StatCard from '../common/StatCard';
import EmptyState from '../common/EmptyState';
import ConfirmDialog from '../common/ConfirmDialog';
import { Card, CardBody } from '../common/Card';
import {
  formatINR,
  calculateTotalReceiptsOutstanding,
  getReceiptOutstanding,
} from '../../utils/calculations';
import { formatDate, isToday, isThisMonth } from '../../utils/dates';
import { openWhatsApp } from '../../utils/whatsapp';

const STATUS_META = {
  pending: { label: 'Full Credit',   tone: 'danger'  },
  partial: { label: 'Partial',       tone: 'warning' },
  paid:    { label: 'Paid',          tone: 'success' },
};

const todayIso = () => new Date().toISOString().split('T')[0];

// ============== Receipt Form ==============
const ReceiptForm = ({ receipt, onSave, onCancel }) => {
  const { customers, products } = useAppContext();
  const [form, setForm] = useState({
    customerId:     receipt?.customerId || '',
    customerName:   receipt?.customerName || '',
    customerPhone:  receipt?.customerPhone || '',
    productName:    receipt?.productName || '',
    productId:      receipt?.productId || '',
    quantity:       receipt?.quantity?.toString() || '1',
    totalAmount:    receipt?.totalAmount?.toString() || '',
    amountReceived: receipt?.amountReceived?.toString() || '',
    pendingAmount:  receipt?.pendingAmount?.toString() || '',
    date:           receipt?.date ? new Date(receipt.date).toISOString().split('T')[0] : todayIso(),
    notes:          receipt?.notes || '',
  });
  const [errors, setErrors] = useState({});
  const [productSearch, setProductSearch] = useState('');
  const [showProductPicker, setShowProductPicker] = useState(false);

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })); };

  const pickCustomer = (id) => {
    const c = customers.find(x => x.id === id);
    setForm({
      ...form,
      customerId: id,
      customerName: c?.name || form.customerName,
      customerPhone: c?.phone || form.customerPhone,
    });
  };

  // Pick existing product to auto-fill name + selling price (optional)
  const pickProduct = (p) => {
    setForm({
      ...form,
      productId: p.id,
      productName: p.name,
      // Only suggest total if not set yet
      totalAmount: form.totalAmount || (p.sellingPrice * (parseInt(form.quantity, 10) || 1)).toString(),
    });
    setShowProductPicker(false);
    setProductSearch('');
  };

  const filteredProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    if (!q) return products.slice(0, 10);
    return products
      .filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.modelNumber || '').toLowerCase().includes(q))
      .slice(0, 15);
  }, [products, productSearch]);

  const submit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.customerName.trim()) errs.customerName = 'Customer name required';

    // All three amount fields are optional but at least ONE must be filled.
    const t = form.totalAmount.trim()    === '' ? null : parseFloat(form.totalAmount);
    const r = form.amountReceived.trim() === '' ? null : parseFloat(form.amountReceived);
    const p = form.pendingAmount.trim()  === '' ? null : parseFloat(form.pendingAmount);

    if (t == null && r == null && p == null) {
      errs.totalAmount = 'Fill at least one amount';
    }
    // Negative numbers don't make sense
    if (t != null && t < 0) errs.totalAmount    = 'Cannot be negative';
    if (r != null && r < 0) errs.amountReceived = 'Cannot be negative';
    if (p != null && p < 0) errs.pendingAmount  = 'Cannot be negative';
    // If all three filled, they should agree: total = received + pending
    if (t != null && r != null && p != null && Math.abs(t - (r + p)) > 0.5) {
      errs.totalAmount = `Total should equal Received + Pending (₹${(r + p).toLocaleString('en-IN')})`;
    }
    if (Object.keys(errs).length) { setErrors(errs); return; }

    onSave({
      ...(receipt || {}),
      customerId:     form.customerId || null,
      customerName:   form.customerName.trim(),
      customerPhone:  form.customerPhone.trim(),
      productName:    form.productName.trim(),
      productId:      form.productId || null,
      quantity:       parseInt(form.quantity, 10) || 1,
      totalAmount:    t,
      amountReceived: r,
      pendingAmount:  p,
      date:           form.date,
      notes:          form.notes.trim(),
    });
  };

  // Live preview using the reducer's normalization rules
  const previewT = form.totalAmount.trim()    === '' ? null : parseFloat(form.totalAmount);
  const previewR = form.amountReceived.trim() === '' ? null : parseFloat(form.amountReceived);
  const previewP = form.pendingAmount.trim()  === '' ? null : parseFloat(form.pendingAmount);

  let pTotal = previewT, pReceived = previewR, pPending = previewP;
  if (pTotal != null && pReceived != null && pPending == null) pPending  = Math.max(0, pTotal - pReceived);
  if (pTotal != null && pPending  != null && pReceived == null) pReceived = Math.max(0, pTotal - pPending);
  if (pReceived != null && pPending != null && pTotal == null) pTotal = pReceived + pPending;
  if (pTotal != null && pReceived == null && pPending == null) { pReceived = 0; pPending = pTotal; }
  if (pPending != null && pTotal == null && pReceived == null) { pReceived = 0; pTotal = pPending; }
  if (pReceived != null && pTotal == null && pPending == null) { pPending = 0; pTotal = pReceived; }

  const anyAmount = previewT != null || previewR != null || previewP != null;
  const showPreview = anyAmount && pTotal != null && pTotal > 0;

  return (
    <form onSubmit={submit} className="space-y-4">
      {/* Customer */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Select
          label="Existing customer"
          value={form.customerId}
          onChange={(e) => pickCustomer(e.target.value)}
        >
          <option value="">— New / Walk-in —</option>
          {customers.map(c => (
            <option key={c.id} value={c.id}>{c.name}{c.phone ? ` · ${c.phone}` : ''}</option>
          ))}
        </Select>
        <Input
          label="Customer name"
          required
          value={form.customerName}
          onChange={(e) => set('customerName', e.target.value)}
          error={errors.customerName}
          placeholder="e.g. Mr. Khan"
        />
        <Input
          label="Phone (WhatsApp)"
          value={form.customerPhone}
          onChange={(e) => set('customerPhone', e.target.value)}
          prefix="+91"
          placeholder="Optional"
        />
        <Input
          label="Date"
          type="date"
          value={form.date}
          onChange={(e) => set('date', e.target.value)}
        />
      </div>

      {/* Product (optional) */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 sm:p-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-slate-700">Product <span className="text-slate-400 font-normal">(optional)</span></label>
          <Button
            type="button"
            size="xs"
            variant="ghost"
            icon={<Search size={14} />}
            onClick={() => setShowProductPicker(true)}
          >
            Pick from stock
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="sm:col-span-2">
            <Input
              value={form.productName}
              onChange={(e) => set('productName', e.target.value)}
              placeholder="Type freely or pick from stock"
            />
          </div>
          <Input
            type="number"
            value={form.quantity}
            onChange={(e) => set('quantity', e.target.value)}
            placeholder="Qty"
          />
        </div>
        {form.productId && (
          <p className="text-xs text-brand-700 mt-1.5">
            🔗 Linked to stock item
            <button
              type="button"
              onClick={() => setForm({ ...form, productId: '' })}
              className="ml-2 underline"
            >
              unlink
            </button>
          </p>
        )}
      </div>

      {/* Amounts — all optional, fill any one or more */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-slate-700">Amounts <span className="text-slate-400 font-normal">(fill any one)</span></label>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="Total bill"
            type="number"
            value={form.totalAmount}
            onChange={(e) => set('totalAmount', e.target.value)}
            error={errors.totalAmount}
            prefix="₹"
            placeholder="Optional"
            hint="Full bill amount"
          />
          <Input
            label="Received today"
            type="number"
            value={form.amountReceived}
            onChange={(e) => set('amountReceived', e.target.value)}
            error={errors.amountReceived}
            prefix="₹"
            placeholder="Optional"
            hint="Cash customer paid you"
          />
          <Input
            label="Pending (Udhaar)"
            type="number"
            value={form.pendingAmount}
            onChange={(e) => set('pendingAmount', e.target.value)}
            error={errors.pendingAmount}
            prefix="₹"
            placeholder="Optional"
            hint="What they still owe"
          />
        </div>
      </div>

      {showPreview && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm space-y-1">
          <p className="text-xs font-semibold text-slate-500 uppercase mb-1">This receipt will record</p>
          <div className="flex justify-between">
            <span className="text-slate-600">Total bill</span>
            <span className="font-semibold text-slate-900 num-display">{formatINR(pTotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Received today</span>
            <span className="font-semibold text-success-700 num-display">+ {formatINR(pReceived || 0)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Pending (Udhaar)</span>
            <span className={`font-bold num-display ${(pPending || 0) > 0 ? 'text-danger-700' : 'text-slate-400'}`}>
              {formatINR(pPending || 0)}
            </span>
          </div>
        </div>
      )}

      <div>
        <label className="form-label">Notes (optional)</label>
        <textarea
          rows={2}
          value={form.notes}
          onChange={(e) => set('notes', e.target.value)}
          className="pretty-input resize-none"
          placeholder="Any extra detail you want to remember"
        />
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <Button variant="outline" type="button" onClick={onCancel}>Cancel</Button>
        <Button variant="primary" type="submit">{receipt ? 'Update receipt' : 'Save receipt'}</Button>
      </div>

      {/* Product picker modal */}
      <Modal
        isOpen={showProductPicker}
        onClose={() => setShowProductPicker(false)}
        title="Pick a product from your stock"
        size="md"
      >
        <Input
          icon={<Search size={16} />}
          placeholder="Search by name or model..."
          value={productSearch}
          onChange={(e) => setProductSearch(e.target.value)}
          autoFocus
        />
        <div className="mt-3 max-h-80 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-lg">
          {filteredProducts.length === 0 ? (
            <div className="p-4 text-center text-sm text-slate-500">No matching products.</div>
          ) : (
            filteredProducts.map(p => (
              <button
                key={p.id}
                type="button"
                onClick={() => pickProduct(p)}
                className="w-full px-3 py-2.5 flex items-center justify-between hover:bg-slate-50 text-left"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{p.name}</p>
                  <p className="text-xs text-slate-500">{p.category}{p.modelNumber ? ` · ${p.modelNumber}` : ''} · Stock {p.quantity}</p>
                </div>
                <span className="text-sm font-semibold text-slate-900 num-display">{formatINR(p.sellingPrice)}</span>
              </button>
            ))
          )}
        </div>
      </Modal>
    </form>
  );
};

// ============== Main Receipts page ==============
const Receipts = () => {
  const { receipts, dispatch, success, settings } = useAppContext();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  // Filter + sort
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return receipts
      .filter(r => {
        const matchSearch =
          !q ||
          (r.customerName || '').toLowerCase().includes(q) ||
          (r.productName || '').toLowerCase().includes(q) ||
          (r.customerPhone || '').includes(q);
        const matchStatus = !statusFilter || r.status === statusFilter;
        return matchSearch && matchStatus;
      })
      .sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
  }, [receipts, search, statusFilter]);

  // Stats
  const stats = useMemo(() => ({
    totalPending: calculateTotalReceiptsOutstanding(receipts),
    countPending: receipts.filter(r => r.status !== 'paid').length,
    countToday:   receipts.filter(r => isToday(r.date || r.createdAt)).length,
    countMonth:   receipts.filter(r => isThisMonth(r.date || r.createdAt)).length,
  }), [receipts]);

  // Save
  const save = (data) => {
    if (editing) {
      dispatch({ type: 'UPDATE_RECEIPT', payload: data });
      success('Receipt updated');
    } else {
      dispatch({ type: 'ADD_RECEIPT', payload: data });
      success('Receipt saved');
    }
    setModalOpen(false);
    setEditing(null);
  };

  const remove = () => {
    if (!deleting) return;
    dispatch({ type: 'DELETE_RECEIPT', payload: deleting.id });
    success('Receipt removed');
    setDeleting(null);
  };

  const remind = (r) => {
    if (!r.customerPhone) return;
    const pending = getReceiptOutstanding(r);
    const product = r.productName ? ` for ${r.productName}` : '';
    openWhatsApp({
      phone: r.customerPhone,
      message:
        `Hi ${r.customerName}, friendly reminder of pending amount ` +
        `${formatINR(pending)}${product} from ${settings.companyName || 'Raza Traders'}. ` +
        `Please clear at your convenience. Thank you!`,
    });
  };

  return (
    <div className="page-shell">
      <PageHeader
        title="Receipts"
        subtitle="Quick credit slips (parchi) — for customers who owe you money."
        actions={
          <Button icon={<Plus size={16} />} onClick={() => { setEditing(null); setModalOpen(true); }}>
            New receipt
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label="Outstanding"
          value={formatINR(stats.totalPending)}
          icon={Wallet}
          tone="danger"
          hint="From customers via receipts"
        />
        <StatCard label="Pending receipts" value={stats.countPending} icon={ReceiptIcon} tone="warning" />
        <StatCard label="Created Today" value={stats.countToday} tone="brand" />
        <StatCard label="This Month" value={stats.countMonth} tone="info" />
      </div>

      {/* List */}
      <Card>
        <CardBody>
          <div className="toolbar mb-4">
            <div className="flex flex-1 flex-col sm:flex-row gap-2">
              <Input
                icon={<Search size={16} />}
                placeholder="Search by customer, product, or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="sm:max-w-xs"
              />
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="sm:max-w-[160px]"
              >
                <option value="">All statuses</option>
                <option value="pending">Full credit</option>
                <option value="partial">Partial</option>
                <option value="paid">Paid</option>
              </Select>
            </div>
            <div className="text-sm text-slate-500">
              {filtered.length} of {receipts.length}
            </div>
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              icon={ReceiptIcon}
              title={receipts.length === 0 ? 'No receipts yet' : 'No matching receipts'}
              description={receipts.length === 0
                ? 'When a customer takes something on udhaar and you don\'t want to make a full invoice, log it here as a quick parchi.'
                : 'Try a different filter.'}
              action={receipts.length === 0 && (
                <Button icon={<Plus size={16} />} onClick={() => setModalOpen(true)}>New receipt</Button>
              )}
            />
          ) : (
            <>
              {/* Desktop */}
              <div className="hidden md:block">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase">Date</th>
                        <th className="text-left px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase">Customer</th>
                        <th className="text-left px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase">Product</th>
                        <th className="text-right px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase">Total</th>
                        <th className="text-right px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase">Received</th>
                        <th className="text-right px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase">Pending</th>
                        <th className="text-center px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase">Status</th>
                        <th className="text-right px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filtered.map(r => {
                        const s = STATUS_META[r.status] || STATUS_META.pending;
                        return (
                          <tr key={r.id} className="hover:bg-slate-50">
                            <td className="px-3 py-3 text-sm text-slate-700 whitespace-nowrap">
                              {formatDate(r.date || r.createdAt)}
                            </td>
                            <td className="px-3 py-3">
                              <p className="text-sm font-medium text-slate-900">{r.customerName}</p>
                              {r.customerPhone && (
                                <p className="text-xs text-slate-500 flex items-center gap-1">
                                  <Phone size={10} /> {r.customerPhone}
                                </p>
                              )}
                            </td>
                            <td className="px-3 py-3 text-sm text-slate-700">
                              {r.productName ? (
                                <span>
                                  {r.productName}
                                  {r.quantity > 1 && <span className="text-slate-400"> × {r.quantity}</span>}
                                </span>
                              ) : (
                                <span className="text-slate-400 italic">—</span>
                              )}
                            </td>
                            <td className="px-3 py-3 text-right text-sm text-slate-900 num-display">{formatINR(r.totalAmount)}</td>
                            <td className={`px-3 py-3 text-right text-sm font-semibold num-display ${
                              (r.amountReceived || 0) > 0 ? 'text-success-700' : 'text-slate-400'
                            }`}>
                              {(r.amountReceived || 0) > 0 ? formatINR(r.amountReceived) : '—'}
                            </td>
                            <td className={`px-3 py-3 text-right text-sm font-semibold num-display ${
                              r.pendingAmount > 0 ? 'text-danger-700' : 'text-slate-400'
                            }`}>
                              {r.pendingAmount > 0 ? formatINR(r.pendingAmount) : '—'}
                            </td>
                            <td className="px-3 py-3 text-center">
                              <Badge variant={s.tone}>{s.label}</Badge>
                            </td>
                            <td className="px-3 py-3 text-right">
                              <div className="inline-flex gap-1">
                                {r.customerPhone && r.pendingAmount > 0 && (
                                  <button
                                    onClick={() => remind(r)}
                                    className="p-1.5 rounded-md text-slate-500 hover:text-success-600 hover:bg-success-50"
                                    aria-label="WhatsApp reminder"
                                    title="Send WhatsApp reminder"
                                  ><MessageCircle size={15} /></button>
                                )}
                                <button
                                  onClick={() => { setEditing(r); setModalOpen(true); }}
                                  className="p-1.5 rounded-md text-slate-500 hover:text-brand-700 hover:bg-brand-50"
                                  aria-label="Edit"
                                ><Edit size={15} /></button>
                                <button
                                  onClick={() => setDeleting(r)}
                                  className="p-1.5 rounded-md text-slate-500 hover:text-danger-600 hover:bg-danger-50"
                                  aria-label="Delete"
                                ><Trash2 size={15} /></button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile */}
              <div className="md:hidden space-y-2.5">
                {filtered.map(r => {
                  const s = STATUS_META[r.status] || STATUS_META.pending;
                  return (
                    <div key={r.id} className="border border-slate-200 rounded-xl p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate">{r.customerName}</p>
                          {r.productName && (
                            <p className="text-xs text-slate-600 truncate mt-0.5">
                              {r.productName}{r.quantity > 1 && ` × ${r.quantity}`}
                            </p>
                          )}
                          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                            <Badge variant={s.tone}>{s.label}</Badge>
                            <span className="text-xs text-slate-500">{formatDate(r.date || r.createdAt)}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-slate-900 num-display">{formatINR(r.totalAmount)}</p>
                          {r.pendingAmount > 0 && (
                            <p className="text-xs font-semibold text-danger-700 num-display">
                              {formatINR(r.pendingAmount)} pending
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-end gap-1 mt-2 pt-2 border-t border-slate-100">
                        {r.customerPhone && r.pendingAmount > 0 && (
                          <Button size="xs" variant="ghost" icon={<MessageCircle size={14} />} onClick={() => remind(r)}>Remind</Button>
                        )}
                        <Button size="xs" variant="ghost" icon={<Edit size={14} />} onClick={() => { setEditing(r); setModalOpen(true); }}>Edit</Button>
                        <Button size="xs" variant="ghost" icon={<Trash2 size={14} />} onClick={() => setDeleting(r)} className="text-danger-600">Delete</Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </CardBody>
      </Card>

      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        title={editing ? 'Edit receipt' : 'New receipt'}
        subtitle={editing ? null : 'Quick udhaar slip — customer name + amount is all that\'s required'}
        size="lg"
      >
        <ReceiptForm
          receipt={editing}
          onSave={save}
          onCancel={() => { setModalOpen(false); setEditing(null); }}
        />
      </Modal>

      <ConfirmDialog
        isOpen={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={remove}
        title={`Delete receipt for "${deleting?.customerName}"?`}
        message="This permanently removes the receipt. Linked payments stay but lose their connection."
        confirmLabel="Delete"
      />
    </div>
  );
};

export default Receipts;
