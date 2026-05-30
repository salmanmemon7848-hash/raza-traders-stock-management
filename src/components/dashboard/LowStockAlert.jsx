import React from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../common/Card';
import EmptyState from '../common/EmptyState';
import Button from '../common/Button';
import Badge from '../common/Badge';

const LowStockAlert = ({ onNavigate }) => {
  const { products, settings } = useAppContext();
  const threshold = settings.lowStockThreshold || 5;
  const lowStock = products
    .filter(p => (p.quantity || 0) <= threshold)
    .sort((a, b) => (a.quantity || 0) - (b.quantity || 0))
    .slice(0, 6);

  return (
    <Card>
      <CardHeader
        title="Low Stock"
        subtitle={`Threshold: ${threshold} units`}
        icon={<AlertTriangle size={18} />}
        actions={
          lowStock.length > 0 && (
            <Button
              size="xs"
              variant="ghost"
              icon={<ArrowRight size={14} />}
              iconPosition="right"
              onClick={() => onNavigate?.('stock')}
            >
              View
            </Button>
          )
        }
      />
      <CardBody>
        {lowStock.length === 0 ? (
          <EmptyState title="All well stocked" description="No items below the low-stock threshold." />
        ) : (
          <ul className="space-y-2.5">
            {lowStock.map(p => {
              const isOut = (p.quantity || 0) === 0;
              return (
                <li key={p.id} className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{p.name}</p>
                    <p className="text-xs text-slate-500 truncate">{p.category || 'Uncategorized'}</p>
                  </div>
                  <Badge variant={isOut ? 'danger' : 'warning'}>
                    {isOut ? 'Out of stock' : `${p.quantity} left`}
                  </Badge>
                </li>
              );
            })}
          </ul>
        )}
      </CardBody>
    </Card>
  );
};

export default LowStockAlert;
