import React, { useMemo } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import {
  IndianRupee,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Wallet,
  ArrowRight,
  ShoppingBag,
  Package,
  Users,
  ClipboardList,
  Plus,
} from 'lucide-react';
import StatCard from '../common/StatCard';
import Button from '../common/Button';
import Badge from '../common/Badge';
import EmptyState from '../common/EmptyState';
import PageHeader from '../common/PageHeader';
import { Card, CardHeader, CardBody } from '../common/Card';
import SalesChart from './SalesChart';
import TopProducts from './TopProducts';
import SmartRestock from './SmartRestock';
import RecentTransactions from './RecentTransactions';
import DailyTargetCard from './DailyTargetCard';
import {
  formatINR,
  calculateTotalOutstanding,
  getInvoiceOutstanding,
  calculateNetProfit,
  calculateInvoiceGrossProfit,
} from '../../utils/calculations';
import { formatDate, isToday, isThisMonth, daysBetween } from '../../utils/dates';

const Dashboard = ({ onNavigate }) => {
  const { invoices, expenses, products, customers, payments, productRequests } = useAppContext();

  // ---------- Today ----------
  const todayInvoices = useMemo(
    () => invoices.filter(inv => isToday(inv.createdAt)),
    [invoices]
  );
  const todaySales = useMemo(
    () => todayInvoices.reduce((s, inv) => s + (inv.grandTotal || 0), 0),
    [todayInvoices]
  );
  const todayExpenses = useMemo(
    () => expenses.filter(e => isToday(e.date)).reduce((s, e) => s + e.amount, 0),
    [expenses]
  );
  const todayProfit = useMemo(
    () =>
      todayInvoices.reduce((s, inv) => s + calculateInvoiceGrossProfit(inv, products), 0) -
      todayExpenses,
    [todayInvoices, products, todayExpenses]
  );
  const todayReceived = useMemo(
    () =>
      payments
        .filter(p => isToday(p.date || p.createdAt))
        .reduce((s, p) => s + p.amount, 0),
    [payments]
  );

  // ---------- Month ----------
  const monthSales = useMemo(
    () =>
      invoices
        .filter(inv => isThisMonth(inv.createdAt))
        .reduce((s, inv) => s + (inv.grandTotal || 0), 0),
    [invoices]
  );
  const monthExpenses = useMemo(
    () => expenses.filter(e => isThisMonth(e.date)).reduce((s, e) => s + e.amount, 0),
    [expenses]
  );
  const monthNetProfit = useMemo(() => {
    const monthInvoices = invoices.filter(inv => isThisMonth(inv.createdAt));
    const monthExp = expenses.filter(e => isThisMonth(e.date));
    return calculateNetProfit(monthInvoices, products, monthExp);
  }, [invoices, expenses, products]);

  // ---------- Credit / Udhaar ----------
  const totalOutstanding = useMemo(() => calculateTotalOutstanding(invoices), [invoices]);
  const pendingInvoices = useMemo(
    () => invoices.filter(inv => getInvoiceOutstanding(inv) > 0),
    [invoices]
  );

  // Customers with old pending dues (>15 days)
  const overdueCustomers = useMemo(() => {
    const map = new Map();
    pendingInvoices.forEach(inv => {
      const days = daysBetween(inv.createdAt);
      if (days >= 15 && inv.customer?.name) {
        const existing = map.get(inv.customer.name) || { name: inv.customer.name, phone: inv.customer.phone, amount: 0, oldestDays: 0 };
        existing.amount += getInvoiceOutstanding(inv);
        existing.oldestDays = Math.max(existing.oldestDays, days);
        map.set(inv.customer.name, existing);
      }
    });
    return Array.from(map.values()).sort((a, b) => b.amount - a.amount).slice(0, 5);
  }, [pendingInvoices]);

  // ---------- Pending product requests ----------
  const pendingRequestsCount = useMemo(
    () => productRequests.filter(r => r.status === 'pending').length,
    [productRequests]
  );

  // ---------- Low stock ----------
  const lowStockCount = useMemo(
    () => products.filter(p => (p.quantity || 0) <= 5).length,
    [products]
  );

  return (
    <div className="page-shell">
      <PageHeader
        eyebrow="Overview"
        title="Welcome back"
        subtitle={`Here's what's happening at your store today — ${formatDate(new Date())}`}
        actions={
          <>
            <Button
              variant="outline"
              icon={<ClipboardList size={16} />}
              onClick={() => onNavigate?.('requests')}
            >
              Product Requests
            </Button>
            <Button
              icon={<Plus size={16} />}
              onClick={() => onNavigate?.('billing')}
            >
              New Bill
            </Button>
          </>
        }
      />

      {/* Daily Target */}
      <DailyTargetCard
        todaySales={todaySales}
        todayInvoicesCount={todayInvoices.length}
      />

      {/* Today's KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label="Today's Sales"
          value={formatINR(todaySales)}
          icon={IndianRupee}
          tone="success"
          hint={`${todayInvoices.length} ${todayInvoices.length === 1 ? 'invoice' : 'invoices'}`}
        />
        <StatCard
          label="Today's Profit"
          value={formatINR(todayProfit)}
          icon={TrendingUp}
          tone={todayProfit >= 0 ? 'brand' : 'danger'}
          hint="Sales − cost − expenses"
        />
        <StatCard
          label="Today's Expenses"
          value={formatINR(todayExpenses)}
          icon={TrendingDown}
          tone="warning"
        />
        <StatCard
          label="Payments Received"
          value={formatINR(todayReceived)}
          icon={Wallet}
          tone="info"
          hint="From customer dues today"
        />
      </div>

      {/* Outstanding credit highlight */}
      {totalOutstanding > 0 && (
        <Card className="bg-gradient-to-br from-danger-50 to-white border-danger-200">
          <div className="px-4 sm:px-5 py-4 sm:py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-danger-100 text-danger-600 flex items-center justify-center shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Total outstanding credit (Udhaar)</p>
                <p className="text-2xl sm:text-3xl font-bold text-danger-700 num-display">
                  {formatINR(totalOutstanding)}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {pendingInvoices.length} unpaid {pendingInvoices.length === 1 ? 'invoice' : 'invoices'}
                  {overdueCustomers.length > 0 && ` · ${overdueCustomers.length} customer${overdueCustomers.length === 1 ? '' : 's'} overdue >15 days`}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              icon={<ArrowRight size={14} />}
              iconPosition="right"
              onClick={() => onNavigate?.('reports')}
            >
              View details
            </Button>
          </div>
        </Card>
      )}

      {/* Month summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <StatCard
          label="This Month — Revenue"
          value={formatINR(monthSales)}
          icon={ShoppingBag}
          tone="brand"
        />
        <StatCard
          label="This Month — Net Profit"
          value={formatINR(monthNetProfit)}
          icon={TrendingUp}
          tone={monthNetProfit >= 0 ? 'success' : 'danger'}
        />
        <StatCard
          label="This Month — Expenses"
          value={formatINR(monthExpenses)}
          icon={TrendingDown}
          tone="warning"
        />
      </div>

      {/* Quick navigation tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card
          onClick={() => onNavigate?.('stock')}
          className="cursor-pointer hover:shadow-elevated transition-shadow"
        >
          <div className="p-4 sm:p-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
              <Package size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-500 font-medium">Products</p>
              <p className="text-lg font-semibold text-slate-900">{products.length}</p>
              {lowStockCount > 0 && (
                <p className="text-xs text-danger-600 font-medium mt-0.5">
                  {lowStockCount} low stock
                </p>
              )}
            </div>
          </div>
        </Card>
        <Card
          onClick={() => onNavigate?.('customers')}
          className="cursor-pointer hover:shadow-elevated transition-shadow"
        >
          <div className="p-4 sm:p-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-info-50 text-info-600 flex items-center justify-center">
              <Users size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-500 font-medium">Customers</p>
              <p className="text-lg font-semibold text-slate-900">{customers.length}</p>
            </div>
          </div>
        </Card>
        <Card
          onClick={() => onNavigate?.('billing')}
          className="cursor-pointer hover:shadow-elevated transition-shadow"
        >
          <div className="p-4 sm:p-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success-50 text-success-600 flex items-center justify-center">
              <ShoppingBag size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-500 font-medium">Total Bills</p>
              <p className="text-lg font-semibold text-slate-900">{invoices.length}</p>
            </div>
          </div>
        </Card>
        <Card
          onClick={() => onNavigate?.('requests')}
          className="cursor-pointer hover:shadow-elevated transition-shadow"
        >
          <div className="p-4 sm:p-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning-50 text-warning-600 flex items-center justify-center">
              <ClipboardList size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-500 font-medium">Requests</p>
              <p className="text-lg font-semibold text-slate-900">{pendingRequestsCount}</p>
              <p className="text-xs text-slate-500 mt-0.5">pending</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main grid: sales chart + insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        <div className="lg:col-span-2 space-y-4 sm:space-y-5">
          <SalesChart />
          <RecentTransactions />
        </div>
        <div className="space-y-4 sm:space-y-5">
          <SmartRestock onNavigate={onNavigate} />
          {/* Overdue customers */}
          <Card>
            <CardHeader
              title="Overdue Customers"
              subtitle="Pending dues > 15 days"
              icon={<AlertTriangle size={18} />}
            />
            <CardBody>
              {overdueCustomers.length === 0 ? (
                <EmptyState
                  title="All clear"
                  description="No customer has overdue payments."
                />
              ) : (
                <ul className="space-y-2.5">
                  {overdueCustomers.map((c) => (
                    <li key={c.name} className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{c.name}</p>
                        <p className="text-xs text-slate-500">
                          {c.phone || 'No phone'} · {c.oldestDays}d old
                        </p>
                      </div>
                      <Badge variant="danger">{formatINR(c.amount)}</Badge>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>
          <TopProducts />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
