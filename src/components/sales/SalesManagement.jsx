import React, { useMemo, useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import {
  Search,
  Edit,
  Trash2,
  FileText,
  IndianRupee,
  Tag,
  X,
  CheckCircle,
} from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';
import Badge from '../common/Badge';
import EmptyState from '../common/EmptyState';
import ConfirmDialog from '../common/ConfirmDialog';
import Modal from '../common/Modal';
import PageHeader from '../common/PageHeader';
import { Card, CardBody, CardHeader } from '../common/Card';
import { formatINR, getInvoiceOutstanding } from '../../utils/calculations';
import { formatDate } from '../../utils/dates';

const STATUS_CONFIG = {
  paid:           { label: 'Paid',         variant: 'success' },
  partial_credit: { label: 'Partial Due',  variant: 'warning' },
  full_credit:    { label: 'Full Credit',  variant: 'danger'  },
};

// ---- Edit modal: set purchase price on items + view sale details ----
const EditSaleModal = ({ sale, products, onClose, onSave }) => {
  const [prices, setPrices] = useState(() => {
    const init = {};
    (sale.items || []).forEach((item) => {
      const product = products.find((p) => p.id === item.productId);
      init[item.productId] = product?.purchasePrice ? String(product.purchasePrice) : '';
    });
    return init;
  });

  const handleSave = () => {
    onSave(prices);
    onClose();
  };

  const allSet = (sale.items || []).every(
    (item) => prices[item.productId] && parseFloat(prices[item.productId]) > 0
  );

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={`Sale — ${sale.invoiceNumber}`}
      subtitle={`${sale.customer?.name || sale.customerName || 'Walk-in'} · ${formatDate(sale.createdAt)}`}
      size="md"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            variant="primary"
            icon={<CheckCircle size={15} />}
            onClick={handleSave}
          >
            Save purchase prices
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Sale summary */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-xs text-slate-500 mb-1">Revenue</p>
            <p className="text-sm font-bold text-slate-900 num-display">{formatINR(sale.grandTotal)}</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-xs text-slate-500 mb-1">Status</p>
            <p className="text-sm font-semibold text-slate-700">
              {STATUS_CONFIG[sale.paymentStatus]?.label || 'Paid'}
            </p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-xs text-slate-500 mb-1">Outstanding</p>
            <p className="text-sm font-bold text-danger-700 num-display">{formatINR(getInvoiceOutstanding(sale))}</p>
          </div>
        </div>

        {/* Items + purchase price inputs */}
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <Tag size={12} /> Set purchase price per item
          </p>
          <div className="space-y-2">
            {(sale.items || []).map((item, idx) => {
              const product = products.find((p) => p.id === item.productId);
              const hasPrice = product?.purchasePrice > 0;
              return (
                <div
                  key={item.productId || idx}
                  className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 bg-white"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{item.name}</p>
                    <p className="text-xs text-slate-500">
                      {item.quantity} × {formatINR(item.price)} = {formatINR(item.total)}
                    </p>
                  </div>
                  <div className="w-32 shrink-0">
                    <Input
                      type="number"
                      prefix="₹"
                      placeholder="Cost"
                      value={prices[item.productId] || ''}
                      onChange={(e) =>
                        setPrices({ ...prices, [item.productId]: e.target.value })
                      }
                    />
                  </div>
                  {hasPrice && !prices[item.productId] && (
                    <span className="text-xs text-success-600 whitespace-nowrap">
                      Already set
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          {!allSet && (
            <p className="text-xs text-warning-600 mt-2">
                Items without a purchase price will show Rs. 0 profit.
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
};

// ---- Main page ----
const SalesManagement = () => {
  const { invoices, products, dispatch, success } = useAppContext();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return [...invoices]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .filter((inv) => {
        const customerName = (inv.customer?.name || inv.customerName || '').toLowerCase();
        const matchSearch = !q || customerName.includes(q) || (inv.invoiceNumber || '').toLowerCase().includes(q);
        const matchStatus = !statusFilter || inv.paymentStatus === statusFilter;
        return matchSearch && matchStatus;
      });
  }, [invoices, search, statusFilter]);

  const totalRevenue = filtered.reduce((s, inv) => s + (inv.grandTotal || 0), 0);

  const handleSavePurchasePrices = (prices) => {
    Object.entries(prices).forEach(([productId, priceStr]) => {
      const price = parseFloat(priceStr);
      if (productId && price > 0) {
        dispatch({
          type: 'UPDATE_PRODUCT',
          payload: { id: productId, purchasePrice: price },
        });
      }
    });
    success('Purchase prices updated');
  };

  const handleDelete = () => {
    if (!deleting) return;
    dispatch({ type: 'DELETE_INVOICE', payload: deleting.id });
    success('Sale deleted');
    setDeleting(null);
  };

  return (
    <div className="page-shell">
      <PageHeader
        title="Sales"
        subtitle="View, manage and track all your sales records."
        icon={<FileText size={22} />}
      />

      <Card>
        <CardHeader
          title="All Sales"
          subtitle={`${filtered.length} sales · ${formatINR(totalRevenue)} revenue`}
          icon={<IndianRupee size={18} />}
        />
        <CardBody>
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <Input
              icon={<Search size={16} />}
              placeholder="Search by customer or invoice #..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pretty-input sm:w-40"
            >
              <option value="">All statuses</option>
              <option value="paid">Paid</option>
              <option value="partial_credit">Partial Due</option>
              <option value="full_credit">Full Credit</option>
            </select>
            {(search || statusFilter) && (
              <Button
                variant="ghost"
                icon={<X size={15} />}
                onClick={() => { setSearch(''); setStatusFilter(''); }}
              >
                Clear
              </Button>
            )}
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No sales found"
              description={invoices.length === 0 ? 'Create your first bill to see it here.' : 'Try a different search.'}
            />
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase">Date</th>
                      <th className="text-left px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase">Invoice</th>
                      <th className="text-left px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase">Customer</th>
                      <th className="text-left px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase">Items</th>
                      <th className="text-left px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase">Status</th>
                      <th className="text-right px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase">Amount</th>
                      <th className="text-right px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase">Outstanding</th>
                      <th className="text-right px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtered.map((inv) => {
                      const status = STATUS_CONFIG[inv.paymentStatus] || STATUS_CONFIG.paid;
                      const outstanding = getInvoiceOutstanding(inv);
                      const noPriceItems = (inv.items || []).filter((item) => {
                        const p = products.find((pr) => pr.id === item.productId);
                        return !p?.purchasePrice;
                      });
                      return (
                        <tr key={inv.id} className="hover:bg-slate-50">
                          <td className="px-3 py-3 text-sm text-slate-500 whitespace-nowrap">{formatDate(inv.createdAt)}</td>
                          <td className="px-3 py-3 text-sm font-medium text-slate-900">{inv.invoiceNumber}</td>
                          <td className="px-3 py-3 text-sm text-slate-700">{inv.customer?.name || inv.customerName || 'Walk-in'}</td>
                          <td className="px-3 py-3 text-sm text-slate-500">
                            {(inv.items || []).length} item{(inv.items || []).length !== 1 ? 's' : ''}
                            {noPriceItems.length > 0 && (
                              <span className="ml-1.5 text-warning-600 text-xs">· {noPriceItems.length} no cost</span>
                            )}
                          </td>
                          <td className="px-3 py-3">
                            <Badge variant={status.variant}>{status.label}</Badge>
                          </td>
                          <td className="px-3 py-3 text-right text-sm font-semibold text-slate-900 num-display">{formatINR(inv.grandTotal)}</td>
                          <td className="px-3 py-3 text-right text-sm font-semibold num-display">
                            {outstanding > 0 ? (
                              <span className="text-danger-700">{formatINR(outstanding)}</span>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>
                          <td className="px-3 py-3 text-right">
                            <div className="inline-flex gap-1">
                              <button
                                onClick={() => setEditing(inv)}
                                className="p-1.5 rounded-md text-slate-500 hover:text-brand-700 hover:bg-brand-50"
                                title="Edit / set purchase price"
                              >
                                <Edit size={15} />
                              </button>
                              <button
                                onClick={() => setDeleting(inv)}
                                className="p-1.5 rounded-md text-slate-500 hover:text-danger-600 hover:bg-danger-50"
                                title="Delete sale"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-slate-200">
                      <td colSpan={5} className="px-3 py-2.5 text-sm text-right text-slate-500 font-medium">Total revenue</td>
                      <td className="px-3 py-2.5 text-right text-sm font-bold text-slate-900 num-display">{formatINR(totalRevenue)}</td>
                      <td colSpan={2} />
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden space-y-2">
                {filtered.map((inv) => {
                  const status = STATUS_CONFIG[inv.paymentStatus] || STATUS_CONFIG.paid;
                  const outstanding = getInvoiceOutstanding(inv);
                  const noPriceItems = (inv.items || []).filter((item) => {
                    const p = products.find((pr) => pr.id === item.productId);
                    return !p?.purchasePrice;
                  });
                  return (
                    <div key={inv.id} className="border border-slate-200 rounded-xl p-3">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-900">{inv.customer?.name || inv.customerName || 'Walk-in'}</p>
                          <p className="text-xs text-slate-500">{inv.invoiceNumber} · {formatDate(inv.createdAt)}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-bold text-slate-900 num-display">{formatINR(inv.grandTotal)}</p>
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </div>
                      </div>
                      {(noPriceItems.length > 0 || outstanding > 0) && (
                        <div className="flex flex-wrap gap-2 mb-2">
                          {outstanding > 0 && (
                            <span className="text-xs text-danger-600 font-medium">Due: {formatINR(outstanding)}</span>
                          )}
                          {noPriceItems.length > 0 && (
                            <span className="text-xs text-warning-600">{noPriceItems.length} item(s) missing purchase price</span>
                          )}
                        </div>
                      )}
                      <div className="flex justify-end gap-1 pt-2 border-t border-slate-100">
                        <Button size="xs" variant="ghost" icon={<Edit size={14} />} onClick={() => setEditing(inv)}>
                          Edit
                        </Button>
                        <Button size="xs" variant="ghost" icon={<Trash2 size={14} />} onClick={() => setDeleting(inv)} className="text-danger-600">
                          Delete
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </CardBody>
      </Card>

      {editing && (
        <EditSaleModal
          sale={editing}
          products={products}
          onClose={() => setEditing(null)}
          onSave={handleSavePurchasePrices}
        />
      )}

      <ConfirmDialog
        isOpen={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="Delete this sale?"
        message={`Invoice ${deleting?.invoiceNumber} will be permanently removed. Stock will NOT be restored automatically.`}
        confirmLabel="Delete"
      />
    </div>
  );
};

export default SalesManagement;
