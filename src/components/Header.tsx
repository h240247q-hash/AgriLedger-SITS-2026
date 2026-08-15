import React, { useState, useEffect } from 'react';
import { Search, Bell, MessageSquare, RefreshCw, User, LogOut, Settings, Menu } from 'lucide-react';
import { UserProfile, UserRole } from '../types';

interface HeaderProps {
  currentUser: UserProfile;
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onReset: () => void;
  onOpenProfile: () => void;
  onLogout: () => void;
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  currentRole,
  onRoleChange,
  onReset,
  onOpenProfile,
  onLogout,
  onToggleSidebar,
}) => {
  const [clock, setClock] = useState<string>('');
  const [showUserDropdown, setShowUserDropdown] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      setClock(new Date().toTimeString().split(' ')[0]);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'farmer':
        return 'Smallholder Farmer';
      case 'dealer':
        return 'Agro-Dealer Hub';
      case 'supplier':
        return 'Input Supplier';
      case 'admin':
        return 'AGRITEX Officer';
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 px-3 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-20 shadow-2xs gap-2">
      <div className="flex items-center gap-2 min-w-0">
        {/* Sidebar Toggle: mobile/tablet only */}
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-1.5 -ml-1 text-slate-600 hover:bg-slate-100 rounded-md transition-colors cursor-pointer shrink-0"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search Input: hidden on the smallest screens, grows back in above sm */}
        <div className="relative hidden sm:block w-40 md:w-72 lg:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search QR codes, trucks, batch IDs..."
            className="w-full pl-10 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 placeholder-slate-400"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* System Clock */}
        <span className="hidden lg:inline-block text-xs font-mono font-medium text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md">
          {clock || '00:00:00'}
        </span>

        {/* Role Selector */}
        <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-md px-2 py-1">
          <span className="hidden sm:inline text-[10px] text-slate-400 font-semibold uppercase px-1">View:</span>
          <select
            value={currentRole}
            onChange={(e) => onRoleChange(e.target.value as UserRole)}
            className="text-xs font-semibold text-slate-800 bg-transparent outline-none cursor-pointer max-w-[92px] sm:max-w-none"
          >
            <option value="farmer">Smallholder Farmer Page</option>
            <option value="dealer">Agro-Dealer Hub Page</option>
            <option value="supplier">Input Supplier Page</option>
            <option value="admin">AGRITEX System Admin Page</option>
          </select>
        </div>

        {/* Reset Values Button */}
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 px-2.5 py-1.5 rounded-md transition-colors cursor-pointer shadow-2xs shrink-0"
          title="Reset database values"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Reset</span>
        </button>

        <div className="hidden sm:block h-5 w-px bg-slate-200"></div>

        {/* Icons */}
        <div className="hidden sm:flex items-center gap-1 text-slate-600">
          <button className="relative p-1.5 hover:bg-slate-100 rounded-md transition-colors cursor-pointer">
            <Bell className="w-4 h-4 text-slate-600" />
            <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-blue-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center border border-white">
              5
            </span>
          </button>
          <button className="hidden lg:inline-flex p-1.5 hover:bg-slate-100 rounded-md transition-colors cursor-pointer">
            <MessageSquare className="w-4 h-4 text-slate-600" />
          </button>
        </div>

        {/* User Dropdown Badge */}
        <div className="relative">
          <div
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center gap-2.5 pl-0 sm:pl-2 sm:border-l border-slate-200 cursor-pointer hover:opacity-90 transition-opacity"
          >
            <div className="text-right hidden md:block">
              <h4 className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[140px]">
                {currentUser.name}
              </h4>
              <span className="text-[10px] font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-xs inline-block">
                {getRoleLabel(currentRole)}
              </span>
            </div>
            <div className="w-8 h-8 rounded-md bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs shrink-0">
              {currentUser.avatarInitials}
            </div>
          </div>

          {/* User Menu Popup */}
          {showUserDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-lg shadow-xl py-1 z-30 animate-fade-in">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900">{currentUser.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{currentUser.location}</p>
              </div>

              <button
                onClick={() => {
                  setShowUserDropdown(false);
                  onOpenProfile();
                }}
                className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-medium"
              >
                <Settings className="w-3.5 h-3.5 text-slate-500" />
                <span>Edit Profile & Account</span>
              </button>

              <button
                onClick={() => {
                  setShowUserDropdown(false);
                  onLogout();
                }}
                className="w-full px-3 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer font-medium border-t border-slate-100"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-500" />
                <span>Switch User / Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
