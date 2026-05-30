import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const TONES = {
  brand:   { ring: 'bg-brand-50 text-brand-600',     accent: 'text-brand-700' },
  success: { ring: 'bg-success-50 text-success-600', accent: 'text-success-700' },
  danger:  { ring: 'bg-danger-50 text-danger-600',   accent: 'text-danger-700' },
  warning: { ring: 'bg-warning-50 text-warning-600', accent: 'text-warning-700' },
  info:    { ring: 'bg-info-50 text-info-600',       accent: 'text-info-600' },
  neutral: { ring: 'bg-slate-100 text-slate-600',    accent: 'text-slate-900' },
};

const StatCard = ({
  label,
  value,
  icon: Icon,
  tone = 'neutral',
  delta,           // { value: '+12%', direction: 'up' | 'down' }
  hint,
  onClick,
}) => {
  const t = TONES[tone] || TONES.neutral;
  const isUp = delta?.direction === 'up';

  return (
    <div
      onClick={onClick}
      className={`stat-tile ${onClick ? 'cursor-pointer hover:shadow-elevated transition-shadow' : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        {Icon && (
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${t.ring}`}>
            <Icon size={18} />
          </div>
        )}
      </div>
      <div className="flex items-baseline gap-2 flex-wrap">
        <p className={`text-2xl sm:text-3xl font-bold num-display ${t.accent}`}>{value}</p>
        {delta && (
          <span
            className={`inline-flex items-center text-xs font-semibold gap-0.5 px-1.5 py-0.5 rounded-full
              ${isUp ? 'bg-success-50 text-success-700' : 'bg-danger-50 text-danger-700'}`}
          >
            {isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {delta.value}
          </span>
        )}
      </div>
      {hint && <p className="text-xs text-slate-500 mt-0.5">{hint}</p>}
    </div>
  );
};

export default StatCard;
