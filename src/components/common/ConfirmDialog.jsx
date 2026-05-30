import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { AlertTriangle } from 'lucide-react';

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  icon: Icon = AlertTriangle,
}) => {
  const tone = {
    danger:  { ring: 'bg-danger-50 text-danger-600',   btnVariant: 'danger' },
    warning: { ring: 'bg-warning-50 text-warning-600', btnVariant: 'warning' },
    info:    { ring: 'bg-info-50 text-info-600',       btnVariant: 'primary' },
  }[variant] || { ring: 'bg-danger-50 text-danger-600', btnVariant: 'danger' };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="flex items-start gap-4">
        <div className={`shrink-0 w-11 h-11 rounded-full flex items-center justify-center ${tone.ring}`}>
          <Icon size={22} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          {message && <p className="text-sm text-slate-600 mt-1.5">{message}</p>}
        </div>
      </div>
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-5">
        <Button variant="outline" onClick={onClose}>{cancelLabel}</Button>
        <Button
          variant={tone.btnVariant}
          onClick={() => {
            onConfirm?.();
            onClose?.();
          }}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
