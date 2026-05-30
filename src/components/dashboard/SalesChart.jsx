import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Card, CardHeader } from '../common/Card';
import EmptyState from '../common/EmptyState';
import { TrendingUp } from 'lucide-react';
import { formatINR } from '../../utils/calculations';

const RANGE_OPTIONS = [
  { id: '7d',  label: '7 days',  days: 7 },
  { id: '30d', label: '30 days', days: 30 },
  { id: '90d', label: '90 days', days: 90 },
];

const SalesChart = () => {
  const { invoices } = useAppContext();
  const [range, setRange] = useState('30d');
  const days = RANGE_OPTIONS.find(r => r.id === range)?.days || 30;

  const data = useMemo(() => {
    const bucket = {};
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const key = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
      bucket[key] = { label: key, sales: 0, orders: 0 };
    }
    invoices.forEach(inv => {
      const d = new Date(inv.createdAt);
      const diff = Math.floor((now - d) / 86400000);
      if (diff < 0 || diff >= days) return;
      const key = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
      if (bucket[key]) {
        bucket[key].sales += inv.grandTotal || 0;
        bucket[key].orders += 1;
      }
    });
    return Object.values(bucket);
  }, [invoices, days]);

  const totalSales = data.reduce((s, d) => s + d.sales, 0);
  const totalOrders = data.reduce((s, d) => s + d.orders, 0);

  return (
    <Card>
      <CardHeader
        title="Sales Trend"
        subtitle={`${formatINR(totalSales)} · ${totalOrders} order${totalOrders === 1 ? '' : 's'} in last ${days} days`}
        icon={<TrendingUp size={18} />}
        actions={
          <div className="inline-flex p-0.5 bg-slate-100 rounded-lg">
            {RANGE_OPTIONS.map(opt => (
              <button
                key={opt.id}
                onClick={() => setRange(opt.id)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors
                  ${range === opt.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        }
      />
      <div className="px-2 sm:px-3 pb-4 pt-1">
        {totalOrders === 0 ? (
          <EmptyState
            title="No sales yet"
            description="Sales data will appear here once you create your first bill."
          />
        ) : (
          <div className="h-64 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}
                />
                <Tooltip
                  formatter={(v) => formatINR(v)}
                  contentStyle={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: '#475569', fontWeight: 600 }}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#4f46e5"
                  strokeWidth={2}
                  fill="url(#salesFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </Card>
  );
};

export default SalesChart;
