// App Reducer — global state mutations

export const initialState = {
  products: [],
  customers: [],
  invoices: [],
  expenses: [],
  payments: [],         // Received payments (cash inflows from customers)
  productRequests: [],  // Products customers asked for but we didn't have
  settings: {
    lowStockThreshold: 5,
    companyName: 'Raza Traders',
    companyAddress: '',
    companyPhone: '',
    companyEmail: '',
    gstNumber: '',
    defaultGstRate: 18,
    expenseCategories: [],
  },
  notifications: [],
  loading: false,
  error: null,
};

const generateId = () =>
  `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

const nowIso = () => new Date().toISOString();

// Recompute payment status from creditAmount + grandTotal
const derivePaymentStatus = (grandTotal, creditAmount) => {
  if (creditAmount <= 0) return 'paid';
  if (creditAmount >= grandTotal) return 'full_credit';
  return 'partial_credit';
};

export const appReducer = (state, action) => {
  switch (action.type) {
    case 'LOAD_DATA':
      return {
        ...state,
        products: action.payload.products || [],
        customers: action.payload.customers || [],
        invoices: action.payload.invoices || [],
        expenses: action.payload.expenses || [],
        payments: action.payload.payments || [],
        productRequests: action.payload.productRequests || [],
        settings: { ...state.settings, ...(action.payload.settings || {}) },
      };

    // ---------------- PRODUCTS ----------------
    case 'ADD_PRODUCT': {
      const newProduct = {
        ...action.payload,
        id: generateId(),
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };
      return { ...state, products: [...state.products, newProduct], lastAddedProductId: newProduct.id };
    }

    case 'UPDATE_PRODUCT':
      return {
        ...state,
        products: state.products.map(p =>
          p.id === action.payload.id ? { ...p, ...action.payload, updatedAt: nowIso() } : p
        ),
      };

    case 'DELETE_PRODUCT':
      return {
        ...state,
        products: state.products.filter(p => p.id !== action.payload),
      };

    // ---------------- CUSTOMERS ----------------
    case 'ADD_CUSTOMER': {
      const newCustomer = {
        ...action.payload,
        id: generateId(),
        createdAt: nowIso(),
        totalSpent: 0,
        purchaseHistory: [],
      };
      return { ...state, customers: [...state.customers, newCustomer] };
    }

    case 'UPDATE_CUSTOMER':
      return {
        ...state,
        customers: state.customers.map(c =>
          c.id === action.payload.id ? { ...c, ...action.payload, updatedAt: nowIso() } : c
        ),
      };

    case 'DELETE_CUSTOMER':
      return { ...state, customers: state.customers.filter(c => c.id !== action.payload) };

    // ---------------- INVOICES ----------------
    // ADD_INVOICE handles stock reduction AND customer history update in one place.
    // Caller (BillingSystem) must NOT also dispatch UPDATE_PRODUCT — that was the
    // double-deduction bug.
    case 'ADD_INVOICE': {
      const { invoiceData, updateCustomer = true } = action.payload;
      const fullInvoice = { ...invoiceData, id: invoiceData.id || generateId() };

      let updatedCustomers = state.customers;
      if (updateCustomer && fullInvoice.customer?.id) {
        updatedCustomers = state.customers.map(c =>
          c.id === fullInvoice.customer.id
            ? {
                ...c,
                totalSpent: (c.totalSpent || 0) + (fullInvoice.grandTotal || 0),
                purchaseHistory: [
                  ...(c.purchaseHistory || []),
                  {
                    invoiceId: fullInvoice.invoiceNumber,
                    date: fullInvoice.createdAt,
                    amount: fullInvoice.grandTotal,
                  },
                ],
              }
            : c
        );
      }

      const updatedProducts = state.products.map(product => {
        const item = (fullInvoice.items || []).find(it => it.productId === product.id);
        if (!item) return product;
        return {
          ...product,
          quantity: Math.max(0, (product.quantity || 0) - item.quantity),
          updatedAt: nowIso(),
        };
      });

      return {
        ...state,
        invoices: [...state.invoices, fullInvoice],
        customers: updatedCustomers,
        products: updatedProducts,
      };
    }

    case 'UPDATE_INVOICE':
      return {
        ...state,
        invoices: state.invoices.map(inv =>
          inv.id === action.payload.id ? { ...inv, ...action.payload, updatedAt: nowIso() } : inv
        ),
      };

    case 'DELETE_INVOICE':
      return { ...state, invoices: state.invoices.filter(inv => inv.id !== action.payload) };

    // ---------------- SETTINGS ----------------
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };

    // ---------------- NOTIFICATIONS ----------------
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [
          ...state.notifications,
          {
            id: generateId(),
            type: action.payload.type,
            message: action.payload.message,
            timestamp: nowIso(),
          },
        ],
      };

    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload),
      };

    case 'CLEAR_NOTIFICATIONS':
      return { ...state, notifications: [] };

    case 'SET_LOADING':
      return { ...state, loading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    case 'RESET_DATA':
      return { ...initialState, settings: state.settings };

    case 'CLEAR_PRODUCTS':
      return { ...state, products: [] };

    case 'CLEAR_CUSTOMERS':
      return { ...state, customers: [] };

    case 'CLEAR_EXPENSES':
      return { ...state, expenses: [] };

    // ---------------- EXPENSES ----------------
    case 'ADD_EXPENSE': {
      const newExpense = { ...action.payload, id: generateId(), createdAt: nowIso() };
      return { ...state, expenses: [...state.expenses, newExpense] };
    }

    case 'UPDATE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.map(e =>
          e.id === action.payload.id ? { ...e, ...action.payload, updatedAt: nowIso() } : e
        ),
      };

    case 'DELETE_EXPENSE':
      return { ...state, expenses: state.expenses.filter(e => e.id !== action.payload) };

    case 'ADD_EXPENSE_CATEGORY': {
      const cats = state.settings.expenseCategories || [];
      if (cats.includes(action.payload)) return state;
      return {
        ...state,
        settings: { ...state.settings, expenseCategories: [...cats, action.payload] },
      };
    }

    case 'DELETE_EXPENSE_CATEGORY': {
      const cats = state.settings.expenseCategories || [];
      return {
        ...state,
        settings: {
          ...state.settings,
          expenseCategories: cats.filter(c => c !== action.payload),
        },
      };
    }

    // ---------------- PAYMENTS (received from customers) ----------------
    case 'ADD_PAYMENT': {
      const newPayment = { ...action.payload, id: generateId(), createdAt: nowIso() };

      let updatedInvoices = state.invoices;
      if (action.payload.invoiceId) {
        updatedInvoices = state.invoices.map(inv => {
          if (inv.id !== action.payload.invoiceId) return inv;
          const remaining = Math.max(0, (inv.creditAmount || 0) - action.payload.amount);
          return {
            ...inv,
            creditAmount: remaining,
            paymentStatus: derivePaymentStatus(inv.grandTotal, remaining),
            isCredit: remaining > 0,
            updatedAt: nowIso(),
          };
        });
      }

      return { ...state, payments: [...state.payments, newPayment], invoices: updatedInvoices };
    }

    case 'UPDATE_PAYMENT':
      return {
        ...state,
        payments: state.payments.map(p =>
          p.id === action.payload.id ? { ...p, ...action.payload, updatedAt: nowIso() } : p
        ),
      };

    // Deleting a payment must REVERSE its effect on the linked invoice — restore
    // creditAmount and recompute paymentStatus. Otherwise the invoice still shows
    // as paid but the money never came in.
    case 'DELETE_PAYMENT': {
      const paymentToDelete = state.payments.find(p => p.id === action.payload);
      let updatedInvoices = state.invoices;
      if (paymentToDelete?.invoiceId) {
        updatedInvoices = state.invoices.map(inv => {
          if (inv.id !== paymentToDelete.invoiceId) return inv;
          const restored = Math.min(
            inv.grandTotal || 0,
            (inv.creditAmount || 0) + paymentToDelete.amount
          );
          return {
            ...inv,
            creditAmount: restored,
            paymentStatus: derivePaymentStatus(inv.grandTotal, restored),
            isCredit: restored > 0,
            updatedAt: nowIso(),
          };
        });
      }
      return {
        ...state,
        payments: state.payments.filter(p => p.id !== action.payload),
        invoices: updatedInvoices,
      };
    }

    // ---------------- PRODUCT REQUESTS (customer wishlist) ----------------
    case 'ADD_PRODUCT_REQUEST': {
      const req = {
        ...action.payload,
        id: generateId(),
        status: action.payload.status || 'pending',
        createdAt: nowIso(),
      };
      return { ...state, productRequests: [req, ...state.productRequests] };
    }

    case 'UPDATE_PRODUCT_REQUEST':
      return {
        ...state,
        productRequests: state.productRequests.map(r =>
          r.id === action.payload.id ? { ...r, ...action.payload, updatedAt: nowIso() } : r
        ),
      };

    case 'DELETE_PRODUCT_REQUEST':
      return {
        ...state,
        productRequests: state.productRequests.filter(r => r.id !== action.payload),
      };

    default:
      return state;
  }
};
