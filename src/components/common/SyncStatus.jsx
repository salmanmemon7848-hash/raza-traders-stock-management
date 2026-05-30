import React from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { Loader2, CheckCircle2 } from 'lucide-react';

const SyncStatus = () => {
  const { loading } = useAppContext();

  if (loading) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-info-50 text-info-600 text-xs font-medium border border-info-100">
        <Loader2 size={12} className="animate-spin" />
        <span className="hidden sm:inline">Loading</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success-50 text-success-700 text-xs font-medium border border-success-100">
      <CheckCircle2 size={12} />
      <span className="hidden sm:inline">Saved</span>
    </span>
  );
};

export default SyncStatus;
