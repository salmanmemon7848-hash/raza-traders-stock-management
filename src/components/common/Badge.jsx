import React from 'react';

const VARIANTS = {
  success: 'bg-success-50 text-success-700 border border-success-100',
  danger:  'bg-danger-50 text-danger-700 border border-danger-100',
  warning: 'bg-warning-50 text-warning-700 border border-warning-100',
  info:    'bg-info-50 text-info-600 border border-info-100',
  neutral: 'bg-slate-100 text-slate-700 border border-slate-200',
  brand:   'bg-brand-50 text-brand-700 border border-brand-100',
};

const Badge = ({ children, variant = 'neutral', icon, className = '' }) => (
  <span
    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
      VARIANTS[variant] || VARIANTS.neutral
    } ${className}`}
  >
    {icon && <span className="shrink-0">{icon}</span>}
    {children}
  </span>
);

export default Badge;
