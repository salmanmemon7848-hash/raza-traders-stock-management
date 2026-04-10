import React from 'react';
import { Bell, Menu } from 'lucide-react';
import SyncStatus from '../common/SyncStatus';

const Header = ({ onMenuClick, title }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
      <div className="flex items-center justify-between px-3 sm:px-4 md:px-6 py-3 sm:py-4">
        <div className="flex items-center flex-1 min-w-0">
          {/* Mobile Menu Button - Larger touch target */}
          <button
            onClick={onMenuClick}
            className="lg:hidden mr-3 sm:mr-4 text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors touch-target-large"
            aria-label="Open menu"
          >
            <Menu size={24} />
          </button>
          
          {/* Page Title - Responsive sizing */}
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 truncate">{title}</h1>
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
          {/* Sync Status Indicator */}
          <SyncStatus />
          
          {/* Notifications - Better mobile sizing */}
          <button 
            className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100 touch-target-large"
            aria-label="Notifications"
          >
            <Bell size={20} className="sm:size-6" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          
          {/* User Profile - Hide on small mobile, show on larger screens */}
          <div className="hidden sm:flex items-center space-x-2 md:space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold text-sm sm:text-base">
              A
            </div>
            <div className="hidden md:block">
              <p className="text-xs sm:text-sm font-semibold text-gray-900">Admin</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
