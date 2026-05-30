import React from 'react';
import { ChevronDown } from 'lucide-react';

const Select = ({ label, error, hint, required, className = '', children, ...props }) => (
  <div className="w-full">
    {label && (
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label} {required && <span className="text-danger-500">*</span>}
      </label>
    )}
    <div className="relative">
      <select
        className={`w-full appearance-none px-3.5 py-2.5 pr-10 bg-white border rounded-lg
          text-slate-900 text-sm sm:text-[15px] transition-colors min-h-[42px]
          focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500
          ${error ? 'border-danger-400' : 'border-slate-300 hover:border-slate-400'} ${className}`}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        size={16}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
      />
    </div>
    {error && <p className="mt-1 text-xs text-danger-600">{error}</p>}
    {hint && !error && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
  </div>
);

export default Select;
