import React from 'react';

const VARIANTS = {
  primary:   'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 focus:ring-brand-500 shadow-sm',
  secondary: 'bg-slate-900 text-white hover:bg-slate-800 active:bg-slate-950 focus:ring-slate-500 shadow-sm',
  outline:   'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 hover:border-slate-400 focus:ring-brand-500',
  ghost:     'bg-transparent text-slate-700 hover:bg-slate-100 focus:ring-slate-300',
  success:   'bg-success-600 text-white hover:bg-success-700 focus:ring-success-500 shadow-sm',
  danger:    'bg-danger-600 text-white hover:bg-danger-700 focus:ring-danger-500 shadow-sm',
  warning:   'bg-warning-500 text-white hover:bg-warning-600 focus:ring-warning-500 shadow-sm',
  soft:      'bg-brand-50 text-brand-700 hover:bg-brand-100 focus:ring-brand-300',
};

const SIZES = {
  xs: 'px-2.5 py-1.5 text-xs gap-1.5 min-h-[32px]',
  sm: 'px-3 py-2 text-sm gap-1.5 min-h-[36px]',
  md: 'px-4 py-2.5 text-sm gap-2 min-h-[42px]',
  lg: 'px-5 py-3 text-base gap-2 min-h-[48px]',
};

const Button = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  type = 'button',
  className = '',
  icon,
  iconPosition = 'left',
  fullWidth = false,
  loading = false,
  ...props
}) => {
  const base =
    'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 ' +
    'focus:outline-none focus:ring-2 focus:ring-offset-1 ' +
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-current';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${VARIANTS[variant] || VARIANTS.primary} ${SIZES[size] || SIZES.md} ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
          <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" className="opacity-75" />
        </svg>
      )}
      {!loading && icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>}
      {children && <span className="truncate">{children}</span>}
      {!loading && icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
    </button>
  );
};

export default Button;
