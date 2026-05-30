import React, { useMemo, useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import {
  Plus, Search, Filter, MessageCircle, CheckCircle2, Trash2, Edit,
  Clock, ClipboardList,
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
import { formatDate, formatRelative } from '../../utils/dates';
import { openWhatsApp, buildProductReadyMessage } from '../../utils/whatsapp';

const STATUS_META = {
  pending:  { label: 'Pending',   tone: 'warning' },
  arranged: { label: 'Arranged',  tone: 'info' },
  notified: { label: 'Notified',  tone: 'brand' },
  closed:   { label: 'Closed',    tone: 'success' },
};

const RequestForm = ({ request, onSave, onCancel }) => {
  const { customers } = useAppContext();
  const [form, setForm] = useState({
    customerName: request?.customerName || '',
    customerPhone: request?.customerPhone || '',
    customerId: request?.customerId || '',
    productName: request?.productName || '',
    category: request?.category || '',
    quantity: request?.quantity?.toString() || '1',
    expectedPrice: request?.expectedPrice?.toString() || '',
    notes: request?.notes || '',
    status: request?.status || 'pending',
  });
  const [errors, setErrors] = useState({});

  const set = (k, v) => { setForm({ ...form, [k]: v }); setErrors(p => ({ ...p, [k]: '' })); };

  const pickCustomer = (id) => {
    const c = customers.find(x => x.id === id);
    setForm({
      ...form,
      customerId: id,
      customerName: c?.name || form.customerName,
      customerPhone: c?.phone || form.customerPhone,
    });
  };

  const submit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.customerName.trim()) errs.customerName = 'Required';
    if (!form.productName.trim()) errs.productName = 'Required';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    onSave({
      ...(request || {}),
      customerId: form.customerId || null,
      customerName: form.customerName.trim(),
      customerPhone: form.customerPhone.trim(),
      productName: form.productName.trim(),
      category: form.category.trim(),
      quantity: parseInt(form.quantity, 10) || 1,
      expectedPrice: parseFloat(form.expectedPrice) || 0,
      notes: form.notes.trim(),
      status: form.status,
    });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Select
          label="Customer"
          value={form.customerId}
          onChange={(e) => pickCustomer(e.target.value)}
        >
          <option value="">— Enter manually —</option>
          {customers.map(c => <option key={c.id} value={c.id}>{c.name}{c.phone ? ` · ${c.phone}` : ''}</option>)}
        </Select>
        <Input
          label="Customer name"
          required
          value={form.customerName}
          onChange={(e) => set('customerName', e.target.value)}
          error={errors.customerName}
        />
        <Input
          label="Phone (WhatsApp)"
          value={form.customerPhone}
          onChange={(e) => set('customerPhone', e.target.value)}
          prefix="+91"
          hint="Used to notify them when the product arrives"
        />
        <Input
          label="Category"
          value={form.category}
          onChange={(e) => set('category', e.target.value)}
          placeholder="e.g. Furniture, Electronics"
        />
      </div>

      <Input
        label="Product they asked for"
        required
        value={form.productName}
        onChange={(e) => set('productName', e.target.value)}
        error={errors.productName}
        placeholder="e.g. Samsung Smart TV 50 inch"
      />

      <div className="grid grid-cols-2 gap-3">
        <Input label="Quantity" type="number" value={form.quantity} onChange={(e) => set('quantity', e.target.value)} />
        <Input label="Expected price (optional)" type="number" prefix="₹" value={form.expectedPrice} onChange={(e) => set('expectedPrice', e.target.value)} />
      </div>

      <div>
        <label className="form-label">Notes</label>
        <textarea
          rows={2}
          value={form.notes}
          onChange={(e) => set('notes', e.target.value)}
          className="pretty-input resize-none"
          placeholder="Color, model number, special requirement..."
        />
      </div>

      <Select label="Status" value={form.status} onChange={(e) => set('status', e.target.value)}>
        {Object.entries(STATUS_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
      </Select>

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" type="button" onClick={onCancel}>Cancel</Button>
        <Button variant="primary" type="submit">{request ? 'Update' : 'Save request'}</Button>
      </div>
    </form>
  );
};

const ProductRequests = () => {
  const { productRequests, dispatch, settings, success } = useAppContext();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return productRequests
      .filter(r => {
        const matchSearch =
          !q ||
          r.customerName.toLowerCase().includes(q) ||
          r.productName.toLowerCase().includes(q) ||
          (r.customerPhone || '').includes(q);
        const matchStatus = !statusFilter || r.status === statusFilter;
        return matchSearch && matchStatus;
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [productRequests, search, statusFilter]);

  const pendingCount = productRequests.filter(r => r.status === 'pending').length;
  const arrangedCount = productRequests.filter(r => r.status === 'arranged').length;

  const save = (data) => {
    if (editing) {
      dispatch({ type: 'UPDATE_PRODUCT_REQUEST', payload: data });
      success('Request updated');
    } else {
      dispatch({ type: 'ADD_PRODUCT_REQUEST', payload: data });
      success('Request logged');
    }
    setModalOpen(false);
    setEditing(null);
  };

  const setStatus = (req, status) => {
    dispatch({ type: 'UPDATE_PRODUCT_REQUEST', payload: { ...req, status } });
    success(`Marked as ${STATUS_META[status].label}`);
  };

  const notify = (req) => {
    if (!req.customerPhone) return;
    openWhatsApp({
      phone: req.customerPhone,
      message: buildProductReadyMessage({ request: req, settings }),
    });
    setStatus(req, 'notified');
  };

  const remove = () => {
    if (!deleting) return;
    dispatch({ type: 'DELETE_PRODUCT_REQUEST', payload: deleting.id });
    success('Request removed');
    setDeleting(null);
  };

  return (
    <div className="page-shell">
      <PageHeader
        title="Product Requests"
        subtitle="Customers asked for these products. Log them now, follow up when stock arrives."
        actions={
          <Button icon={<Plus size={16} />} onClick={() => { setEditing(null); setModalOpen(true); }}>
            Log a request
          </Button>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Pending" value={pendingCount} icon={Clock} tone="warning" />
        <StatCard label="Arranged" value={arrangedCount} icon={CheckCircle2} tone="info" />
        <StatCard label="Total" value={productRequests.length} icon={ClipboardList} tone="brand" />
        <StatCard label="Closed" value={productRequests.filter(r => r.status === 'closed').length} icon={CheckCircle2} tone="success" />
      </div>

      <Card>
        <CardBody>
          <div className="toolbar mb-4">
            <div className="flex flex-1 flex-col sm:flex-row gap-2">
              <Input
                icon={<Search size={16} />}
                placeholder="Search customer or product..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="sm:max-w-xs"
              />
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="sm:max-w-[180px]"
              >
                <option value="">All statuses</option>
                {Object.entries(STATUS_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </Select>
            </div>
            <div className="text-sm text-slate-500">
              {filtered.length} of {productRequests.length}
            </div>
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title={productRequests.length === 0 ? 'No requests yet' : 'No matches'}
              description={productRequests.length === 0
                ? 'When a customer asks for a product you don\'t have, log it here. You\'ll get reminded to follow up.'
                : 'Try a different filter.'}
              action={productRequests.length === 0 && (
                <Button icon={<Plus size={16} />} onClick={() => setModalOpen(true)}>Log a request</Button>
              )}
            />
          ) : (
            <ul className="space-y-2.5">
              {filtered.map(r => {
                const status = STATUS_META[r.status] || STATUS_META.pending;
                return (
                  <li key={r.id} className="border border-slate-200 rounded-xl p-3 sm:p-4">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-slate-900 truncate">{r.productName}</p>
                          <Badge variant={status.tone}>{status.label}</Badge>
                          {r.quantity > 1 && <Badge variant="neutral">×{r.quantity}</Badge>}
                        </div>
                        <p className="text-sm text-slate-600 mt-1">
                          Asked by <span className="font-medium text-slate-900">{r.customerName}</span>
                          {r.customerPhone && ` · ${r.customerPhone}`}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Logged {formatRelative(r.createdAt)} · {formatDate(r.createdAt)}
                        </p>
                        {r.notes && <p className="text-xs text-slate-600 mt-2 italic">"{r.notes}"</p>}
                      </div>
                      <div className="flex flex-wrap items-center gap-1 sm:justify-end shrink-0">
                        {r.status === 'pending' && (
                          <Button size="xs" variant="outline" icon={<CheckCircle2 size={14} />} onClick={() => setStatus(r, 'arranged')}>
                            Arranged
                          </Button>
                        )}
                        {r.status === 'arranged' && r.customerPhone && (
                          <Button size="xs" variant="success" icon={<MessageCircle size={14} />} onClick={() => notify(r)}>
                            Notify
                          </Button>
                        )}
                        {(r.status === 'notified' || r.status === 'arranged') && (
                          <Button size="xs" variant="ghost" onClick={() => setStatus(r, 'closed')}>
                            Close
                          </Button>
                        )}
                        <Button size="xs" variant="ghost" icon={<Edit size={14} />} onClick={() => { setEditing(r); setModalOpen(true); }} aria-label="Edit" />
                        <Button size="xs" variant="ghost" icon={<Trash2 size={14} />} onClick={() => setDeleting(r)} className="text-danger-600" aria-label="Delete" />
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardBody>
      </Card>

      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        title={editing ? 'Edit request' : 'Log product request'}
        subtitle={editing ? null : 'Quick note about what a customer asked for'}
        size="md"
      >
        <RequestForm
          request={editing}
          onSave={save}
          onCancel={() => { setModalOpen(false); setEditing(null); }}
        />
      </Modal>

      <ConfirmDialog
        isOpen={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={remove}
        title="Delete this request?"
        confirmLabel="Delete"
      />
    </div>
  );
};

export default ProductRequests;
