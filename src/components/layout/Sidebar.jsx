import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  FileText, 
  Users, 
  Settings,
  BarChart3,
  Receipt,
  ChevronLeft 
} from 'lucide-react';

const Sidebar = ({ currentPage, onNavigate, isOpen, onClose }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'stock', label: 'Stock Management', icon: Package },
    { id: 'billing', label: 'Billing System', icon: FileText },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'expenses', label: 'Expenses', icon: Receipt },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile overlay with smoother transition */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden transition-opacity duration-300"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar with improved mobile responsiveness */}
      <aside 
        className={`fixed top-0 left-0 z-30 h-full w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:shadow-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="flex flex-col h-full">
          {/* Logo - Responsive sizing */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-6 border-b border-gray-200">
            <h1 className="text-xl sm:text-2xl font-bold text-primary-700 truncate">Raza Traders</h1>
            <button 
              onClick={onClose}
              className="lg:hidden text-gray-500 hover:text-gray-700 p-2 touch-target-large"
              aria-label="Close menu"
            >
              <ChevronLeft size={24} />
            </button>
          </div>

          {/* Navigation - Better spacing on mobile */}
          <nav className="flex-1 px-3 sm:px-4 py-4 sm:py-6 overflow-y-auto space-y-1 sm:space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    onClose();
                  }}
                  className={`w-full flex items-center px-3 sm:px-4 py-3 rounded-lg transition-all text-sm sm:text-base ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 font-semibold shadow-sm'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon size={20} className="mr-3 flex-shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Footer - Compact on mobile */}
          <div className="px-3 sm:px-4 py-3 sm:py-4 border-t border-gray-200">
            <div className="flex items-center px-2 sm:px-4 py-2 text-xs sm:text-sm text-gray-600">
              <Settings size={16} className="mr-2 flex-shrink-0" />
              <span className="truncate">v1.0.0</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
