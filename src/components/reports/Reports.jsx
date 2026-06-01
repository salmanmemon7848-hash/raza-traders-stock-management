import React, { useMemo, useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import {
  Package, Users, FileText, AlertTriangle, TrendingUp, Download,
  MessageCircle,
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import Button from '../common/Button';
import Badge from '../common/Badge';
import PageHeader from '../common/PageHeader';
import StatCard from '../common/StatCard';
import EmptyState from '../common/EmptyState';
import { Card, CardHeader, CardBody } from '../common/Card';
import {
  formatINR,
  calculateInvoiceGrossProfit,
  calculateTotalGrossProfit,
  getInvoiceOutstanding,
  calculateTotalOutstanding,
} from '../../utils/calculations';
import { formatDate } from '../../utils/dates';
import { openWhatsApp } from '../../utils/whatsapp';

const TABS = [
  { id: 'profit',   label: 'Profit',          icon: TrendingUp },
  { id: 'credit',   label: 'Credit (Udhaar)', icon: AlertTriangle },
  { id: 'billing',  label: 'Sales',           icon: FileText },
  { id: 'stock',    label: 'Stock',           icon: Package },
  { id: 'customers',label: 'Customers',       icon: Users },
];

const buildPdf = (title, head, body, fileName) => {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.setTextColor(40, 40, 60);
  doc.text(title, 105, 16, null, null, 'center');
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 110);
  doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, 105, 22, null, null, 'center');
  autoTable(doc, {
    startY: 30,
    head,
    body,
    theme: 'striped',
    headStyles: { fillColor: [79, 70, 229] },
    styles: { fontSize: 9 },
  });
  doc.save(fileName);
};

