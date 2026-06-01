// App Reducer — global state mutations

export const initialState = {
  products: [],
  customers: [],
  invoices: [],
  expenses: [],
  payments: [],         // Received payments (cash inflows from customers)
  productRequests: [],  // Products customers asked for but we didn't have
  receipts: [],         // Quick credit slips (parchi) — simpler than full invoices
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

// Normalize amounts on a receipt entry. Each of total/received/pending is
// optional — we derive missing pieces using simple bookkeeping rules and
// guarantee the invariant: total = received + pending.
const normalizeReceiptAmounts = (payload) => {
  const rawTotal    = payload.totalAmount    === '' || payload.totalAmount    == null ? null : Number(payload.totalAmount);
  const rawReceived = payload.amountReceived === '' || payload.amountReceived == null ? null : Number(payload.amountReceived);
  const rawPending  = payload.pendingAmount  === '' || payload.pendingAmount  == null ? null : Number(payload.pendingAmount);

  let total    = rawTotal    ?? null;
  let received = rawReceived ?? null;
  let pending  = rawPending  ?? null;

  // Derive the missing field if exactly two are given
  if (total != null && received != null && pending == null) pending  = Math.max(0, total - received);
  if (total != null && pending  != null && received == null) received = Math.max(0, total - pending);
  if (received != null && pending != null && total == null) total = received + pending;

  // Only one field given → infer reasonable defaults
  if (total != null && received == null && pending == null) {
    // "Bill of ₹X" with no payment yet → full credit
    received = 0;
    pending  = total;
  }
  if (pending != null && total == null && received == null) {
    // "Customer owes ₹X" → full credit, no payment yet
    received = 0;
    total = pending;
  }
  if (received != null && total == null && pending == null) {
    // "Customer paid ₹X today, no remaining balance" → payment receipt
    pending = 0;
    total = received;
  }

  // Final defaults (shouldn't happen if form validates, but safe)
  total    = Math.max(0, total ?? 0);
  received = Math.max(0, Math.min(total, received ?? 0));
  pending  = Math.max(0, total - received);

  const status = pending <= 0 ? 'paid' : (received > 0 ? 'partial' : 'pending');

  return { totalAmount: total, amountReceived: received, pendingAmount: pending, status };
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
        receipts: action.payload.receipts || [],
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
    // A payment can be linked to either an invoice OR a receipt (parchi).
    case 'ADD_PAYMENT': {
      const newPayment = { ...action.payload, id: generateId(), createdAt: nowIso() };

      let updatedInvoices = state.invoices;
      let updatedReceipts = state.receipts;

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

      if (action.payload.receiptId) {
        updatedReceipts = state.receipts.map(r => {
          if (r.id !== action.payload.receiptId) return r;
          const remaining = Math.max(0, (r.pendingAmount || 0) - action.payload.amount);
          return {
            ...r,
            pendingAmount: remaining,
            status: remaining <= 0
              ? 'paid'
              : remaining < (r.totalAmount || 0) ? 'partial' : 'pending',
            updatedAt: nowIso(),
          };
        });
      }

      return {
        ...state,
        payments: [...state.payments, newPayment],
        invoices: updatedInvoices,
        receipts: updatedReceipts,
      };
    }

    case 'UPDATE_PAYMENT':
      return {
        ...state,
        payments: state.payments.map(p =>
          p.id === action.payload.id ? { ...p, ...action.payload, updatedAt: nowIso() } : p
        ),
      };

    // Deleting a payment must REVERSE its effect on the linked invoice/receipt —
    // restore the pending amount. Otherwise it would still show as paid but the
    // money never came in.
    case 'DELETE_PAYMENT': {
      const paymentToDelete = state.payments.find(p => p.id === action.payload);
      let updatedInvoices = state.invoices;
      let updatedReceipts = state.receipts;

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

      if (paymentToDelete?.receiptId) {
        updatedReceipts = state.receipts.map(r => {
          if (r.id !== paymentToDelete.receiptId) return r;
          const restored = Math.min(
            r.totalAmount || 0,
            (r.pendingAmount || 0) + paymentToDelete.amount
          );
          return {
            ...r,
            pendingAmount: restored,
            status: restored <= 0
              ? 'paid'
              : restored < (r.totalAmount || 0) ? 'partial' : 'pending',
            updatedAt: nowIso(),
          };
        });
      }

      return {
        ...state,
        payments: state.payments.filter(p => p.id !== action.payload),
        invoices: updatedInvoices,
        receipts: updatedReceipts,
      };
    }

    // ---------------- RECEIPTS (flexible customer transaction log) ----------------
    // Each receipt can record THREE things, all optional:
    //   amountReceived → cash customer paid you today
    //   pendingAmount  → cash customer still owes
    //   totalAmount    → full bill total (auto-derived if blank)
    //
    // Common patterns:
    //   • Pure payment receipt:  amountReceived=5000, pending=0  → "Mr Khan paid ₹5,000 today"
    //   • Pure credit slip:      total=10000, pending=10000      → "Mr Khan owes ₹10,000"
    //   • Mixed:                 total=10000, paid=3000, pending=7000
    case 'ADD_RECEIPT': {
      const normalized = normalizeReceiptAmounts(action.payload);
      const newReceipt = {
        ...action.payload,
        ...normalized,
        id: generateId(),
        date: action.payload.date || nowIso(),
        createdAt: nowIso(),
      };
      return { ...state, receipts: [newReceipt, ...state.receipts] };
    }

    case 'UPDATE_RECEIPT': {
      const normalized = normalizeReceiptAmounts(action.payload);
      return {
        ...state,
        receipts: state.receipts.map(r =>
          r.id === action.payload.id
            ? { ...r, ...action.payload, ...normalized, updatedAt: nowIso() }
            : r
        ),
      };
    }

    case 'DELETE_RECEIPT':
      return { ...state, receipts: state.receipts.filter(r => r.id !== action.payload) };

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
