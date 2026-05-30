import React from 'react';

export const Card = ({ children, className = '', as: Tag = 'div', ...props }) => (
  <Tag className={`card ${className}`} {...props}>
    {children}
  </Tag>
);

export const CardHeader = ({ title, subtitle, actions, icon, className = '' }) => (
  <div className={`flex items-start justify-between gap-3 px-4 sm:px-5 pt-4 sm:pt-5 ${className}`}>
    <div className="flex items-start gap-3 min-w-0">
      {icon && (
        <div className="shrink-0 w-9 h-9 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
          {icon}
        </div>
      )}
      <div className="min-w-0">
        {title && <h3 className="text-base font-semibold text-slate-900 truncate">{title}</h3>}
        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>
    {actions && <div className="shrink-0 flex items-center gap-2">{actions}</div>}
  </div>
);

export const CardBody = ({ children, className = '' }) => (
  <div className={`px-4 sm:px-5 py-4 sm:py-5 ${className}`}>{children}</div>
);

export const CardFooter = ({ children, className = '' }) => (
  <div className={`px-4 sm:px-5 py-3.5 border-t border-slate-100 ${className}`}>{children}</div>
);

export default Card;
