import React from 'react';

const Input = ({
  label,
  error,
  type = 'text',
  className = '',
  required = false,
  ...props
}) => {
  return (
    <div className="mb-3 sm:mb-4">
      {label && (
        <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        type={type}
        className={`w-full px-3 py-2.5 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent min-h-[44px] ${
          error ? 'border-red-500' : 'border-gray-300'
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-xs sm:text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default Input;
