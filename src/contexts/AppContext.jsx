import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { appReducer, initialState } from './appReducer';
import { initialProducts, initialCustomers, initialInvoices, initialSettings } from '../data/initialData';
import { saveDataToCloud, getDataFromCloud, subscribeToDataChanges } from '../services/firebaseService';

const AppContext = createContext(null);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load data from localStorage on mount (with cloud sync fallback)
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('🔄 Loading data...');
        dispatch({ type: 'SET_LOADING', payload: true });
        
        // First, try to load from cloud (Supabase)
        console.log('📡 Fetching data from Supabase...');
        const cloudData = await getDataFromCloud();
        
        if (cloudData) {
          console.log('✅ Loaded data from cloud:', {
            products: cloudData.products?.length || 0,
            customers: cloudData.customers?.length || 0,
            invoices: cloudData.invoices?.length || 0,
            expenses: cloudData.expenses?.length || 0,
            payments: cloudData.payments?.length || 0
          });
          dispatch({ type: 'LOAD_DATA', payload: cloudData });
          dispatch({ type: 'SET_LOADING', payload: false });
          return;
        }
        
        console.log('⚠️ No cloud data found, checking localStorage...');
        
        // Fallback to localStorage if no cloud data
        const storedData = localStorage.getItem('razaTradersData');
        const dataClearedFlag = localStorage.getItem('dataCleared');
        
        if (dataClearedFlag === 'true') {
          console.log('🗑️ Data was cleared, starting fresh');
          localStorage.removeItem('dataCleared');
          dispatch({ type: 'SET_LOADING', payload: false });
          return;
        }
        
        if (storedData) {
          console.log('✅ Loaded data from localStorage');
          const parsedData = JSON.parse(storedData);
          dispatch({ type: 'LOAD_DATA', payload: parsedData });
          
          // Sync localStorage data to cloud
          console.log('📤 Syncing localStorage data to cloud...');
          await saveDataToCloud(parsedData);
        } else {
          console.log('🆕 No data found, initializing with defaults');
          dispatch({
            type: 'LOAD_DATA',
            payload: {
              products: initialProducts,
              customers: initialCustomers,
              invoices: initialInvoices,
              expenses: [],
              payments: [],
              settings: initialSettings
            }
          });
        }
        
        dispatch({ type: 'SET_LOADING', payload: false });
      } catch (error) {
        console.error('❌ Error loading data:', error);
        dispatch({ type: 'SET_LOADING', payload: false });
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load data: ' + error.message });
        
        // Try loading from localStorage as fallback
        try {
          const storedData = localStorage.getItem('razaTradersData');
          if (storedData) {
            console.log('🔄 Loading from localStorage after cloud error');
            dispatch({ type: 'LOAD_DATA', payload: JSON.parse(storedData) });
          }
        } catch (localError) {
          console.error('❌ localStorage also failed:', localError);
        }
      }
    };
    
    loadData();
  }, []);

  // Save data to localStorage AND cloud whenever state changes
  useEffect(() => {
    const saveData = async () => {
      try {
        const dataToSave = {
          products: state.products,
          customers: state.customers,
          invoices: state.invoices,
          expenses: state.expenses,
          payments: state.payments,
          settings: state.settings
        };
        
        // Save to localStorage (for offline support)
        localStorage.setItem('razaTradersData', JSON.stringify(dataToSave));
        
        // Save to cloud (for cross-device sync)
        await saveDataToCloud(dataToSave);
        
        console.log('💾 Data saved successfully:', {
          products: state.products.length,
          customers: state.customers.length,
          invoices: state.invoices.length,
          expenses: state.expenses.length,
          payments: state.payments.length
        });
      } catch (error) {
        console.error('❌ Error saving data:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to save data to cloud: ' + error.message });
      }
    };
    
    saveData();
  }, [state.products, state.customers, state.invoices, state.expenses, state.payments, state.settings]);
  
  // Subscribe to real-time updates from cloud
  useEffect(() => {
    console.log('📡 Setting up real-time Supabase sync...');
    const unsubscribe = subscribeToDataChanges((cloudData) => {
      console.log('🔄 Real-time update received from cloud:', {
        products: cloudData.products?.length || 0,
        customers: cloudData.customers?.length || 0,
        invoices: cloudData.invoices?.length || 0,
        expenses: cloudData.expenses?.length || 0,
        payments: cloudData.payments?.length || 0
      });
      dispatch({ type: 'LOAD_DATA', payload: cloudData });
    });
    
    return () => {
      console.log('🔌 Cleaning up real-time subscription');
      unsubscribe();
    };
  }, []);

  // Auto-remove notifications after 5 seconds
  useEffect(() => {
    if (state.notifications.length > 0) {
      const timer = setTimeout(() => {
        dispatch({ type: 'CLEAR_NOTIFICATIONS' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [state.notifications]);

  const addNotification = (type, message) => {
    dispatch({ type: 'ADD_NOTIFICATION', payload: { type, message } });
  };

  const success = (message) => addNotification('success', message);
  const error = (message) => addNotification('error', message);
  const info = (message) => addNotification('info', message);

  const value = {
    ...state,
    dispatch,
    success,
    error,
    info,
    removeNotification: (id) => dispatch({ type: 'REMOVE_NOTIFICATION', payload: id }),
    resetData: () => dispatch({ type: 'RESET_DATA' })
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
