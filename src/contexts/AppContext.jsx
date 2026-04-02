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
        // First, try to load from cloud
        const cloudData = await getDataFromCloud();
        
        if (cloudData) {
          console.log('Loading data from cloud...');
          dispatch({ type: 'LOAD_DATA', payload: cloudData });
          return;
        }
        
        // Fallback to localStorage if no cloud data
        const storedData = localStorage.getItem('razaTradersData');
        const dataClearedFlag = localStorage.getItem('dataCleared');
        
        if (dataClearedFlag === 'true') {
          localStorage.removeItem('dataCleared');
          return;
        }
        
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          dispatch({ type: 'LOAD_DATA', payload: parsedData });
        } else {
          dispatch({
            type: 'LOAD_DATA',
            payload: {
              products: initialProducts,
              customers: initialCustomers,
              invoices: initialInvoices,
              expenses: [],
              settings: initialSettings
            }
          });
        }
      } catch (error) {
        console.error('Error loading data:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load data' });
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
          settings: state.settings
        };
        
        // Save to localStorage (for offline support)
        localStorage.setItem('razaTradersData', JSON.stringify(dataToSave));
        
        // Save to cloud (for cross-device sync)
        await saveDataToCloud(dataToSave);
      } catch (error) {
        console.error('Error saving data:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to save data' });
      }
    };
    
    saveData();
  }, [state.products, state.customers, state.invoices, state.expenses, state.settings]);
  
  // Subscribe to real-time updates from cloud
  useEffect(() => {
    const unsubscribe = subscribeToDataChanges((cloudData) => {
      console.log('Real-time update received from cloud');
      dispatch({ type: 'LOAD_DATA', payload: cloudData });
    });
    
    return () => unsubscribe();
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
