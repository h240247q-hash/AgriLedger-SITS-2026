import React, { useState } from 'react';
import { executeUssdAction } from '../../api/client';
import { Smartphone, CheckCircle2, ShieldCheck } from 'lucide-react';

interface USSDModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (msg?: string) => void;
}

export const USSDModal: React.FC<USSDModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [fid, setFid] = useState('AL-FARM-001');
  const [farmerName, setFarmerName] = useState('Tendai Mhako');
  const [activityType, setActivityType] = useState('Log Planting & Seed Sowing');
  const [details, setDetails] = useState('Planted 3 Ha Certified Hybrid Maize Seed (SC 637)');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await executeUssdAction({
        farmerCode: fid,
        farmerName,
        location: 'Murehwa Ward 12',
        actionType: 'GENERIC_LOG',
        payload: { details: `[${activityType}] ${details}` }
      });
      alert(`📳 USSD Activity Logged to Database for ${farmerName} (${fid})!`);
      if (onSuccess) {
        onSuccess(`📳 USSD ACTIVITY RECORDED: ${farmerName} logged ${activityType} (${details})`);
      }
      setFid('AL-FARM-001');
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to record USSD activity');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-800 text-slate-100">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800 mb-4">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              Farmer USSD Activity Gateway
            </h3>
            <p className="text-[11px] text-slate-400">
              Connect USSD feature phone input directly to farmer activity ledger
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Farmer Identity Key
              </label>
              <input
                type="text"
                value={fid}
                onChange={(e) => setFid(e.target.value)}
                placeholder="e.g. AL-FARM-001"
                className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white font-mono outline-none focus:border-emerald-500"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Farmer Name
              </label>
              <input
                type="text"
                value={farmerName}
                onChange={(e) => setFarmerName(e.target.value)}
                placeholder="e.g. Tendai Mhako"
                className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white outline-none focus:border-emerald-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Farmer Activity Category
            </label>
            <select
              value={activityType}
              onChange={(e) => setActivityType(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white outline-none focus:border-emerald-500"
            >
              <option value="Log Planting & Seed Sowing">Log Planting & Seed Sowing</option>
              <option value="Log Fertilizer Spraying">Log Fertilizer Spraying</option>
              <option value="Log Input Voucher Redemption">Log Input Voucher Redemption</option>
              <option value="Log Harvest Yield">Log Harvest Yield</option>
              <option value="Whistleblower Fraud Alert">Whistleblower Fraud Alert</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Activity Description Details
            </label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Describe farming activity..."
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white outline-none focus:border-emerald-500 h-20 resize-none"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-slate-950 rounded-lg cursor-pointer flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isSubmitting ? 'Logging...' : 'Sync Activity to DB'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
