import React, { useMemo, useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { Filter, Trash2, Wallet } from 'lucide-react';
import Select from '../common/Select';
import Badge from '../common/Badge';
import Button from '../common/Button';
import EmptyState from '../common/EmptyState';
import ConfirmDialog from '../common/ConfirmDialog';
import { Card, CardHeader, CardBody } from '../common/Card';
import { formatINR } from '../../utils/calculations';
import { formatDate, isToday, isThisMonth } from '../../utils/dates';
import ReceivedPaymentForm from './ReceivedPaymentForm';

const ReceivedPaymentList = () => {
  const { payments, dispatch, success } = useAppContext();
  const [filter, setFilter] = useState('all');
  const [deleting, setDeleting] = useState(null);

  const filtered = useMemo(() => {
    const sorted = [...payments].sort(
      (a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt)
    );
    if (filter === 'today') return sorted.filter(p => isToday(p.date || p.createdAt));
    if (filter === 'month') return sorted.filter(p => isThisMonth(p.date || p.createdAt));
    if (filter === 'week') {
      const weekAgo = Date.now() - 7 * 86400000;
      return sorted.filter(p => new Date(p.date || p.createdAt).getTime() >= weekAgo);
    }
    return sorted;
  }, [payments, filter]);

  const total = filtered.reduce((s, p) => s + p.amount, 0);

  const remove = () => {
    if (!deleting) return;
    dispatch({ type: 'DELETE_PAYMENT', payload: deleting.id });
    success('Payment removed (any linked invoice has been restored)');
    setDeleting(null);
  };

  return (
    <Card>
      <CardHeader
        title="Received Payments"
        subtitle={`${filtered.length} payments · ${formatINR(total)} total`}
        icon={<Wallet size={18} />}
        actions={
          <div className="flex items-center gap-2">
            <Select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-32"
            >
              <option value="all">All time</option>
              <option value="today">Today</option>
              <option value="week">7 days</option>
              <option value="month">This month</option>
            </Select>
            <ReceivedPaymentForm />
          </div>
        }
      />
      <CardBody>
        {filtered.length === 0 ? (
          <EmptyState
            icon={Wallet}
            title="No payments to show"
            description={filter !== 'all' ? 'Try a wider date range' : 'Click "Receive Payment" to record your first cash inflow.'}
          />
        ) : (
          <ul className="divide-y divide-slate-100 -my-2">
            {filtered.map(p => (
              <li key={p.id} className="py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{p.customerName}</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-xs text-slate-500">{formatDate(p.date || p.createdAt)}</span>
                    {p.invoiceId ? (
                      <Badge variant="info">Linked to bill</Badge>
                    ) : (
                      <Badge variant="neutral">Direct</Badge>
                    )}
                    {p.notes && <span className="text-xs text-slate-500 truncate">· {p.notes}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <p className="text-sm font-semibold text-success-700 num-display">+ {formatINR(p.amount)}</p>
                  <Button
                    size="xs"
                    variant="ghost"
                    icon={<Trash2 size={14} />}
                    onClick={() => setDeleting(p)}
                    className="text-danger-600"
                    aria-label="Delete payment"
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
        <ConfirmDialog
          isOpen={!!deleting}
          onClose={() => setDeleting(null)}
          onConfirm={remove}
          title="Delete this payment?"
          message="Any linked invoice's outstanding amount will be restored automatically."
          confirmLabel="Delete"
        />
      </CardBody>
    </Card>
  );
};

export default ReceivedPaymentList;
