import React, { useState } from 'react';
import { UserProfile, ActivityLog, CustomCropOffer } from '../../types';
import { Sprout, QrCode, Smartphone, ShoppingBag, Bell, AlertTriangle, ArrowUpRight, CheckCircle2 } from 'lucide-react';

interface FarmerVoucher {
  id: string;
  item: string;
  status: string;
  batch: string;
  qr: string;
}

interface FarmerDashboardViewProps {
  currentUser: UserProfile;
  openModal: (modalId: string) => void;
  isReset?: boolean;
  vouchers: FarmerVoucher[];
  cropOffers: CustomCropOffer[];
  activityLogs: ActivityLog[];
  ussdBalance: number;
  onAddVoucher: (item: string) => void;
  onVerifyVoucher: (id: string) => void;
  onPostCrop: (cropName: string, askingPrice: number, quantity: string) => void;
  onDeleteCropOffer: (id: number) => void;
  onTopUpWallet: (amount: number) => void;
  onUpdateProfile: (updatedProfile: UserProfile) => void;
}

function activityIcon(log: ActivityLog): string {
  const t = log.typeDetails.toLowerCase();
  if (log.status === 'fraud-risk') return '🚨';
  if (t.includes('verified') || t.includes('verify')) return '✅';
  if (t.includes('allocation') || t.includes('voucher')) return '🎟️';
  if (t.includes('crop') || t.includes('sold') || t.includes('deal')) return '🌾';
  if (t.includes('top-up') || t.includes('ussd') || t.includes('wallet')) return '💳';
  if (t.includes('cooperative') || t.includes('hub')) return '🏫';
  if (t.includes('registered')) return '🌱';
  return '🔐';
}

