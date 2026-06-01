import React from 'react';
import { Menu, Plus, Moon } from 'lucide-react';
import SyncStatus from '../common/SyncStatus';
import Button from '../common/Button';

const Header = ({
  onMenuClick,
  title,
  onQuickAction,
  quickActionLabel = 'New Bill',
  onCloseShop,
}) => {
  return (
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-slate-200">
      <div className="flex items-center justify-between gap-3 px-3 sm:px-5 h-16">
        <div className="flex items-center min-w-0 gap-2">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
          <h1 className="text-base sm:text-lg font-semibold text-slate-900 truncate">
            {title}
          </h1>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <SyncStatus />
          {onCloseShop && (
            <Button
              size="sm"
              variant="outline"
              onClick={onCloseShop}
              icon={<Moon size={16} />}
              className="hidden md:inline-flex"
              title="Daily closing summary"
            >
              Close Shop
            </Button>
          )}
          {onCloseShop && (
            <button
              onClick={onCloseShop}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Close Shop"
              title="Daily closing summary"
            >
              <Moon size={20} />
            </button>
          )}
          {onQuickAction && (
            <Button
              size="sm"
              onClick={onQuickAction}
              icon={<Plus size={16} />}
              className="hidden sm:inline-flex"
            >
              {quickActionLabel}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
