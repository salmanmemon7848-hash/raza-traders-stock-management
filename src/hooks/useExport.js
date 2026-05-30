import { useAppContext } from '../contexts/AppContext';

const escape = (val) => {
  if (val === null || val === undefined) return '';
  const s = String(val).replace(/"/g, '""');
  return /[",\n]/.test(s) ? `"${s}"` : s;
};

const downloadCSV = (rows, filename) => {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [headers.join(','), ...rows.map(r => headers.map(h => escape(r[h])).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  link.click();
};

export const useExport = () => {
  const { products, customers, invoices } = useAppContext();

  const exportProductsCSV = () => {
    downloadCSV(
      products.map(p => ({
        Name: p.name,
        Category: p.category,
        Model: p.modelNumber || '',
        PurchasePrice: p.purchasePrice || 0,
        SellingPrice: p.sellingPrice || 0,
        Stock: p.quantity || 0,
      })),
      `products-${new Date().toISOString().split('T')[0]}`
    );
  };

  const exportCustomersCSV = () => {
    downloadCSV(
      customers.map(c => ({
        Name: c.name,
        Phone: c.phone || '',
        Address: c.address || '',
        TotalSpent: c.totalSpent || 0,
      })),
      `customers-${new Date().toISOString().split('T')[0]}`
    );
  };

  const exportInvoicesCSV = () => {
    downloadCSV(
      invoices.map(i => ({
        Invoice: i.invoiceNumber,
        Date: new Date(i.createdAt).toLocaleDateString('en-IN'),
        Customer: i.customer?.name || 'Walk-in',
        Items: (i.items || []).length,
        Subtotal: i.subtotal,
        Discount: i.discount,
        Tax: i.taxAmount,
        Total: i.grandTotal,
        Status: i.paymentStatus || 'paid',
      })),
      `invoices-${new Date().toISOString().split('T')[0]}`
    );
  };

  return { exportProductsCSV, exportCustomersCSV, exportInvoicesCSV };
};
