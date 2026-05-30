import React, { forwardRef } from 'react';

const Input = forwardRef(({
  label,
  error,
  hint,
  type = 'text',
  className = '',
  required = false,
  icon,
  rightAddon,
  prefix,
  ...props
}, ref) => {
  const baseInput =
    'w-full bg-white border rounded-lg text-slate-900 placeholder-slate-400 ' +
    'text-sm sm:text-[15px] transition-colors min-h-[42px] ' +
    'focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500';

  const padLeft = icon ? 'pl-10' : prefix ? 'pl-12' : 'pl-3.5';
  const padRight = rightAddon ? 'pr-12' : 'pr-3.5';
  const borderColor = error ? 'border-danger-400' : 'border-slate-300 hover:border-slate-400';

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          {label} {required && <span className="text-danger-500">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            {icon}
          </div>
        )}
        {prefix && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 text-sm pointer-events-none">
            {prefix}
          </div>
        )}
        <input
          ref={ref}
          type={type}
          className={`${baseInput} ${padLeft} ${padRight} py-2.5 ${borderColor} ${className}`}
          {...props}
        />
        {rightAddon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 text-sm">
            {rightAddon}
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-danger-600">{error}</p>}
      {hint && !error && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
