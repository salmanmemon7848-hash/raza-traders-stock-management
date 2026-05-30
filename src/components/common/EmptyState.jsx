import React from 'react';
import { Inbox } from 'lucide-react';

const EmptyState = ({
  icon: Icon = Inbox,
  title = 'Nothing here yet',
  description,
  action,
  className = '',
}) => (
  <div className={`flex flex-col items-center text-center py-10 px-4 ${className}`}>
    <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
      <Icon size={26} />
    </div>
    <h3 className="text-base font-semibold text-slate-900">{title}</h3>
    {description && (
      <p className="text-sm text-slate-500 mt-1 max-w-md">{description}</p>
    )}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

export default EmptyState;
