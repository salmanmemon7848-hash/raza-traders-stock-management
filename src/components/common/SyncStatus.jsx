import React from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { Wifi, WifiOff, Loader, AlertCircle, CheckCircle } from 'lucide-react';

const SyncStatus = () => {
  const { loading, error, products, customers, invoices, expenses } = useAppContext();

  // Don't show during initial load
  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full">
        <Loader size={14} className="text-blue-600 animate-spin" />
        <span className="text-xs font-medium text-blue-700">Loading...</span>
      </div>
    );
  }

  // Show error if exists
  if (error) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-200 rounded-full" title={error}>
        <AlertCircle size={14} className="text-red-600" />
        <span className="text-xs font-medium text-red-700">Sync Error</span>
      </div>
    );
  }

  // Show success with data count
  const totalItems = (products?.length || 0) + (customers?.length || 0) + (invoices?.length || 0) + (expenses?.length || 0);

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full">
      <CheckCircle size={14} className="text-green-600" />
      <span className="text-xs font-medium text-green-700">
        Synced • {totalItems} items
      </span>
    </div>
  );
};

export default SyncStatus;
