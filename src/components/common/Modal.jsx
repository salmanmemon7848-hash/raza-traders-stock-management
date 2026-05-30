import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const SIZES = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  '2xl': 'max-w-6xl',
};

const Modal = ({ isOpen, onClose, title, subtitle, children, size = 'md', footer }) => {
  useEffect(() => {
    if (!isOpen) return;
    const onEsc = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto animate-fade-in" role="dialog" aria-modal="true">
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="flex min-h-full items-end sm:items-center justify-center p-3 sm:p-4">
        <div
          className={`relative w-full ${SIZES[size] || SIZES.md} bg-white rounded-2xl shadow-floating animate-slide-up max-h-[92vh] flex flex-col`}
        >
          {(title || subtitle) && (
            <div className="flex items-start justify-between gap-4 px-5 sm:px-6 pt-5 pb-4 border-b border-slate-100">
              <div className="min-w-0">
                {title && (
                  <h3 className="text-lg font-semibold text-slate-900 truncate">
                    {title}
                  </h3>
                )}
                {subtitle && (
                  <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
                )}
              </div>
              <button
                onClick={onClose}
                className="shrink-0 -mr-1 p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
          )}

          <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5">
            {children}
          </div>

          {footer && (
            <div className="px-5 sm:px-6 py-4 border-t border-slate-100 bg-slate-50/60 rounded-b-2xl">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
