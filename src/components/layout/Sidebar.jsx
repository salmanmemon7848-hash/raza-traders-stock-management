import React from 'react';
import {
  LayoutDashboard,
  Package,
  FileText,
  Users,
  Receipt,
  ScrollText,
  BarChart3,
  Settings as SettingsIcon,
  ClipboardList,
  X,
} from 'lucide-react';
import Logo from '../common/Logo';

const NAV_SECTIONS = [
  {
    label: 'Main',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'billing', label: 'New Bill', icon: FileText },
    ],
  },
  {
    label: 'Sales & Customers',
    items: [
      { id: 'customers', label: 'Customers', icon: Users },
      { id: 'receipts', label: 'Receipts', icon: ScrollText },
      { id: 'requests', label: 'Product Requests', icon: ClipboardList },
    ],
  },
  {
    label: 'Operations',
    items: [
      { id: 'stock', label: 'Stock', icon: Package },
      { id: 'expenses', label: 'Expenses', icon: Receipt },
      { id: 'reports', label: 'Reports', icon: BarChart3 },
    ],
  },
  {
    label: 'System',
    items: [{ id: 'settings', label: 'Settings', icon: SettingsIcon }],
  },
];

const Sidebar = ({ currentPage, onNavigate, isOpen, onClose }) => {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-[2px] lg:hidden animate-fade-in"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-40 h-full w-72 bg-white border-r border-slate-200
          transform transition-transform duration-200 ease-out
          lg:static lg:h-full lg:translate-x-0 lg:shadow-none lg:shrink-0
          ${isOpen ? 'translate-x-0 shadow-floating' : '-translate-x-full'}`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="flex flex-col h-full">
          {/* Brand */}
          <div className="flex items-center justify-between px-5 h-16 border-b border-slate-100">
            <Logo />
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
            {NAV_SECTIONS.map((section) => (
              <div key={section.label}>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-3 mb-1.5">
                  {section.label}
                </p>
                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentPage === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          onNavigate(item.id);
                          onClose();
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                          ${isActive
                            ? 'bg-brand-50 text-brand-700'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        <Icon size={18} className="shrink-0" />
                        <span className="truncate">{item.label}</span>
                        {isActive && (
                          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-600" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-slate-100">
            <p className="text-xs text-slate-400">v2.0 · Cloud-synced</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