const Reports = () => {
  const { products, customers, invoices, settings } = useAppContext();
  const [tab, setTab] = useState('profit');

  // Profit aggregates
  const totalSales = useMemo(() => invoices.reduce((s, i) => s + i.grandTotal, 0), [invoices]);
  const totalGrossProfit = useMemo(() => calculateTotalGrossProfit(invoices, products), [invoices, products]);

  // Credit aggregates
  const totalOutstanding = useMemo(() => calculateTotalOutstanding(invoices), [invoices]);
  const pendingInvoices = useMemo(() => invoices.filter(i => getInvoiceOutstanding(i) > 0), [invoices]);

  return (
    <div className="page-shell">
      <PageHeader
        title="Reports"
        subtitle="Insights into sales, profit, stock, and outstanding amounts."
      />

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex gap-1 overflow-x-auto scrollbar-hide">
          {TABS.map(t => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-3 sm:px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-2
                  ${active ? 'border-brand-600 text-brand-700' : 'border-transparent text-slate-500 hover:text-slate-900'}`}
              >
                <Icon size={16} />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* PROFIT */}
      {tab === 'profit' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <StatCard label="Total Sales" value={formatINR(totalSales)} icon={FileText} tone="brand" />
            <StatCard label="Gross Profit" value={formatINR(totalGrossProfit)} icon={TrendingUp} tone="success" />
            <StatCard label="Avg / Bill" value={formatINR(invoices.length ? totalGrossProfit / invoices.length : 0)} tone="neutral" />
          </div>

          <Card>
            <CardHeader
              title="Profit per bill"
              subtitle="Sale − purchase cost − bill discount"
              actions={
                <Button
                  size="sm"
                  variant="outline"
                  icon={<Download size={14} />}
                  onClick={() =>
                    buildPdf(
                      'Profit Report',
                      [['Invoice', 'Date', 'Customer', 'Sale', 'Profit']],
                      invoices.map(inv => [
                        inv.invoiceNumber,
                        formatDate(inv.createdAt),
                        inv.customer?.name || 'Walk-in',
                        formatINR(inv.grandTotal),
                        formatINR(calculateInvoiceGrossProfit(inv, products)),
                      ]),
                      `profit-report-${new Date().toISOString().split('T')[0]}.pdf`
                    )
                  }
                >
                  Download PDF
                </Button>
              }
            />
            <CardBody>
              {invoices.length === 0 ? (
                <EmptyState title="No sales yet" />
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left px-3 py-2 text-xs font-semibold text-slate-500 uppercase">Invoice</th>
                        <th className="text-left px-3 py-2 text-xs font-semibold text-slate-500 uppercase">Date</th>
                        <th className="text-left px-3 py-2 text-xs font-semibold text-slate-500 uppercase">Customer</th>
                        <th className="text-right px-3 py-2 text-xs font-semibold text-slate-500 uppercase">Sale</th>
                        <th className="text-right px-3 py-2 text-xs font-semibold text-slate-500 uppercase">Profit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {[...invoices].reverse().slice(0, 100).map(inv => {
                        const profit = calculateInvoiceGrossProfit(inv, products);
                        return (
                          <tr key={inv.id} className="hover:bg-slate-50">
                            <td className="px-3 py-2.5 text-sm font-medium text-slate-900">{inv.invoiceNumber}</td>
                            <td className="px-3 py-2.5 text-sm text-slate-600">{formatDate(inv.createdAt)}</td>
                            <td className="px-3 py-2.5 text-sm text-slate-700">{inv.customer?.name || 'Walk-in'}</td>
                            <td className="px-3 py-2.5 text-right text-sm text-slate-900 num-display">{formatINR(inv.grandTotal)}</td>
                            <td className={`px-3 py-2.5 text-right text-sm font-semibold num-display ${profit >= 0 ? 'text-success-700' : 'text-danger-700'}`}>
                              {formatINR(profit)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      )}

      {/* CREDIT */}
      {tab === 'credit' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <StatCard label="Total Pending" value={formatINR(totalOutstanding)} icon={AlertTriangle} tone="danger" />
            <StatCard label="Unpaid Bills" value={pendingInvoices.length} tone="warning" />
            <StatCard label="Paid Bills" value={invoices.length - pendingInvoices.length} tone="success" />
          </div>

          <Card>
            <CardHeader title="Unpaid invoices" />
            <CardBody>
              {pendingInvoices.length === 0 ? (
                <EmptyState
                  title="No unpaid invoices"
                  description="All bills are settled."
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left px-3 py-2 text-xs font-semibold text-slate-500 uppercase">Invoice</th>
                        <th className="text-left px-3 py-2 text-xs font-semibold text-slate-500 uppercase">Date</th>
                        <th className="text-left px-3 py-2 text-xs font-semibold text-slate-500 uppercase">Customer</th>
                        <th className="text-right px-3 py-2 text-xs font-semibold text-slate-500 uppercase">Bill</th>
                        <th className="text-right px-3 py-2 text-xs font-semibold text-slate-500 uppercase">Outstanding</th>
                        <th className="text-right px-3 py-2 text-xs font-semibold text-slate-500 uppercase">Status</th>
                        <th className="text-right px-3 py-2 text-xs font-semibold text-slate-500 uppercase">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {pendingInvoices.map(inv => {
                        const outstanding = getInvoiceOutstanding(inv);
                        return (
                          <tr key={inv.id} className="hover:bg-slate-50">
                            <td className="px-3 py-2.5 text-sm font-medium text-slate-900">{inv.invoiceNumber}</td>
                            <td className="px-3 py-2.5 text-sm text-slate-600">{formatDate(inv.createdAt)}</td>
                            <td className="px-3 py-2.5 text-sm text-slate-700">{inv.customer?.name || 'Walk-in'}</td>
                            <td className="px-3 py-2.5 text-right text-sm text-slate-900 num-display">{formatINR(inv.grandTotal)}</td>
                            <td className="px-3 py-2.5 text-right text-sm font-bold text-danger-700 num-display">{formatINR(outstanding)}</td>
                            <td className="px-3 py-2.5 text-right">
                              <Badge variant={inv.paymentStatus === 'partial_credit' ? 'warning' : 'danger'}>
                                {inv.paymentStatus === 'partial_credit' ? 'Partial' : 'Credit'}
                              </Badge>
                            </td>
                            <td className="px-3 py-2.5 text-right">
                              {inv.customer?.phone && (
                                <Button
                                  size="xs"
                                  variant="ghost"
                                  icon={<MessageCircle size={14} />}
                                  onClick={() =>
                                    openWhatsApp({
                                      phone: inv.customer.phone,
                                      message:
                                        `Hi ${inv.customer.name}, this is a friendly reminder of pending payment of ` +
                                        `${formatINR(outstanding)} against invoice ${inv.invoiceNumber} from ${settings.companyName}. ` +
                                        `Please clear at your earliest. Thank you!`,
                                    })
                                  }
                                >
                                  Remind
                                </Button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardBody>
          </Card>

        </div>
      )}

      {/* BILLING */}
      {tab === 'billing' && (
        <Card>
          <CardHeader
            title="All sales"
            subtitle={`${invoices.length} bill${invoices.length === 1 ? '' : 's'}`}
            actions={
              <Button
                size="sm"
                variant="outline"
                icon={<Download size={14} />}
                onClick={() =>
                  buildPdf(
                    'Sales Report',
                    [['Invoice', 'Date', 'Customer', 'Items', 'Total']],
                    invoices.map(inv => [
                      inv.invoiceNumber,
                      formatDate(inv.createdAt),
                      inv.customer?.name || 'Walk-in',
                      (inv.items || []).length,
                      formatINR(inv.grandTotal),
                    ]),
                    `sales-report-${new Date().toISOString().split('T')[0]}.pdf`
                  )
                }
              >
                Download PDF
              </Button>
            }
          />
          <CardBody>
            {invoices.length === 0 ? (
              <EmptyState title="No sales yet" />
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left px-3 py-2 text-xs font-semibold text-slate-500 uppercase">Invoice</th>
                      <th className="text-left px-3 py-2 text-xs font-semibold text-slate-500 uppercase">Date</th>
                      <th className="text-left px-3 py-2 text-xs font-semibold text-slate-500 uppercase">Customer</th>
                      <th className="text-right px-3 py-2 text-xs font-semibold text-slate-500 uppercase">Items</th>
                      <th className="text-right px-3 py-2 text-xs font-semibold text-slate-500 uppercase">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[...invoices].reverse().map(inv => (
                      <tr key={inv.id} className="hover:bg-slate-50">
                        <td className="px-3 py-2.5 text-sm font-medium text-slate-900">{inv.invoiceNumber}</td>
                        <td className="px-3 py-2.5 text-sm text-slate-600">{formatDate(inv.createdAt)}</td>
                        <td className="px-3 py-2.5 text-sm text-slate-700">{inv.customer?.name || 'Walk-in'}</td>
                        <td className="px-3 py-2.5 text-right text-sm text-slate-700">{(inv.items || []).length}</td>
                        <td className="px-3 py-2.5 text-right text-sm font-semibold text-slate-900 num-display">{formatINR(inv.grandTotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {/* STOCK */}
      {tab === 'stock' && (
        <Card>
          <CardHeader
            title="Stock report"
            actions={
              <Button
                size="sm"
                variant="outline"
                icon={<Download size={14} />}
                onClick={() =>
                  buildPdf(
                    'Stock Report',
                    [['Product', 'Category', 'Purchase', 'Selling', 'Stock', 'Value']],
                    products.map(p => [
                      p.name,
                      p.category,
                      formatINR(p.purchasePrice),
                      formatINR(p.sellingPrice),
                      p.quantity,
                      formatINR((p.sellingPrice || 0) * (p.quantity || 0)),
                    ]),
                    `stock-report-${new Date().toISOString().split('T')[0]}.pdf`
                  )
                }
              >
                Download PDF
              </Button>
            }
          />
          <CardBody>
            {products.length === 0 ? (
              <EmptyState title="No products in stock" />
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left px-3 py-2 text-xs font-semibold text-slate-500 uppercase">Product</th>
                      <th className="text-left px-3 py-2 text-xs font-semibold text-slate-500 uppercase">Category</th>
                      <th className="text-right px-3 py-2 text-xs font-semibold text-slate-500 uppercase">Cost</th>
                      <th className="text-right px-3 py-2 text-xs font-semibold text-slate-500 uppercase">Price</th>
                      <th className="text-right px-3 py-2 text-xs font-semibold text-slate-500 uppercase">Stock</th>
                      <th className="text-right px-3 py-2 text-xs font-semibold text-slate-500 uppercase">Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {products.map(p => (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="px-3 py-2.5 text-sm font-medium text-slate-900">{p.name}</td>
                        <td className="px-3 py-2.5 text-sm text-slate-700">{p.category}</td>
                        <td className="px-3 py-2.5 text-right text-sm text-slate-700 num-display">{formatINR(p.purchasePrice)}</td>
                        <td className="px-3 py-2.5 text-right text-sm text-slate-900 num-display">{formatINR(p.sellingPrice)}</td>
                        <td className={`px-3 py-2.5 text-right text-sm ${p.quantity <= 5 ? 'text-danger-700 font-semibold' : 'text-slate-700'}`}>{p.quantity}</td>
                        <td className="px-3 py-2.5 text-right text-sm font-semibold text-slate-900 num-display">
                          {formatINR((p.sellingPrice || 0) * (p.quantity || 0))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {/* CUSTOMERS */}
      {tab === 'customers' && (
        <Card>
          <CardHeader
            title="Customer report"
            actions={
              <Button
                size="sm"
                variant="outline"
                icon={<Download size={14} />}
                onClick={() =>
                  buildPdf(
                    'Customer Report',
                    [['Name', 'Phone', 'Total Spent', 'Outstanding']],
                    customers.map(c => {
                      const outstanding = invoices
                        .filter(inv => inv.customer?.id === c.id)
                        .reduce((s, inv) => s + getInvoiceOutstanding(inv), 0);
                      return [
                        c.name,
                        c.phone || '-',
                        formatINR(c.totalSpent || 0),
                        formatINR(outstanding),
                      ];
                    }),
                    `customer-report-${new Date().toISOString().split('T')[0]}.pdf`
                  )
                }
              >
                Download PDF
              </Button>
            }
          />
          <CardBody>
            {customers.length === 0 ? (
              <EmptyState title="No customers yet" />
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left px-3 py-2 text-xs font-semibold text-slate-500 uppercase">Name</th>
                      <th className="text-left px-3 py-2 text-xs font-semibold text-slate-500 uppercase">Phone</th>
                      <th className="text-right px-3 py-2 text-xs font-semibold text-slate-500 uppercase">Total Spent</th>
                      <th className="text-right px-3 py-2 text-xs font-semibold text-slate-500 uppercase">Outstanding</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {customers.map(c => {
                      const outstanding = invoices
                        .filter(inv => inv.customer?.id === c.id)
                        .reduce((s, inv) => s + getInvoiceOutstanding(inv), 0);
                      return (
                        <tr key={c.id} className="hover:bg-slate-50">
                          <td className="px-3 py-2.5 text-sm font-medium text-slate-900">{c.name}</td>
                          <td className="px-3 py-2.5 text-sm text-slate-600">{c.phone || '—'}</td>
                          <td className="px-3 py-2.5 text-right text-sm text-slate-900 num-display">{formatINR(c.totalSpent || 0)}</td>
                          <td className={`px-3 py-2.5 text-right text-sm font-semibold num-display ${outstanding > 0 ? 'text-danger-700' : 'text-slate-400'}`}>
                            {outstanding > 0 ? formatINR(outstanding) : '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardBody>
        </Card>
      )}
    </div>
  );
};

export default Reports;
