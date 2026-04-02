import React from 'react';
import { X } from 'lucide-react';

const Alert = ({ type = 'info', message, onClose }) => {
  const bgColor = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  }[type];

  return (
    <div className={`p-4 rounded-lg border ${bgColor} flex items-center justify-between`}>
      <span>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-4 hover:opacity-75 transition-opacity"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default Alert;
