import React, { useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { LogOut, Settings, Sprout, Building2, Truck, Landmark, X } from 'lucide-react';

interface SidebarProps {
  currentUser: UserProfile;
  currentRole: UserRole;
  alertCount: number;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openModal: (modalId: string) => void;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentUser,
  currentRole,
  alertCount,
  activeTab,
  setActiveTab,
  openModal,
  onLogout,
  isOpen,
  onClose,
}) => {
  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'farmer':
        return { label: 'Smallholder Farmer', icon: <Sprout className="w-3.5 h-3.5 text-emerald-400" /> };
      case 'dealer':
        return { label: 'Agro-Dealer Hub', icon: <Building2 className="w-3.5 h-3.5 text-blue-400" /> };
      case 'supplier':
        return { label: 'Input Supplier', icon: <Truck className="w-3.5 h-3.5 text-amber-400" /> };
      case 'admin':
        return { label: 'AGRITEX System Admin', icon: <Landmark className="w-3.5 h-3.5 text-indigo-400" /> };
    }
  };

  const roleInfo = getRoleBadge(currentRole);

  // Drive open/closed state via inline styles rather than Tailwind's
  // translate-x-* utilities: this app's cascade was making those utilities
  // resolve to the wrong value on this element for reasons that didn't
  // reproduce in isolation, so inline styles (unambiguous, always-correct
  // specificity) are used instead. Desktop tracked via matchMedia so the
  // drawer transform never fights the "always visible" desktop layout.
  const [isDesktop, setIsDesktop] = useState<boolean>(
    () => typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches
  );

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const recompute = () => setIsDesktop(mq.matches);
    // Belt and suspenders: some environments resize the viewport (e.g. via
    // devtools/CDP viewport overrides) without firing matchMedia's own
    // 'change' event, so a plain window 'resize' listener is kept too.
    mq.addEventListener('change', recompute);
    window.addEventListener('resize', recompute);
    return () => {
      mq.removeEventListener('change', recompute);
      window.removeEventListener('resize', recompute);
    };
  }, []);

  const effectivelyOpen = isDesktop || isOpen;

  // Every nav action closes the mobile drawer too (a no-op on desktop, where
  // the sidebar is always visible regardless of isOpen).
  const nav = (fn: () => void) => () => {
    fn();
    onClose();
  };

  return (
    <>
      {/* Backdrop: mobile only, dims content and closes the drawer on tap */}
      {isOpen && !isDesktop && (
        <div
          className="fixed inset-0 bg-slate-950/60 z-30"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className="w-64 bg-slate-900 text-slate-300 p-4 flex flex-col justify-between shrink-0 min-h-screen border-r border-slate-800 overflow-y-auto"
        style={{
          position: isDesktop ? 'static' : 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 40,
          transform: effectivelyOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 200ms ease-in-out',
        }}
      >
        <div>
          {/* Brand Header */}
          <div className="flex items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm shrink-0">
                🌱
              </div>
              <div>
                <h2 className="text-sm font-bold text-white tracking-tight leading-tight">
                  AgriLedger-SITS
                </h2>
                <span className="text-[11px] text-slate-400 block tracking-tight">Smart Input Ledger</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="md:hidden text-slate-400 hover:text-white p-1 -mr-1 cursor-pointer"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Current Role Banner Badge */}
          <div className="mb-4 p-2.5 bg-slate-800/80 border border-slate-700/60 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-hidden">
              {roleInfo.icon}
              <div className="overflow-hidden">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block leading-none">Active View</span>
                <span className="text-xs font-bold text-white truncate block">{roleInfo.label}</span>
              </div>
            </div>
          </div>

          {/* Navigation List */}
          <ul className="space-y-1 text-xs">
            <li
              onClick={nav(() => setActiveTab('dashboard'))}
              className={`p-2.5 rounded-md cursor-pointer flex justify-between items-center transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span>🏠</span>
                <span>{currentUser.name.split(' ')[0]}'s Page</span>
              </div>
              <span className="text-[10px] bg-slate-950/40 px-1.5 py-0.5 rounded text-slate-300 font-mono">
                Live
              </span>
            </li>

            {/* Role-tailored action items */}
            <li
              onClick={nav(() => openModal('qrScannerModal'))}
              className="p-2.5 rounded-md cursor-pointer flex justify-between items-center transition-all bg-emerald-600/15 border border-emerald-500/30 text-emerald-300 font-semibold hover:bg-emerald-600/25"
            >
              <div className="flex items-center gap-2.5">
                <span>🔍</span>
                <span>Verify Inputs (QR Scan)</span>
              </div>
            </li>

            {currentRole === 'supplier' && (
              <li
                onClick={nav(() => openModal('logisticsModal'))}
                className="p-2.5 rounded-md cursor-pointer flex justify-between items-center hover:bg-slate-800 hover:text-white transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span>🚚</span>
                  <span>Logistics & Fleet</span>
                </div>
              </li>
            )}

            {(currentRole === 'admin' || currentRole === 'dealer') && (
              <li
                onClick={nav(() => openModal('aiFraudMonitorModal'))}
                className="p-2.5 rounded-md cursor-pointer flex justify-between items-center hover:bg-slate-800 hover:text-white transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span>🛡️</span>
                  <span>AI Fraud Monitor</span>
                </div>
                <span className="bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {alertCount}
                </span>
              </li>
            )}

            {currentRole === 'farmer' && (
              <li
                onClick={nav(() => openModal('marketplaceModal'))}
                className="p-2.5 rounded-md cursor-pointer flex justify-between items-center hover:bg-slate-800 hover:text-white transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span>📈</span>
                  <span>Market Crop Prices</span>
                </div>
              </li>
            )}

            {/* Management Section */}
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mt-4 mb-2 px-1">
              Tools & Management
            </div>

            {currentRole === 'admin' && (
              <li
                onClick={nav(() => openModal('supplierRegistrationModal'))}
                className="p-2.5 rounded-md cursor-pointer flex justify-between items-center hover:bg-slate-800 hover:text-white transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span>🏭</span>
                  <span>Suppliers Registry</span>
                </div>
              </li>
            )}

            {currentRole === 'admin' && (
              <li
                onClick={nav(() => openModal('agritexOfficerModal'))}
                className="p-2.5 rounded-md cursor-pointer flex justify-between items-center transition-all bg-indigo-900/40 border border-indigo-700/40 text-indigo-200 font-semibold hover:bg-indigo-900/60"
              >
                <div className="flex items-center gap-2.5">
                  <span>🏛️</span>
                  <span>Agritex Broadcast</span>
                </div>
              </li>
            )}

            {currentRole === 'farmer' && (
              <li
                onClick={nav(() => openModal('seasonPlanningModal'))}
                className="p-2.5 rounded-md cursor-pointer flex justify-between items-center hover:bg-slate-800 hover:text-white transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span>🗺️</span>
                  <span>Season Planning</span>
                </div>
              </li>
            )}

            <li
              onClick={nav(() => openModal('profileModal'))}
              className="p-2.5 rounded-md cursor-pointer flex justify-between items-center hover:bg-slate-800 hover:text-white transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <span>⚙️</span>
                <span>My Profile Settings</span>
              </div>
            </li>

            {/* Offline Gateway */}
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mt-4 mb-2 px-1">
              Offline Mobile Gateway
            </div>

            <li
              onClick={nav(() => openModal('offlineUssdSimulationModal'))}
              className="p-2.5 rounded-md cursor-pointer flex justify-between items-center transition-all bg-amber-950/40 border border-amber-600/30 text-amber-300 font-semibold hover:bg-amber-950/60"
            >
              <div className="flex items-center gap-2.5">
                <span>📟</span>
                <span>Dial USSD Gateway (*141#)</span>
              </div>
            </li>
          </ul>
        </div>

        {/* User Profile Pill at Bottom */}
        <div className="mt-4 pt-3 border-t border-slate-800 space-y-2">
          <div
            onClick={nav(() => openModal('profileModal'))}
            className="flex items-center gap-2.5 bg-slate-800/80 hover:bg-slate-800 p-2.5 rounded-lg border border-slate-700/50 cursor-pointer transition-colors"
          >
            <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center font-bold text-xs text-white shadow-xs shrink-0">
              {currentUser.avatarInitials}
            </div>
            <div className="overflow-hidden flex-1">
              <h4 className="text-xs font-semibold text-white truncate">{currentUser.name}</h4>
              <span className="text-[10px] text-slate-400 block truncate">{currentUser.location}</span>
            </div>
            <Settings className="w-3.5 h-3.5 text-slate-400 hover:text-white" />
          </div>

          <button
            onClick={onLogout}
            className="w-full text-left px-2.5 py-1.5 text-[11px] font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-md transition-colors flex items-center justify-between cursor-pointer"
          >
            <span>Switch Account</span>
            <LogOut className="w-3 h-3" />
          </button>
        </div>
      </aside>
    </>
  );
};
