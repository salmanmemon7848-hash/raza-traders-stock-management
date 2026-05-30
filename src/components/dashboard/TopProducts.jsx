import React from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { getTopSellingProducts, formatINR } from '../../utils/calculations';
import { Card, CardHeader, CardBody } from '../common/Card';
import EmptyState from '../common/EmptyState';
import { Trophy } from 'lucide-react';

const RANK_COLOR = ['bg-warning-100 text-warning-700', 'bg-slate-200 text-slate-700', 'bg-amber-100 text-amber-700', 'bg-slate-100 text-slate-600', 'bg-slate-100 text-slate-600'];

const TopProducts = () => {
  const { products, invoices } = useAppContext();
  const top = getTopSellingProducts(products, invoices, 5);

  return (
    <Card>
      <CardHeader title="Top Sellers" subtitle="Last all-time" icon={<Trophy size={18} />} />
      <CardBody>
        {top.length === 0 ? (
          <EmptyState title="No sales yet" description="Once you start billing, your bestsellers appear here." />
        ) : (
          <ul className="space-y-2.5">
            {top.map((p, i) => (
              <li key={p.productId || i} className="flex items-center gap-3">
                <div className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${RANK_COLOR[i] || RANK_COLOR[4]}`}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{p.name}</p>
                  <p className="text-xs text-slate-500">{p.quantitySold} sold</p>
                </div>
                <p className="text-sm font-semibold text-slate-900 num-display">{formatINR(p.revenue)}</p>
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  );
};

export default TopProducts;
