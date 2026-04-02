import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { appReducer, initialState } from './appReducer';
import { initialProducts, initialCustomers, initialInvoices, initialSettings } from '../data/initialData';

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

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const storedData = localStorage.getItem('razaTradersData');
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        dispatch({ type: 'LOAD_DATA', payload: parsedData });
      } else {
        // Load initial sample data if no stored data
        dispatch({
          type: 'LOAD_DATA',
          payload: {
            products: initialProducts,
            customers: initialCustomers,
            invoices: initialInvoices,
            settings: initialSettings
          }
        });
      }
    } catch (error) {
      console.error('Error loading data:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load data' });
    }
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    try {
      const dataToSave = {
        products: state.products,
        customers: state.customers,
        invoices: state.invoices,
        settings: state.settings
      };
      localStorage.setItem('razaTradersData', JSON.stringify(dataToSave));
    } catch (error) {
      console.error('Error saving data:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to save data' });
    }
  }, [state.products, state.customers, state.invoices, state.settings]);

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