export const FarmerDashboardView: React.FC<FarmerDashboardViewProps> = ({
  currentUser,
  openModal,
  vouchers = [],
  cropOffers = [],
  activityLogs = [],
  ussdBalance,
  onAddVoucher,
  onVerifyVoucher,
  onPostCrop,
  onDeleteCropOffer,
  onTopUpWallet,
  onUpdateProfile,
}) => {
  const [isEditingHub, setIsEditingHub] = useState<boolean>(false);
  const [newCropName, setNewCropName] = useState('');
  const [newCropPrice, setNewCropPrice] = useState('');
  const [newCropQuantity, setNewCropQuantity] = useState('1.0 Ton');

  const cooperativeHub = currentUser.location || 'Murehwa Ward 12';
  const cooperativeName = currentUser.organization || 'Murehwa Grain Co-op';

  const handlePostCrop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCropName || !newCropPrice) return;
    onPostCrop(newCropName, parseFloat(newCropPrice), newCropQuantity || '1.0 Ton');
    setNewCropName('');
    setNewCropPrice('');
  };

  const handleSwitchHub = (hub: string, name: string) => {
    onUpdateProfile({ ...currentUser, location: hub, organization: name });
    setIsEditingHub(false);
  };

  const verifiedCount = vouchers.filter((v) => v.status === 'Received & Verified').length;
  const recentActivities = activityLogs.slice(0, 8);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Personalized Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-800 rounded-xl p-6 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-400/20 text-emerald-400 text-[11px] font-semibold mb-2">
            <Sprout className="w-3.5 h-3.5 text-emerald-400" />
            <span>Smallholder Farmer Gateway • {currentUser.location}</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white mb-1">
            Welcome, {currentUser.name}! 👋
          </h1>
          <p className="text-xs text-slate-300">
            View your allocated government input vouchers, scan QR batch codes, and sell crops directly to accredited buyers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => openModal('qrScannerModal')}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs py-2 px-3.5 rounded-lg transition-colors cursor-pointer shadow-sm"
          >
            <QrCode className="w-4 h-4" />
            <span>Scan Input QR Code</span>
          </button>

          <button
            onClick={() => openModal('offlineUssdSimulationModal')}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 font-semibold text-xs py-2 px-3.5 rounded-lg transition-colors cursor-pointer"
          >
            <Smartphone className="w-4 h-4" />
            <span>USSD (*141#)</span>
          </button>
        </div>
      </div>

      {/* Farmer Summary Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Allocated Vouchers */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs transition-all hover:shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500">Allocated Vouchers</span>
              <span className="w-7 h-7 rounded bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                🎟️
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <div className="text-xl font-extrabold text-slate-900 font-mono">{vouchers.length} Packages</div>
              <button
                onClick={() => onAddVoucher('Foliar Bio-Stimulant Pack (5L)')}
                className="px-2 py-0.5 text-[10px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded cursor-pointer transition-colors"
                title="Simulate receiving another voucher allocation"
              >
                + Add Package
              </button>
            </div>
          </div>
          <p className="text-[11px] text-emerald-600 font-medium mt-2 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> {verifiedCount} Verified at Farm
          </p>
        </div>

        {/* Card 2: USSD Voucher Balance */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs transition-all hover:shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500">USSD Voucher Balance</span>
              <span className="w-7 h-7 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                💳
              </span>
            </div>
            <div className="flex items-center justify-between gap-1">
              <div className="text-xl font-extrabold text-slate-900 font-mono">${ussdBalance.toFixed(2)}</div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onTopUpWallet(25.0)}
                  className="px-2 py-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded cursor-pointer transition-colors"
                >
                  +$25
                </button>
                <button
                  onClick={() => onTopUpWallet(50.0)}
                  className="px-2 py-0.5 text-[10px] font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 rounded cursor-pointer transition-colors"
                >
                  +$50
                </button>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Available for seed & fertilizer</p>
        </div>

        {/* Card 3: Active Crop Listings */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs transition-all hover:shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500">Active Crop Listings</span>
              <span className="w-7 h-7 rounded bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs">
                🌾
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <div className="text-xl font-extrabold text-slate-900 font-mono">{cropOffers.length} Offers</div>
              <button
                onClick={() => {
                  const el = document.getElementById('crop-post-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-2 py-0.5 text-[10px] font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded cursor-pointer transition-colors"
              >
                + New Offer
              </button>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Directly listed to accredited buyers</p>
        </div>

        {/* Card 4: Cooperative Hub */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs transition-all hover:shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500">Cooperative Hub</span>
              <span className="w-7 h-7 rounded bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                🏫
              </span>
            </div>
            {!isEditingHub ? (
              <div>
                <div className="flex items-center justify-between gap-1">
                  <div className="text-sm font-bold text-slate-900 truncate">{cooperativeHub}</div>
                  <button
                    onClick={() => setIsEditingHub(true)}
                    className="px-1.5 py-0.5 text-[10px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded cursor-pointer shrink-0"
                  >
                    Switch
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 truncate">{cooperativeName}</p>
              </div>
            ) : (
              <div className="space-y-1">
                <select
                  value={`${cooperativeHub}|${cooperativeName}`}
                  onChange={(e) => {
                    const [hub, name] = e.target.value.split('|');
                    handleSwitchHub(hub, name);
                  }}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded p-1 text-slate-900 focus:outline-none"
                >
                  <option value="Murehwa Ward 12|Murehwa Grain Co-op">Murehwa Ward 12 (Murehwa Grain Co-op)</option>
                  <option value="Mazowe Ward 4|Mazowe Agro-Hub">Mazowe Ward 4 (Mazowe Agro-Hub)</option>
                  <option value="Gweru Ward 8|Gweru Farmers Depot">Gweru Ward 8 (Gweru Farmers Depot)</option>
                  <option value="Mutare Central|Mutare Agro Cooperative">Mutare Central (Mutare Co-op)</option>
                  <option value="Bindura South|Mashonaland Central Hub">Bindura South (Mashonaland Hub)</option>
                </select>
                <button
                  onClick={() => setIsEditingHub(false)}
                  className="text-[10px] text-slate-400 hover:text-slate-600 underline cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Local Agro-Dealer Depot</p>
        </div>
      </div>

      {/* Season Planning & Input Requirement Card */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-xl p-5 text-white shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Active Season 2024/2025
            </span>
            <span className="text-xs text-slate-400 font-mono">AGRITEX Registered</span>
          </div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span>🗺️</span> Season Planning & Crop Input Allocation Model
          </h3>
          <p className="text-xs text-slate-300">
            Plan field acreage, calculate hybrid seed and fertilizer top-dressing requirements, or submit plan via USSD (*141#).
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => openModal('seasonPlanningModal')}
            className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer transition-transform hover:scale-102"
          >
            <Sprout className="w-4 h-4 text-slate-950" />
            <span>Open Season Planner</span>
          </button>
          <button
            onClick={() => openModal('offlineUssdSimulationModal')}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40 font-bold text-xs rounded-lg cursor-pointer flex items-center gap-1.5"
          >
            <Smartphone className="w-4 h-4 text-amber-400" />
            <span>Dial *141# USSD</span>
          </button>
        </div>
      </div>

      {/* Main Content Split: My Input Allocations & Crop Sales Board */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Allocated Input Packages & Verification */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span>📦</span> My Government Input Voucher Allocations
                </h3>
                <p className="text-xs text-slate-500">
                  Scan the QR code on physical bags upon pickup to confirm authenticity and clear voucher.
                </p>
              </div>
              <button
                onClick={() => openModal('qrScannerModal')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                Launch QR Scanner
              </button>
            </div>

            <div className="divide-y divide-slate-100 border-t border-slate-100 pt-2">
              {vouchers.map((v) => (
                <div key={v.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded bg-slate-100 border border-slate-200 flex items-center justify-center text-sm font-bold mt-0.5">
                      🌱
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{v.item}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-mono text-slate-500">Batch: {v.batch}</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-[10px] font-mono text-blue-600 font-semibold">{v.qr}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    {v.status === 'Received & Verified' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Verified
                      </span>
                    ) : (
                      <button
                        onClick={() => onVerifyVoucher(v.id)}
                        className="px-2.5 py-1 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded cursor-pointer transition-colors shadow-xs flex items-center gap-1"
                      >
                        <QrCode className="w-3 h-3" />
                        <span>Verify QR</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sell Harvested Crops Market Board */}
          <div id="crop-post-section" className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span>🌾</span> Sell Harvested Crops to Grain Board & Millers
                </h3>
                <p className="text-xs text-slate-500">
                  List your harvested crop yields directly to verified commodity buyers.
                </p>
              </div>
              <button
                onClick={() => openModal('marketplaceModal')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                View Full Market
              </button>
            </div>

            {/* Post New Offer Form */}
            <form onSubmit={handlePostCrop} className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 mb-4 flex flex-col sm:flex-row items-center gap-3">
              <input
                type="text"
                placeholder="Crop Type (e.g. Yellow Maize, Sunflower)"
                value={newCropName}
                onChange={(e) => setNewCropName(e.target.value)}
                className="w-full sm:flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-md text-slate-900 outline-none focus:border-blue-500"
              />
              <input
                type="text"
                placeholder="Quantity (e.g. 2.5 Tons)"
                value={newCropQuantity}
                onChange={(e) => setNewCropQuantity(e.target.value)}
                className="w-full sm:w-32 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-md text-slate-900 outline-none focus:border-blue-500"
              />
              <input
                type="number"
                placeholder="Price ($/Ton)"
                value={newCropPrice}
                onChange={(e) => setNewCropPrice(e.target.value)}
                className="w-full sm:w-28 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-md text-slate-900 outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                className="w-full sm:w-auto px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors cursor-pointer shrink-0"
              >
                Post Offer
              </button>
            </form>

            {/* Active Offers Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-[10px] uppercase">
                    <th className="py-2 px-3">CROP SPECIFICATION</th>
                    <th className="py-2 px-3">QUANTITY</th>
                    <th className="py-2 px-3">PRICE OFFER</th>
                    <th className="py-2 px-3">STATUS</th>
                    <th className="py-2 px-3 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {cropOffers.map((offer) => (
                    <tr key={offer.id} className="hover:bg-slate-50/80">
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{offer.cropName}</td>
                      <td className="py-2.5 px-3 text-slate-600">{offer.quantity || '1.0 Ton'}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900 font-mono">${offer.askingPrice} / Ton</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                          {offer.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => onDeleteCropOffer(offer.id)}
                          className="text-[11px] font-semibold text-slate-400 hover:text-rose-600 cursor-pointer"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Mobile USSD Terminal & Agritex Advisory */}
        <div className="space-y-6">
          {/* Real-time Farmer Activity Stream */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center justify-between">
              <span>My Activity Log</span>
              <span className="text-[10px] font-mono text-emerald-600 font-normal">Live Sync</span>
            </h3>
            <div className="space-y-2.5">
              {recentActivities.map((act) => (
                <div key={act.id} className="flex items-start gap-2.5 text-xs p-2 bg-slate-50 rounded-md border border-slate-100">
                  <span className="text-sm">{activityIcon(act)}</span>
                  <div className="flex-1">
                    <p className="font-medium text-slate-800 leading-tight">{act.typeDetails}</p>
                    <span className="text-[10px] text-slate-400 font-mono">{act.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Offline USSD Simulation Terminal Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 text-white shadow-md">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  USSD Mobile Gateway (*141#)
                </h3>
              </div>
              <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono px-1.5 py-0.5 rounded">
                OFFLINE READY
              </span>
            </div>

            <p className="text-[11px] text-slate-300 mb-4 leading-relaxed">
              No internet connection in the field? Dial USSD on any Econet/NetOne feature phone to verify input bags or check allocations.
            </p>

            <button
              onClick={() => openModal('offlineUssdSimulationModal')}
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs py-2 px-3 rounded-md transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm"
            >
              <span>Launch USSD Feature Phone Simulator</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Agritex Extension Advisory Broadcasts */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <Bell className="w-4 h-4 text-blue-600" />
                AGRITEX Extension Broadcasts
              </h3>
              <span className="text-[10px] text-slate-400">Ward 12 Stream</span>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-md">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-blue-800 uppercase">Top Dressing Advisory</span>
                  <span className="text-[9px] text-slate-400 font-mono">Today 08:30 AM</span>
                </div>
                <p className="text-xs text-slate-700 leading-snug">
                  Apply Ammonium Nitrate top dressing 3 weeks after germination. Inspect bags for official seal before opening.
                </p>
              </div>

              <div className="p-3 bg-amber-50/60 border border-amber-100 rounded-md">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-amber-800 uppercase">Rainfall Weather Alert</span>
                  <span className="text-[9px] text-slate-400 font-mono">Yesterday</span>
                </div>
                <p className="text-xs text-slate-700 leading-snug">
                  Heavy rains expected in Murehwa District this weekend. Secure fertilizer bags on elevated wooden pallets.
                </p>
              </div>
            </div>
          </div>

          {/* Report Fraud / Whistleblower Shortcut */}
          <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                Report Fake or Mismatched Inputs
              </h4>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Is your seed seal damaged or altered? Send an anonymous alert.
              </p>
            </div>
            <button
              onClick={() => openModal('ussdModal')}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-md transition-colors cursor-pointer shrink-0"
            >
              Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
