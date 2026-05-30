import React from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const TONES = {
  success: { Icon: CheckCircle2, ring: 'border-success-200 bg-success-50',  text: 'text-success-800', iconColor: 'text-success-600' },
  error:   { Icon: AlertCircle,  ring: 'border-danger-200 bg-danger-50',    text: 'text-danger-800',  iconColor: 'text-danger-600' },
  warning: { Icon: AlertTriangle,ring: 'border-warning-200 bg-warning-50',  text: 'text-warning-800', iconColor: 'text-warning-600' },
  info:    { Icon: Info,         ring: 'border-info-200 bg-info-50',        text: 'text-info-700',    iconColor: 'text-info-600' },
};

const Notifications = () => {
  const { notifications, removeNotification } = useAppContext();
  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 left-4 sm:left-auto z-[60] flex flex-col gap-2 max-w-md sm:max-w-sm pointer-events-none">
      {notifications.map((n) => {
        const tone = TONES[n.type] || TONES.info;
        const { Icon } = tone;
        return (
          <div
            key={n.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl shadow-floating border ${tone.ring} animate-slide-in-right`}
          >
            <Icon size={20} className={`shrink-0 mt-0.5 ${tone.iconColor}`} />
            <p className={`flex-1 text-sm font-medium ${tone.text}`}>{n.message}</p>
            <button
              onClick={() => removeNotification(n.id)}
              className="shrink-0 -mr-1 p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-white/50 transition-colors"
              aria-label="Dismiss"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default Notifications;
