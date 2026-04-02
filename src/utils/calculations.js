// Calculation utilities for the application

export const calculateSubtotal = (items) => {
  return items.reduce((sum, item) => sum + item.total, 0);
};

export const calculateDiscount = (subtotal, discountValue, discountType = 'fixed') => {
  if (!discountValue || discountValue === 0) return 0;
  
  if (discountType === 'percentage') {
    return (subtotal * discountValue) / 100;
  }
  
  return discountValue; // fixed amount
};

export const calculateTax = (amountAfterDiscount, taxRate) => {
  if (!taxRate || taxRate === 0) return 0;
  return (amountAfterDiscount * taxRate) / 100;
};

export const calculateGrandTotal = (subtotal, discount, taxAmount) => {
  return subtotal - discount + taxAmount;
};

export const calculateTotalInvoice = (items, discountValue = 0, discountType = 'fixed', taxRate = 0) => {
  const subtotal = calculateSubtotal(items);
  const discount = calculateDiscount(subtotal, discountValue, discountType);
  const amountAfterDiscount = subtotal - discount;
  const taxAmount = calculateTax(amountAfterDiscount, taxRate);
  const grandTotal = calculateGrandTotal(subtotal, discount, taxAmount);
  
  return {
    subtotal,
    discount,
    taxAmount,
    grandTotal
  };
};

export const formatCurrency = (amount) => {
  return `Rs. ${amount.toLocaleString()}`;
};

export const calculateProfit = (products, invoices) => {
  // Calculate profit based on selling price minus purchase price
  let totalProfit = 0;
  
  invoices.forEach(invoice => {
    invoice.items.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        const profitPerItem = (product.sellingPrice || 0) - (product.purchasePrice || 0);
        totalProfit += profitPerItem * item.quantity;
      }
    });
  });
  
  return Math.round(totalProfit);
};

export const getLowStockProducts = (products, threshold = 5) => {
  return products.filter(product => product.quantity <= threshold);
};

export const getTopSellingProducts = (products, invoices, limit = 5) => {
  const productSales = {};
  
  invoices.forEach(invoice => {
    invoice.items.forEach(item => {
      if (!productSales[item.productId]) {
        productSales[item.productId] = {
          productId: item.productId,
          name: item.name,
          quantitySold: 0,
          revenue: 0
        };
      }
      productSales[item.productId].quantitySold += item.quantity;
      productSales[item.productId].revenue += item.total;
    });
  });
  
  return Object.values(productSales)
    .sort((a, b) => b.quantitySold - a.quantitySold)
    .slice(0, limit);
};

export const generateInvoiceNumber = (invoices) => {
  const nextNum = invoices.length + 1;
  return `INV-${String(nextNum).padStart(3, '0')}`;
};

export const validateProduct = (product) => {
  const errors = [];
  
  if (!product.name || product.name.trim() === '') {
    errors.push('Product name is required');
  }
  
  if (!product.category) {
    errors.push('Category is required');
  }
  
  if (!product.price || product.price <= 0) {
    errors.push('Price must be greater than 0');
  }
  
  if (product.quantity === undefined || product.quantity < 0) {
    errors.push('Quantity must be 0 or greater');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateCustomer = (customer) => {
  const errors = [];
  
  if (!customer.name || customer.name.trim() === '') {
    errors.push('Customer name is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
