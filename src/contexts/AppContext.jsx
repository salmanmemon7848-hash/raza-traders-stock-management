import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import { appReducer, initialState } from './appReducer';
import {
  saveDataToCloud,
  getDataFromCloud,
  subscribeToDataChanges,
  clearCloudData,
} from '../services/firebaseService';

// Bump this when you want a one-time data wipe on the next deploy.
// Each device runs the wipe once when it first sees a new version.
const APP_DATA_VERSION = 'v2.0.0-fresh-start';
const VERSION_KEY = 'razaTradersAppVersion';

const AppContext = createContext(null);

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
};

const LOCAL_KEY = 'razaTradersData';
const SAVE_DEBOUNCE_MS = 600;

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Guards against sync feedback loops:
  // - hasLoadedOnce: skip save until first load completes
  // - skipNextSaveRef: when state was applied from a remote subscription event,
  //   we must NOT echo it back to the cloud (would cause an infinite ping-pong).
  const hasLoadedOnceRef = useRef(false);
  const skipNextSaveRef = useRef(false);
  const saveTimerRef = useRef(null);

  // -------- Initial load --------
  useEffect(() => {
    const loadData = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });

        // One-time data wipe on version upgrade (user-requested fresh start)
        if (localStorage.getItem(VERSION_KEY) !== APP_DATA_VERSION) {
          try {
            await clearCloudData();
          } catch (e) {
            console.warn('Cloud clear skipped:', e?.message);
          }
          localStorage.removeItem(LOCAL_KEY);
          localStorage.setItem(VERSION_KEY, APP_DATA_VERSION);
          hasLoadedOnceRef.current = true;
          dispatch({ type: 'SET_LOADING', payload: false });
          return;
        }

        const cloudData = await getDataFromCloud();
        if (cloudData && Object.keys(cloudData).length > 0) {
          skipNextSaveRef.current = true;
          dispatch({ type: 'LOAD_DATA', payload: cloudData });
        } else {
          const stored = localStorage.getItem(LOCAL_KEY);
          if (stored) {
            const parsed = JSON.parse(stored);
            skipNextSaveRef.current = true;
            dispatch({ type: 'LOAD_DATA', payload: parsed });
          }
        }
      } catch (err) {
        console.error('Load error:', err);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load data: ' + String(err?.message || err) });
        try {
          const stored = localStorage.getItem(LOCAL_KEY);
          if (stored) {
            skipNextSaveRef.current = true;
            dispatch({ type: 'LOAD_DATA', payload: JSON.parse(stored) });
          }
        } catch {}
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
        hasLoadedOnceRef.current = true;
      }
    };
    loadData();
  }, []);

  // -------- Persist on change (debounced) --------
  useEffect(() => {
    if (!hasLoadedOnceRef.current) return;
    if (skipNextSaveRef.current) {
      skipNextSaveRef.current = false;
      return;
    }

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      const dataToSave = {
        products: state.products,
        customers: state.customers,
        invoices: state.invoices,
        expenses: state.expenses,
        payments: state.payments,
        productRequests: state.productRequests,
        settings: state.settings,
      };
      try {
        localStorage.setItem(LOCAL_KEY, JSON.stringify(dataToSave));
        // Clear any stale error — localStorage is always the source of truth offline
        dispatch({ type: 'SET_ERROR', payload: null });
      } catch (err) {
        console.error('localStorage save error:', err);
      }
      // Cloud save is best-effort — failures are silent (app works offline via localStorage)
      try {
        await saveDataToCloud(dataToSave);
      } catch (err) {
        console.warn('Cloud sync unavailable:', err?.message || err);
      }
    }, SAVE_DEBOUNCE_MS);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [
    state.products,
    state.customers,
    state.invoices,
    state.expenses,
    state.payments,
    state.productRequests,
    state.settings,
  ]);

  // -------- Real-time subscription (with loop guard) --------
  useEffect(() => {
    const unsubscribe = subscribeToDataChanges((cloudData) => {
      skipNextSaveRef.current = true; // don't echo this update back
      dispatch({ type: 'LOAD_DATA', payload: cloudData });
    });
    return () => unsubscribe();
  }, []);

  // -------- Auto-clear sync errors after 5 s --------
  useEffect(() => {
    if (!state.error) return;
    const t = setTimeout(() => dispatch({ type: 'SET_ERROR', payload: null }), 5000);
    return () => clearTimeout(t);
  }, [state.error]);

  // -------- Auto-dismiss notifications --------
  useEffect(() => {
    if (state.notifications.length === 0) return;
    const t = setTimeout(() => dispatch({ type: 'CLEAR_NOTIFICATIONS' }), 4000);
    return () => clearTimeout(t);
  }, [state.notifications]);

  const addNotification = (type, message) =>
    dispatch({ type: 'ADD_NOTIFICATION', payload: { type, message } });

  const value = {
    ...state,
    dispatch,
    success: (msg) => addNotification('success', msg),
    error: (msg) => addNotification('error', msg),
    info: (msg) => addNotification('info', msg),
    warning: (msg) => addNotification('warning', msg),
    removeNotification: (id) => dispatch({ type: 'REMOVE_NOTIFICATION', payload: id }),
    resetData: () => dispatch({ type: 'RESET_DATA' }),
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
