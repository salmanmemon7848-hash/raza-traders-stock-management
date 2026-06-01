import React, { useMemo } from 'react';
import {
  Moon,
  IndianRupee,
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  Wallet,
  Award,
  Target as TargetIcon,
} from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import Modal from '../common/Modal';
import Button from '../common/Button';
import {
  formatINR,
  calculateInvoiceGrossProfit,
} from '../../utils/calculations';
import { isToday } from '../../utils/dates';
import { openWhatsApp } from '../../utils/whatsapp';

const StatRow = ({ icon: Icon, label, value, tone = 'slate', sublabel }) => {
  const toneMap = {
    success: 'bg-success-50 text-success-700',
    danger: 'bg-danger-50 text-danger-700',
    brand: 'bg-brand-50 text-brand-700',
    warning: 'bg-warning-50 text-warning-700',
    info: 'bg-info-50 text-info-700',
    slate: 'bg-slate-50 text-slate-700',
  };
  return (
    <div className="flex items-center justify-between gap-3 py-2.5 border-b border-slate-100 last:border-b-0">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${toneMap[tone]}`}>
          <Icon size={16} />
        </div>
        <div className="min-w-0">
          <p className="text-sm text-slate-700 truncate">{label}</p>
          {sublabel && <p className="text-[11px] text-slate-400">{sublabel}</p>}
        </div>
      </div>
      <p className="text-sm font-semibold text-slate-900 num-display whitespace-nowrap">{value}</p>
    </div>
  );
};

const DailyClosingSummary = ({ isOpen, onClose }) => {
  const { invoices, expenses, products, payments, settings } = useAppContext();

  const data = useMemo(() => {
    const todayInvoices = invoices.filter((inv) => isToday(inv.createdAt));
    const todayExpenseList = expenses.filter((e) => isToday(e.date));
    const todayPayments = payments.filter((p) => isToday(p.date || p.createdAt));

    const revenue = todayInvoices.reduce((s, inv) => s + (inv.grandTotal || 0), 0);
    const expenseTotal = todayExpenseList.reduce((s, e) => s + (e.amount || 0), 0);
    const grossProfit = todayInvoices.reduce(
      (s, inv) => s + calculateInvoiceGrossProfit(inv, products),
      0
    );
    const netProfit = grossProfit - expenseTotal;
    const received = todayPayments.reduce((s, p) => s + (p.amount || 0), 0);
    const creditGiven = todayInvoices.reduce(
      (s, inv) => s + (inv.creditAmount || 0),
      0
    );

    // Top product sold today
    const productCount = {};
    todayInvoices.forEach((inv) => {
      (inv.items || []).forEach((item) => {
        const key = item.productId || item.name;
        if (!productCount[key]) {
          productCount[key] = { name: item.name, quantity: 0, revenue: 0 };
        }
        productCount[key].quantity += item.quantity || 0;
        productCount[key].revenue += item.total || 0;
      });
    });
    const topProduct = Object.values(productCount).sort(
      (a, b) => b.quantity - a.quantity
    )[0];

    const target = isToday(settings.dailyTargetSetDate) ? Number(settings.dailyTarget) || 0 : 0;
    const targetPercent = target > 0 ? Math.min(999, (revenue / target) * 100) : null;

    return {
      billsCount: todayInvoices.length,
      revenue,
      expenseTotal,
      grossProfit,
      netProfit,
      received,
      creditGiven,
      topProduct,
      target,
      targetPercent,
    };
  }, [invoices, expenses, products, payments, settings]);

  const buildShareMessage = () => {
    const today = new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    const shop = settings?.companyName || 'Raza Traders';
    const lines = [];
    lines.push(`*${shop} — Daily Closing Summary*`);
    lines.push(`📅 ${today}`);
    lines.push('');
    lines.push(`🧾 Bills: ${data.billsCount}`);
    lines.push(`💰 Revenue: ${formatINR(data.revenue).replace('₹', 'Rs. ')}`);
    lines.push(`📈 Gross profit: ${formatINR(data.grossProfit).replace('₹', 'Rs. ')}`);
    lines.push(`📉 Expenses: ${formatINR(data.expenseTotal).replace('₹', 'Rs. ')}`);
    lines.push(`✅ Net profit: ${formatINR(data.netProfit).replace('₹', 'Rs. ')}`);
    lines.push(`💵 Payments received: ${formatINR(data.received).replace('₹', 'Rs. ')}`);
    if (data.creditGiven > 0) {
      lines.push(`📋 Credit given today: ${formatINR(data.creditGiven).replace('₹', 'Rs. ')}`);
    }
    if (data.topProduct) {
      lines.push('');
      lines.push(`⭐ Top product: ${data.topProduct.name} (${data.topProduct.quantity} sold)`);
    }
    if (data.target > 0) {
      lines.push('');
      lines.push(
        `🎯 Target: ${formatINR(data.target).replace('₹', 'Rs. ')} — ${data.targetPercent.toFixed(0)}% achieved`
      );
    }
    return lines.join('\n');
  };

  const handleShare = () => {
    openWhatsApp({ message: buildShareMessage() });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Daily Closing Summary"
      subtitle={new Date().toLocaleDateString('en-IN', {
        weekday: 'long',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })}
      size="md"
      footer={
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} className="sm:flex-1">
            Close
          </Button>
          <Button onClick={handleShare} className="sm:flex-1">
            Share to WhatsApp
          </Button>
        </div>
      }
    >
      {/* Hero */}
      <div className="bg-gradient-to-br from-indigo-600 to-brand-700 text-white rounded-xl p-4 sm:p-5 mb-4">
        <div className="flex items-center gap-2 text-indigo-100 text-xs font-medium uppercase tracking-wide mb-1">
          <Moon size={14} /> End of day report
        </div>
        <p className="text-sm text-indigo-100">Net profit today</p>
        <p
          className={`text-3xl sm:text-4xl font-bold num-display ${
            data.netProfit >= 0 ? 'text-white' : 'text-rose-200'
          }`}
        >
          {formatINR(data.netProfit)}
        </p>
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-xs text-indigo-100">
          <span>{data.billsCount} {data.billsCount === 1 ? 'bill' : 'bills'}</span>
          <span>·</span>
          <span>Revenue {formatINR(data.revenue)}</span>
        </div>
      </div>

      {/* Target progress (if set) */}
      {data.target > 0 && (
        <div className="mb-4 p-3 rounded-lg bg-brand-50 border border-brand-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <TargetIcon size={16} className="text-brand-700" />
              <span className="text-sm font-medium text-slate-800">
                Today's target: {formatINR(data.target)}
              </span>
            </div>
            <span
              className={`text-xs font-semibold ${
                data.revenue >= data.target ? 'text-success-700' : 'text-brand-700'
              }`}
            >
              {data.targetPercent.toFixed(0)}%
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-white ring-1 ring-brand-200 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                data.revenue >= data.target
                  ? 'bg-gradient-to-r from-success-500 to-emerald-500'
                  : 'bg-gradient-to-r from-brand-500 to-indigo-500'
              }`}
              style={{ width: `${Math.min(100, data.targetPercent)}%` }}
            />
          </div>
          {data.revenue >= data.target && (
            <p className="text-xs text-success-700 mt-1.5 font-medium">
              🎉 Target achieved!
            </p>
          )}
        </div>
      )}

      {/* Breakdown */}
      <div className="rounded-xl border border-slate-200 px-3 sm:px-4 py-1">
        <StatRow
          icon={ShoppingBag}
          label="Total bills"
          value={String(data.billsCount)}
          tone="brand"
        />
        <StatRow
          icon={IndianRupee}
          label="Revenue (sales)"
          value={formatINR(data.revenue)}
          tone="success"
        />
        <StatRow
          icon={TrendingUp}
          label="Gross profit"
          value={formatINR(data.grossProfit)}
          tone={data.grossProfit >= 0 ? 'success' : 'danger'}
          sublabel="Sales − cost"
        />
        <StatRow
          icon={TrendingDown}
          label="Expenses"
          value={formatINR(data.expenseTotal)}
          tone="warning"
        />
        <StatRow
          icon={Wallet}
          label="Payments received"
          value={formatINR(data.received)}
          tone="info"
          sublabel="From customer dues"
        />
        {data.creditGiven > 0 && (
          <StatRow
            icon={TrendingDown}
            label="Credit given today"
            value={formatINR(data.creditGiven)}
            tone="danger"
            sublabel="Udhaar from today's bills"
          />
        )}
        {data.topProduct && (
          <StatRow
            icon={Award}
            label={`Top: ${data.topProduct.name}`}
            value={`${data.topProduct.quantity} sold`}
            tone="brand"
            sublabel={`Revenue ${formatINR(data.topProduct.revenue)}`}
          />
        )}
      </div>

      {data.billsCount === 0 && (
        <p className="text-center text-sm text-slate-500 mt-4">
          No sales recorded today. Rest up — tomorrow's a new day! 🌙
        </p>
      )}
    </Modal>
  );
};

export default DailyClosingSummary;
