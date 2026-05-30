// Default settings for a fresh installation.
// No sample products/customers/invoices — the app starts clean.

export const initialProducts = [];
export const initialCustomers = [];
export const initialInvoices = [];

export const initialSettings = {
  lowStockThreshold: 5,
  companyName: 'Raza Traders',
  companyAddress: '',
  companyPhone: '',
  companyEmail: '',
  gstNumber: '',
  defaultGstRate: 18,
  expenseCategories: [
    'Rent',
    'Electricity Bill',
    'Staff Salary',
    'Transport / Delivery',
    'Maintenance / Repair',
  ],
};
