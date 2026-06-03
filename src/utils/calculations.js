// Calculation utilities — single source of truth for money/profit math
// Currency: ₹ (Indian Rupee) across the entire app

// ---------- Currency formatting ----------
export const formatINR = (amount) => {
  const n = Number(amount) || 0;
  return `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
};

export const formatCurrency = formatINR; // backward-compat alias

// ---------- Bill math ----------
export const calculateSubtotal = (items) =>
  items.reduce((sum, item) => sum + (item.total || 0), 0);

export const calculateDiscount = (subtotal, discountValue, discountType = 'fixed') => {
  if (!discountValue) return 0;
  return discountType === 'percentage'
    ? (subtotal * discountValue) / 100
    : discountValue;
};

export const calculateTax = (amountAfterDiscount, taxRate) => {
  if (!taxRate) return 0;
  return (amountAfterDiscount * taxRate) / 100;
};

export const calculateGrandTotal = (subtotal, discount, taxAmount) =>
  subtotal - discount + taxAmount;

export const calculateTotalInvoice = (items, discountValue = 0, discountType = 'fixed', taxRate = 0) => {
  const subtotal = calculateSubtotal(items);
  const discount = calculateDiscount(subtotal, discountValue, discountType);
  const taxAmount = calculateTax(subtotal - discount, taxRate);
  return {
    subtotal,
    discount,
    taxAmount,
    grandTotal: calculateGrandTotal(subtotal, discount, taxAmount),
  };
};

// ---------- Invoice numbering ----------
// Picks max numeric suffix of existing invoices + 1 (collision-safe after deletes).
export const generateInvoiceNumber = (invoices) => {
  const maxNum = invoices.reduce((max, inv) => {
    const match = String(inv.invoiceNumber || '').match(/(\d+)$/);
    const n = match ? parseInt(match[1], 10) : 0;
    return n > max ? n : max;
  }, 0);
  return `INV-${String(maxNum + 1).padStart(4, '0')}`;
};

// ---------- Profit (unified across Dashboard, Reports, StatsCards) ----------
// Gross profit on a single invoice:
//   sum over items of (sale price per unit − purchase price per unit) × qty
//   minus invoice-level discount (since discount eats into our margin)
//   Tax is excluded (it's collected on customer's behalf and remitted).
export const calculateInvoiceGrossProfit = (invoice, products) => {
  const itemsProfit = (invoice.items || []).reduce((sum, item) => {
    const product = products.find(p => p.id === item.productId);
    const purchasePrice = product?.purchasePrice;
    // No purchase price set → 0 profit contribution for this item
    if (!purchasePrice) return sum;
    return sum + ((item.price || 0) - purchasePrice) * (item.quantity || 0);
  }, 0);
  return itemsProfit - (invoice.discount || 0);
};

// Total gross profit across all invoices
export const calculateTotalGrossProfit = (invoices, products) =>
  invoices.reduce((sum, inv) => sum + calculateInvoiceGrossProfit(inv, products), 0);

// Net profit = gross profit − operating expenses
export const calculateNetProfit = (invoices, products, expenses) => {
  const gross = calculateTotalGrossProfit(invoices, products);
  const exp = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  return gross - exp;
};

// Backward-compat: old calculateProfit signature kept (uses gross profit formula)
export const calculateProfit = (products, invoices) =>
  Math.round(calculateTotalGrossProfit(invoices, products));

// ---------- Credit / Udhaar ----------
// Outstanding amount on an invoice — handles full and partial credit correctly.
export const getInvoiceOutstanding = (invoice) => {
  if (!invoice) return 0;
  if (invoice.paymentStatus === 'paid') return 0;
  if (invoice.paymentStatus === 'partial_credit') return invoice.creditAmount || 0;
  if (invoice.paymentStatus === 'full_credit' || invoice.isCredit) {
    return invoice.creditAmount ?? invoice.grandTotal ?? 0;
  }
  return 0;
};

export const calculateTotalOutstanding = (invoices) =>
  invoices.reduce((sum, inv) => sum + getInvoiceOutstanding(inv), 0);


// ---------- Helpers ----------
export const isSameDay = (d1, d2) =>
  new Date(d1).toDateString() === new Date(d2).toDateString();

export const isToday = (d) => isSameDay(d, new Date());

export const getLowStockProducts = (products, threshold = 5) =>
  products.filter(p => (p.quantity || 0) <= threshold);

export const getTopSellingProducts = (products, invoices, limit = 5) => {
  const sales = {};
  invoices.forEach(inv => {
    inv.items.forEach(item => {
      if (!sales[item.productId]) {
        sales[item.productId] = {
          productId: item.productId,
          name: item.name,
          quantitySold: 0,
          revenue: 0,
        };
      }
      sales[item.productId].quantitySold += item.quantity;
      sales[item.productId].revenue += item.total;
    });
  });
  return Object.values(sales)
    .sort((a, b) => b.quantitySold - a.quantitySold)
    .slice(0, limit);
};

export const validateProduct = (product) => {
  const errors = [];
  if (!product.name || product.name.trim() === '') errors.push('Product name is required');
  if (!product.category) errors.push('Category is required');
  if (product.sellingPrice === undefined || product.sellingPrice <= 0) errors.push('Selling price must be greater than 0');
  if (product.quantity === undefined || product.quantity < 0) errors.push('Quantity must be 0 or greater');
  return { isValid: errors.length === 0, errors };
};

export const validateCustomer = (customer) => {
  const errors = [];
  if (!customer.name || customer.name.trim() === '') errors.push('Customer name is required');
  return { isValid: errors.length === 0, errors };
};
