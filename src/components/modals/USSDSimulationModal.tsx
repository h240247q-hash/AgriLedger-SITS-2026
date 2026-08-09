import React, { useState, useEffect } from 'react';
import { DashboardStats, UserProfile } from '../../types';
import { executeUssdAction } from '../../api/client';
import { Smartphone, RefreshCw, CheckCircle2, User, Activity, ShieldCheck, Sparkles, Send } from 'lucide-react';

interface USSDSimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats?: DashboardStats;
  currentUser?: UserProfile;
  onSuccess?: (smsMsg?: string) => void;
  onLoginAsFarmer?: (farmerProfile: UserProfile) => void;
}

const PRESET_FARMERS = [
  { name: 'Tendai Mhako', farmerCode: 'AL-FARM-001', phone: '+263771234567', location: 'Murehwa Ward 12' },
  { name: 'Rudo Shumba', farmerCode: 'AL-FARM-002', phone: '+263772987654', location: 'Gweru Central Hub' },
  { name: 'Simba Mukarati', farmerCode: 'AL-FARM-003', phone: '+263773112233', location: 'Chitungwiza Sector 4' },
  { name: 'Grace Mutasa', farmerCode: 'AL-FARM-004', phone: '+263774556677', location: 'Mutare North' },
];

export const USSDSimulationModal: React.FC<USSDSimulationModalProps> = ({
  isOpen,
  onClose,
  stats,
  currentUser,
  onSuccess,
  onLoginAsFarmer,
}) => {
  const [selectedFarmerIndex, setSelectedFarmerIndex] = useState(0);
  const activeFarmer = PRESET_FARMERS[selectedFarmerIndex];

  const [inputVal, setInputVal] = useState('');
  const [menuState, setMenuState] = useState<'MAIN' | 'VIEW_LOGS' | 'SEASON_PLANNING' | 'PLANTING' | 'SPRAY' | 'VOUCHER' | 'HARVEST' | 'PRICES' | 'FRAUD' | 'BALANCE' | 'RESULT'>('MAIN');
  const [screenText, setScreenText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recentUssdLogs, setRecentUssdLogs] = useState<any[]>([]);

  // Initialize USSD screen
  const resetToMainMenu = () => {
    setMenuState('MAIN');
    setScreenText(
      `AgriLedger Gateway (*141#)\nFarmer: ${activeFarmer.name} (${activeFarmer.farmerCode})\nLocation: ${activeFarmer.location}\n\nSelect Option:\n1) View My Activity Logs\n2) Plan My Farming Season (Crop & Inputs)\n3) Log Planting & Sowing\n4) Log Fertilizer & Spraying\n5) Redeem Input Voucher / QR\n6) Log Harvest Yield & Sales\n7) Live Market Crop Prices\n8) Whistleblower Fraud Report\n9) 🚀 Access & Launch Farmer Dashboard`
    );
  };

  const loadFarmerActivities = async () => {
    setIsLoading(true);
    try {
      const res = await executeUssdAction({
        farmerCode: activeFarmer.farmerCode,
        farmerName: activeFarmer.name,
        location: activeFarmer.location,
        actionType: 'GET_ACTIVITIES',
      });
      if (res.activities) {
        setRecentUssdLogs(res.activities);
        if (menuState === 'VIEW_LOGS') {
          if (res.activities.length === 0) {
            setScreenText(
              `[FARMER ACTIVITIES: ${activeFarmer.name}]\nNo recent activity records found on database.\n\nType 0 to Return to Main Menu.`
            );
          } else {
            const formatted = res.activities
              .map((act: any, idx: number) => `${idx + 1}. [${act.timestamp || 'Today'}] ${act.typeDetails || act.qrCode}`)
              .join('\n');
            setScreenText(
              `[DB ACTIVITIES: ${activeFarmer.name}]\n${formatted}\n\nType 0 to Return to Main Menu.`
            );
          }
        }
      }
    } catch (e) {
      console.error('Failed to fetch farmer activities:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      resetToMainMenu();
      loadFarmerActivities();
    }
  }, [isOpen, selectedFarmerIndex]);

  if (!isOpen) return null;

  const handleSendCommand = async () => {
    const choice = inputVal.trim();
    if (!choice) return;
    setInputVal('');

    if (choice === '0') {
      resetToMainMenu();
      return;
    }

    if (menuState === 'MAIN') {
      if (choice === '1') {
        setMenuState('VIEW_LOGS');
        await loadFarmerActivities();
      } else if (choice === '2') {
        setMenuState('SEASON_PLANNING');
        setScreenText(
          `[2. SEASON PLANNING & INPUT BUDGETING]\nFarmer: ${activeFarmer.name}\n\nEnter Target Crop & Field Hectares\n(e.g., "Maize 4 Ha", "Soybeans 2 Ha", "Tobacco 3 Ha").\n\nType 0 to Cancel.`
        );
      } else if (choice === '3') {
        setMenuState('PLANTING');
        setScreenText(
          `[3. LOG PLANTING & SOWING]\nEnter crop type & area (e.g., "Maize 3.5 Ha" or "1" for 2 Ha Hybrid Maize).\n\nType 0 to Cancel.`
        );
      } else if (choice === '4') {
        setMenuState('SPRAY');
        setScreenText(
          `[4. LOG FERTILIZER / SPRAY]\nEnter chemical or fertilizer details applied (e.g., "Top Dressing AN 50kg").\n\nType 0 to Cancel.`
        );
      } else if (choice === '5') {
        setMenuState('VOUCHER');
        setScreenText(
          `[5. REDEEM INPUT VOUCHER]\nEnter Voucher Serial (e.g., "VOUCH-8821" or "FERT-9912").\n\nType 0 to Cancel.`
        );
      } else if (choice === '6') {
        setMenuState('HARVEST');
        setScreenText(
          `[6. LOG HARVEST YIELD]\nEnter Harvest Tonnage & Crop (e.g., "6.5 Tons White Maize").\n\nType 0 to Cancel.`
        );
      } else if (choice === '7') {
        setMenuState('PRICES');
        setScreenText(
          `[7. LIVE MARKET CROP PRICES]\n- White Maize: $290/Ton\n- Soybeans: $480/Ton\n- Sugar Beans: $720/Ton\n- Sorghum: $320/Ton\n\nType 0 to Return.`
        );
      } else if (choice === '8') {
        setMenuState('FRAUD');
        setScreenText(
          `[8. WHISTLEBLOWER ALARM]\nType confidential diversion or pest alert to report anonymously to AI Monitor.\n\nType 0 to Cancel.`
        );
      } else if (choice === '9') {
        // Direct launch dashboard for this farmer
        const farmerProfile: UserProfile = {
          id: activeFarmer.farmerCode,
          name: activeFarmer.name,
          role: 'farmer',
          email: `${activeFarmer.name.toLowerCase().replace(/\s+/g, '.')}@agriledger.zw`,
          phone: activeFarmer.phone,
          location: activeFarmer.location,
          organization: 'Murehwa Grain Cooperative',
          avatarInitials: activeFarmer.name.split(' ').map(n => n[0]).join('').toUpperCase(),
        };
        if (onLoginAsFarmer) {
          onLoginAsFarmer(farmerProfile);
        }
        setScreenText(`🚀 LAUNCHING FARMER DASHBOARD...\nRedirecting to ${activeFarmer.name}'s Account Dashboard.`);
        setTimeout(() => {
          onClose();
        }, 600);
        return;
      } else {
        setScreenText(
          `⚠️ Invalid USSD Option Choice.\nSelect numbers 1-9:\n1) Activity Log   2) Season Plan   3) Planting\n4) Spraying       5) Voucher       6) Harvest\n7) Crop Prices    8) Fraud Alert   9) Access Dashboard\n\nType 0 for Main Menu.`
        );
      }
      return;
    }

    // Processing Sub-menus
    setIsLoading(true);
    try {
      if (menuState === 'SEASON_PLANNING') {
        const cropMatch = choice.match(/([a-zA-Z\s]+)/);
        const haMatch = choice.match(/(\d+(\.\d+)?)\s*(ha|hectare|hectares)?/i);
        const crop = cropMatch ? cropMatch[1].trim() : 'Hybrid Maize (SC 637)';
        const haVal = haMatch ? parseFloat(haMatch[1]) : 3.5;
        const hectares = `${haVal} Ha`;

        const seedKg = Math.round(haVal * 25);
        const cmpdBags = Math.round(haVal * 8);
        const anBags = Math.round(haVal * 8);
        const yieldTons = Math.round(haVal * 5.5 * 10) / 10;

        const estSeed = `${seedKg} kg Certified Seed`;
        const estFertilizer = `${cmpdBags} Bags Compound D & ${anBags} Bags Ammonium Nitrate`;
        const targetYield = `${yieldTons} Tons Target Yield`;

        const res = await executeUssdAction({
          farmerCode: activeFarmer.farmerCode,
          farmerName: activeFarmer.name,
          location: activeFarmer.location,
          actionType: 'LOG_SEASON_PLAN',
          payload: { crop, acreage: hectares, estSeed, estFertilizer, targetYield }
        });

        setMenuState('RESULT');
        setScreenText(
          `📅 SEASON PLAN CONFIRMED!\nFarmer: ${activeFarmer.name}\nCrop: ${crop} (${hectares})\n\nRequired Inputs Calculated:\n• Seed: ${estSeed}\n• Fertilizer: ${estFertilizer}\n• Expected Yield: ${targetYield}\n\nPlan saved to MySQL Database Ledger!\n\nType 0 for Main Menu.`
        );
        if (onSuccess) onSuccess(`📅 USSD SEASON PLAN: ${activeFarmer.name} planned ${hectares} of ${crop}. Inputs: ${estFertilizer}`);
      } else if (menuState === 'PLANTING') {
        const res = await executeUssdAction({
          farmerCode: activeFarmer.farmerCode,
          farmerName: activeFarmer.name,
          location: activeFarmer.location,
          actionType: 'LOG_PLANTING',
          payload: { crop: choice.includes('Ha') ? choice : `${choice} Maize`, acreage: '3 Ha' }
        });
        setMenuState('RESULT');
        setScreenText(
          `✅ DB UPDATE CONFIRMED!\n${res.message}\nLogged for ${activeFarmer.name}.\n\nType 0 for Main Menu.`
        );
        if (onSuccess) onSuccess(`📱 USSD SMS: Farmer ${activeFarmer.name} logged planting of ${choice}.`);
      } else if (menuState === 'SPRAY') {
        const res = await executeUssdAction({
          farmerCode: activeFarmer.farmerCode,
          farmerName: activeFarmer.name,
          location: activeFarmer.location,
          actionType: 'LOG_SPRAY',
          payload: { chemical: choice }
        });
        setMenuState('RESULT');
        setScreenText(
          `✅ DB UPDATE CONFIRMED!\n${res.message}\nLogged for ${activeFarmer.name}.\n\nType 0 for Main Menu.`
        );
        if (onSuccess) onSuccess(`📱 USSD SMS: Farmer ${activeFarmer.name} logged application of ${choice}.`);
      } else if (menuState === 'VOUCHER') {
        const res = await executeUssdAction({
          farmerCode: activeFarmer.farmerCode,
          farmerName: activeFarmer.name,
          location: activeFarmer.location,
          actionType: 'REDEEM_VOUCHER',
          payload: { voucherCode: choice, item: 'Subsidized Compound D Fertilizer' }
        });
        setMenuState('RESULT');
        setScreenText(
          `✅ VOUCHER REDEEMED!\n${res.message}\nVerified to ${activeFarmer.name}.\n\nType 0 for Main Menu.`
        );
        if (onSuccess) onSuccess(`📱 USSD SMS: Farmer ${activeFarmer.name} redeemed voucher ${choice}.`);
      } else if (menuState === 'HARVEST') {
        const res = await executeUssdAction({
          farmerCode: activeFarmer.farmerCode,
          farmerName: activeFarmer.name,
          location: activeFarmer.location,
          actionType: 'LOG_HARVEST',
          payload: { tonnage: choice }
        });
        setMenuState('RESULT');
        setScreenText(
          `✅ YIELD RECORDED!\n${res.message}\nAdded to Market Listing for ${activeFarmer.name}.\n\nType 0 for Main Menu.`
        );
        if (onSuccess) onSuccess(`📱 USSD SMS: Farmer ${activeFarmer.name} recorded harvest yield: ${choice}.`);
      } else if (menuState === 'FRAUD') {
        const res = await executeUssdAction({
          farmerCode: activeFarmer.farmerCode,
          farmerName: activeFarmer.name,
          location: activeFarmer.location,
          actionType: 'GENERIC_LOG',
          payload: { details: `🚨 ALERT REPORT: ${choice}` }
        });
        setMenuState('RESULT');
        setScreenText(
          `🚨 ALERT TRANSMITTED!\nWhistleblower report submitted anonymously to AI Fraud Auditor.\n\nType 0 for Main Menu.`
        );
        if (onSuccess) onSuccess(`🚨 USSD FRAUD ALERT: ${choice} from ${activeFarmer.location}`);
      }
      await loadFarmerActivities();
    } catch (err: any) {
      setScreenText(`❌ DB Error: ${err.message || 'Failed to update ledger'}\n\nType 0 to Return.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-slate-800 text-slate-100 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight leading-none">
                GSM USSD (*141#) Farmer Gateway
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">
                Connected directly to MySQL database & Farmer Activity Stream
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-base font-bold w-8 h-8 rounded-lg hover:bg-slate-800 flex items-center justify-center cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Farmer Selector */}
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 mb-4 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              <span>Select Active Farmer Context:</span>
            </label>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-2 py-0.5 rounded-full border border-emerald-500/30">
              DB CONNECTED
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {PRESET_FARMERS.map((f, idx) => (
              <button
                key={f.farmerCode}
                type="button"
                onClick={() => setSelectedFarmerIndex(idx)}
                className={`p-2 rounded-lg text-left transition-all border cursor-pointer ${
                  selectedFarmerIndex === idx
                    ? 'bg-emerald-950/60 border-emerald-500 text-emerald-100 shadow-sm'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="font-bold text-xs truncate">{f.name}</div>
                <div className="text-[10px] font-mono text-emerald-400">{f.farmerCode}</div>
                <div className="text-[9px] text-slate-400 truncate">{f.location}</div>
              </button>
            ))}
          </div>
        </div>

        {/* GSM USSD Terminal Screen */}
        <div className="bg-slate-950 border-4 border-slate-800 rounded-2xl p-4 font-mono text-emerald-400 min-h-[250px] flex flex-col justify-between shadow-inner relative overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center gap-2 text-xs text-emerald-300">
              <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
              <span>Updating Database Ledger...</span>
            </div>
          )}

          <div className="text-xs leading-relaxed whitespace-pre-wrap font-mono">
            {screenText}
          </div>

          <div className="mt-4 border-t border-dashed border-emerald-900/60 pt-2.5">
            <div className="flex justify-between items-center text-[10px] text-emerald-500 mb-1">
              <span>Respond (Type choice or text & press Enter):</span>
              <span className="text-slate-500 font-mono">GSM 2G/3G Active</span>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendCommand();
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Type USSD command..."
                className="bg-black border border-emerald-500/60 text-emerald-300 font-mono w-full px-3 py-1.5 text-xs outline-none rounded-lg focus:border-emerald-400"
                autoFocus
              />
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 cursor-pointer shrink-0 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </form>
          </div>
        </div>

        {/* Real-time DB Activity Stream for Selected Farmer */}
        <div className="mt-4 bg-slate-950 border border-slate-800 p-3 rounded-xl space-y-2">
          <div className="flex items-center justify-between pb-1 border-b border-slate-800">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>Live Database Activities for {activeFarmer.name}</span>
            </span>
            <button
              onClick={loadFarmerActivities}
              className="text-[10px] text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-2.5 h-2.5" />
              <span>Refresh</span>
            </button>
          </div>

          {recentUssdLogs.length === 0 ? (
            <p className="text-[11px] text-slate-500 italic py-1">
              No activity logs recorded yet for {activeFarmer.name}. Log a planting or fertilizer spray above!
            </p>
          ) : (
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {recentUssdLogs.map((log) => (
                <div
                  key={log.id}
                  className="bg-slate-900 border border-slate-800/80 p-2 rounded-lg text-[11px] flex items-center justify-between gap-2"
                >
                  <div className="truncate">
                    <span className="font-bold text-emerald-300 block truncate">{log.typeDetails}</span>
                    <span className="text-[10px] text-slate-400">{log.location} • Code: {log.qrCode}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 shrink-0">{log.timestamp || 'Just now'}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="flex justify-between items-center mt-4 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={resetToMainMenu}
            className="px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg cursor-pointer"
          >
            Reset Screen (*141#)
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-slate-950 rounded-lg cursor-pointer shadow-md"
          >
            Close USSD Gateway
          </button>
        </div>

      </div>
    </div>
  );
};
