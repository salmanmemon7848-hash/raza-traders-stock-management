import React from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { Card, CardHeader, CardBody } from '../common/Card';
import EmptyState from '../common/EmptyState';
import Badge from '../common/Badge';
import { Receipt } from 'lucide-react';
import { formatINR, getInvoiceOutstanding } from '../../utils/calculations';
import { formatRelative } from '../../utils/dates';

const RecentTransactions = () => {
  const { invoices } = useAppContext();
  const recent = [...invoices]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 6);

  return (
    <Card>
      <CardHeader title="Recent Bills" subtitle="Latest transactions" icon={<Receipt size={18} />} />
      <CardBody>
        {recent.length === 0 ? (
          <EmptyState title="No bills yet" description="Your latest sales will appear here." />
        ) : (
          <div className="divide-y divide-slate-100 -my-3">
            {recent.map(inv => {
              const outstanding = getInvoiceOutstanding(inv);
              return (
                <div key={inv.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900 truncate">{inv.invoiceNumber}</p>
                      {outstanding > 0 ? (
                        <Badge variant="warning">{inv.paymentStatus === 'partial_credit' ? 'Partial' : 'Credit'}</Badge>
                      ) : (
                        <Badge variant="success">Paid</Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 truncate">
                      {inv.customer?.name || 'Walk-in'} · {formatRelative(inv.createdAt)}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-slate-900 num-display">{formatINR(inv.grandTotal)}</p>
                    <p className="text-xs text-slate-500">{inv.items?.length || 0} item{(inv.items?.length || 0) === 1 ? '' : 's'}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default RecentTransactions;
