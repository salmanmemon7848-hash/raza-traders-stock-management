import React from 'react';

const PageHeader = ({ title, subtitle, actions, eyebrow }) => (
  <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 pb-1">
    <div className="min-w-0">
      {eyebrow && (
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-600 mb-1">
          {eyebrow}
        </p>
      )}
      <h1 className="text-2xl sm:text-[28px] font-bold text-slate-900 leading-tight">
        {title}
      </h1>
      {subtitle && (
        <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
      )}
    </div>
    {actions && (
      <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>
    )}
  </div>
);

export default PageHeader;
