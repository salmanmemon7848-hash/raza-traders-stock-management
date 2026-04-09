// App Reducer for managing global state

export const initialState = {
  products: [],
  customers: [],
  invoices: [],
  expenses: [],
  settings: {
    lowStockThreshold: 5,
    companyName: 'Raza Traders',
    companyAddress: '',
    companyPhone: '',
    companyEmail: '',
    gstNumber: ''
  },
  notifications: [],
  loading: false,
  error: null
};

const generateId = () => Math.random().toString(36).substr(2, 9);

export const appReducer = (state, action) => {
  switch (action.type) {
    case 'LOAD_DATA':
      return {
        ...state,
        products: action.payload.products || [],
        customers: action.payload.customers || [],
        invoices: action.payload.invoices || [],
        expenses: action.payload.expenses || [],
        settings: action.payload.settings || state.settings
      };

    case 'ADD_PRODUCT': {
      const newProduct = {
        ...action.payload,
        id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      return {
        ...state,
        products: [...state.products, newProduct]
      };
    }

    case 'UPDATE_PRODUCT': {
      return {
        ...state,
        products: state.products.map(product =>
          product.id === action.payload.id
            ? { ...product, ...action.payload, updatedAt: new Date().toISOString() }
            : product
        )
      };
    }

    case 'DELETE_PRODUCT': {
      return {
        ...state,
        products: state.products.filter(product => product.id !== action.payload)
      };
    }

    case 'ADD_CUSTOMER': {
      const newCustomer = {
        ...action.payload,
        id: generateId(),
        createdAt: new Date().toISOString(),
        totalSpent: 0,
        purchaseHistory: []
      };
      return {
        ...state,
        customers: [...state.customers, newCustomer]
      };
    }

    case 'UPDATE_CUSTOMER': {
      return {
        ...state,
        customers: state.customers.map(customer =>
          customer.id === action.payload.id
            ? { ...customer, ...action.payload, updatedAt: new Date().toISOString() }
            : customer
        )
      };
    }

    case 'DELETE_CUSTOMER': {
      return {
        ...state,
        customers: state.customers.filter(customer => customer.id !== action.payload)
      };
    }

    case 'ADD_INVOICE': {
      const { invoiceData, updateCustomer } = action.payload;
      
      // Update customer's total spent and purchase history if customer exists
      let updatedCustomers = state.customers;
      if (updateCustomer && invoiceData.customer?.id) {
        updatedCustomers = state.customers.map(customer => {
          if (customer.id === invoiceData.customer.id) {
            return {
              ...customer,
              totalSpent: customer.totalSpent + invoiceData.grandTotal,
              purchaseHistory: [
                ...customer.purchaseHistory,
                {
                  invoiceId: invoiceData.invoiceNumber,
                  date: invoiceData.createdAt,
                  amount: invoiceData.grandTotal
                }
              ]
            };
          }
          return customer;
        });
      }

      // Reduce product stock
      let updatedProducts = state.products;
      if (invoiceData.items) {
        updatedProducts = state.products.map(product => {
          const invoiceItem = invoiceData.items.find(item => item.productId === product.id);
          if (invoiceItem) {
            return {
              ...product,
              quantity: product.quantity - invoiceItem.quantity,
              updatedAt: new Date().toISOString()
            };
          }
          return product;
        });
      }

      return {
        ...state,
        invoices: [...state.invoices, invoiceData],
        customers: updatedCustomers,
        products: updatedProducts
      };
    }

    case 'UPDATE_SETTINGS': {
      return {
        ...state,
        settings: { ...state.settings, ...action.payload }
      };
    }

    case 'ADD_NOTIFICATION': {
      const notification = {
        id: generateId(),
        type: action.payload.type, // 'success' | 'error' | 'info'
        message: action.payload.message,
        timestamp: new Date().toISOString()
      };
      return {
        ...state,
        notifications: [...state.notifications, notification]
      };
    }

    case 'REMOVE_NOTIFICATION': {
      return {
        ...state,
        notifications: state.notifications.filter(
          notification => notification.id !== action.payload
        )
      };
    }

    case 'CLEAR_NOTIFICATIONS': {
      return {
        ...state,
        notifications: []
      };
    }

    case 'SET_LOADING': {
      return {
        ...state,
        loading: action.payload
      };
    }

    case 'SET_ERROR': {
      return {
        ...state,
        error: action.payload
      };
    }

    case 'RESET_DATA': {
      return {
        ...initialState,
        settings: state.settings
      };
    }

    case 'CLEAR_PRODUCTS': {
      return {
        ...state,
        products: []
      };
    }

    case 'CLEAR_CUSTOMERS': {
      return {
        ...state,
        customers: []
      };
    }

    case 'CLEAR_EXPENSES': {
      return {
        ...state,
        expenses: []
      };
    }

    case 'ADD_EXPENSE': {
      const newExpense = {
        ...action.payload,
        id: generateId(),
        createdAt: new Date().toISOString()
      };
      return {
        ...state,
        expenses: [...state.expenses, newExpense]
      };
    }

    case 'UPDATE_EXPENSE': {
      return {
        ...state,
        expenses: state.expenses.map(expense =>
          expense.id === action.payload.id
            ? { ...expense, ...action.payload, updatedAt: new Date().toISOString() }
            : expense
        )
      };
    }

    case 'DELETE_EXPENSE': {
      return {
        ...state,
        expenses: state.expenses.filter(expense => expense.id !== action.payload)
      };
    }

    case 'ADD_EXPENSE_CATEGORY': {
      const categories = state.settings.expenseCategories || [];
      if (!categories.includes(action.payload)) {
        return {
          ...state,
          settings: {
            ...state.settings,
            expenseCategories: [...categories, action.payload]
          }
        };
      }
      return state;
    }

    case 'DELETE_EXPENSE_CATEGORY': {
      const categories = state.settings.expenseCategories || [];
      return {
        ...state,
        settings: {
          ...state.settings,
          expenseCategories: categories.filter(cat => cat !== action.payload)
        }
      };
    }

    default:
      return state;
  }
};
