// Initial sample data for the application

export const initialProducts = [
  {
    id: '1',
    name: 'Office Chair Executive',
    category: 'Furniture',
    purchasePrice: 12000,
    sellingPrice: 15000,
    quantity: 25,
    modelNumber: 'OC-001',
    createdAt: new Date('2024-01-15').toISOString(),
    updatedAt: new Date('2024-01-15').toISOString()
  },
  {
    id: '2',
    name: 'Dining Table 6-Seater',
    category: 'Furniture',
    purchasePrice: 38000,
    sellingPrice: 45000,
    quantity: 8,
    modelNumber: 'DT-006',
    createdAt: new Date('2024-01-20').toISOString(),
    updatedAt: new Date('2024-01-20').toISOString()
  },
  {
    id: '3',
    name: 'Samsung 55" 4K TV',
    category: 'Electronics',
    purchasePrice: 55000,
    sellingPrice: 65000,
    quantity: 12,
    modelNumber: 'SAM-55-4K',
    createdAt: new Date('2024-02-01').toISOString(),
    updatedAt: new Date('2024-02-01').toISOString()
  },
  {
    id: '4',
    name: 'Wireless Bluetooth Headphones',
    category: 'Electronics',
    purchasePrice: 2800,
    sellingPrice: 3500,
    quantity: 50,
    modelNumber: 'WBH-PRO',
    createdAt: new Date('2024-02-05').toISOString(),
    updatedAt: new Date('2024-02-05').toISOString()
  },
  {
    id: '5',
    name: 'Bookshelf Modern',
    category: 'Furniture',
    purchasePrice: 6500,
    sellingPrice: 8000,
    quantity: 3,
    modelNumber: 'BS-MOD',
    createdAt: new Date('2024-02-10').toISOString(),
    updatedAt: new Date('2024-02-10').toISOString()
  }
];

export const initialCustomers = [
  {
    id: '1',
    name: 'Ahmed Khan',
    phone: '0300-1234567',
    address: '123 Main Street, Karachi',
    createdAt: new Date('2024-01-10').toISOString(),
    totalSpent: 75000,
    purchaseHistory: [
      {
        invoiceId: 'INV-001',
        date: new Date('2024-01-10').toISOString(),
        amount: 75000
      }
    ]
  },
  {
    id: '2',
    name: 'Fatima Ali',
    phone: '0321-9876543',
    address: '456 Park Avenue, Lahore',
    createdAt: new Date('2024-01-25').toISOString(),
    totalSpent: 45000,
    purchaseHistory: [
      {
        invoiceId: 'INV-002',
        date: new Date('2024-01-25').toISOString(),
        amount: 45000
      }
    ]
  },
  {
    id: '3',
    name: 'Muhammad Hassan',
    phone: '0333-5551234',
    address: '789 Club Road, Islamabad',
    createdAt: new Date('2024-02-05').toISOString(),
    totalSpent: 130000,
    purchaseHistory: [
      {
        invoiceId: 'INV-003',
        date: new Date('2024-02-05').toISOString(),
        amount: 130000
      }
    ]
  }
];

export const initialInvoices = [
  {
    id: '1',
    invoiceNumber: 'INV-001',
    customer: {
      id: '1',
      name: 'Ahmed Khan',
      phone: '0300-1234567',
      address: '123 Main Street, Karachi'
    },
    items: [
      {
        productId: '1',
        name: 'Office Chair Executive',
        quantity: 5,
        price: 15000,
        total: 75000
      }
    ],
    subtotal: 75000,
    discount: 0,
    taxRate: 0,
    taxAmount: 0,
    grandTotal: 75000,
    createdAt: new Date('2024-01-10').toISOString()
  },
  {
    id: '2',
    invoiceNumber: 'INV-002',
    customer: {
      id: '2',
      name: 'Fatima Ali',
      phone: '0321-9876543',
      address: '456 Park Avenue, Lahore'
    },
    items: [
      {
        productId: '2',
        name: 'Dining Table 6-Seater',
        quantity: 1,
        price: 45000,
        total: 45000
      }
    ],
    subtotal: 45000,
    discount: 0,
    taxRate: 0,
    taxAmount: 0,
    grandTotal: 45000,
    createdAt: new Date('2024-01-25').toISOString()
  },
  {
    id: '3',
    invoiceNumber: 'INV-003',
    customer: {
      id: '3',
      name: 'Muhammad Hassan',
      phone: '0333-5551234',
      address: '789 Club Road, Islamabad'
    },
    items: [
      {
        productId: '3',
        name: 'Samsung 55" 4K TV',
        quantity: 2,
        price: 65000,
        total: 130000
      }
    ],
    subtotal: 130000,
    discount: 0,
    taxRate: 0,
    taxAmount: 0,
    grandTotal: 130000,
    createdAt: new Date('2024-02-05').toISOString()
  }
];

export const initialSettings = {
  lowStockThreshold: 5,
  companyName: 'Raza Traders',
  companyAddress: 'Main Market, City Center',
  companyPhone: '0300-1234567',
  companyEmail: 'info@razatraders.com',
  gstNumber: 'NTN-1234567-8'
};
