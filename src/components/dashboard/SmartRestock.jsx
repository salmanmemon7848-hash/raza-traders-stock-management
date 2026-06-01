import React, { useMemo } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { Zap, ArrowRight, AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../common/Card';
import EmptyState from '../common/EmptyState';
import Button from '../common/Button';
import Badge from '../common/Badge';

const WINDOW_DAYS = 7;

const SmartRestock = ({ onNavigate }) => {
  const { products, invoices, settings } = useAppContext();
  const threshold = settings.lowStockThreshold || 5;

  const items = useMemo(() => {
    const since = Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000;

    // Compute units sold per product over the last WINDOW_DAYS
    const soldMap = new Map();
    invoices.forEach((inv) => {
      const t = new Date(inv.createdAt).getTime();
      if (!Number.isFinite(t) || t < since) return;
      (inv.items || []).forEach((item) => {
        if (!item.productId) return;
        soldMap.set(item.productId, (soldMap.get(item.productId) || 0) + (item.quantity || 0));
      });
    });

    return products
      .map((p) => {
        const sold = soldMap.get(p.id) || 0;
        const qty = p.quantity || 0;
        const velocityPerDay = sold / WINDOW_DAYS;
        const daysLeft = velocityPerDay > 0 ? qty / velocityPerDay : Infinity;

        // Urgency tiers
        let urgency = null;
        if (qty === 0) urgency = 'out';
        else if (velocityPerDay > 0 && daysLeft <= 3) urgency = 'critical';
        else if (velocityPerDay > 0 && daysLeft <= 7) urgency = 'soon';
        else if (qty <= threshold) urgency = 'low';

        return {
          id: p.id,
          name: p.name,
          category: p.category,
          quantity: qty,
          sold,
          velocityPerDay,
          daysLeft,
          urgency,
        };
      })
      .filter((p) => p.urgency)
      .sort((a, b) => {
        // Rank: out > critical > soon > low; within each, lowest daysLeft first
        const rank = { out: 0, critical: 1, soon: 2, low: 3 };
        if (rank[a.urgency] !== rank[b.urgency]) return rank[a.urgency] - rank[b.urgency];
        return a.daysLeft - b.daysLeft;
      })
      .slice(0, 6);
  }, [products, invoices, threshold]);

  const renderBadge = (item) => {
    if (item.urgency === 'out') return <Badge variant="danger">Out of stock</Badge>;
    if (item.urgency === 'critical')
      return <Badge variant="danger">~{Math.max(1, Math.ceil(item.daysLeft))}d left</Badge>;
    if (item.urgency === 'soon')
      return <Badge variant="warning">~{Math.ceil(item.daysLeft)}d left</Badge>;
    return <Badge variant="warning">{item.quantity} left</Badge>;
  };

  const renderHint = (item) => {
    if (item.urgency === 'out' && item.sold > 0) {
      return `Sold ${item.sold} in last ${WINDOW_DAYS}d — reorder now`;
    }
    if (item.urgency === 'out') {
      return 'No sales recently — review demand';
    }
    if (item.sold > 0) {
      return `Sold ${item.sold} in last ${WINDOW_DAYS}d · ${item.quantity} in stock`;
    }
    return `${item.quantity} in stock · low threshold`;
  };

  return (
    <Card>
      <CardHeader
        title="Smart Restock"
        subtitle={`Velocity-based · last ${WINDOW_DAYS} days`}
        icon={<Zap size={18} />}
        actions={
          items.length > 0 && (
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
        {items.length === 0 ? (
          <EmptyState
            title="All stocked up"
            description="No urgent restocks based on recent sales velocity."
          />
        ) : (
          <ul className="space-y-2.5">
            {items.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-2">
                <div className="min-w-0 flex items-start gap-2">
                  {(item.urgency === 'out' || item.urgency === 'critical') && (
                    <AlertTriangle size={14} className="text-danger-500 mt-0.5 shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{item.name}</p>
                    <p className="text-xs text-slate-500 truncate">{renderHint(item)}</p>
                  </div>
                </div>
                <div className="shrink-0">{renderBadge(item)}</div>
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  );
};

export default SmartRestock;
