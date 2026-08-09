import React, { useState } from 'react';
import { executeUssdAction } from '../../api/client';
import { Sprout, Calculator, CheckCircle2, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';

interface SeasonPlanningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (msg?: string) => void;
}

export const SeasonPlanningModal: React.FC<SeasonPlanningModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [selectedCrop, setSelectedCrop] = useState('Hybrid Maize (SC 637)');
  const [hectares, setHectares] = useState<number>(3.5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  // Input Calculation Calculations based on Hectares
  const seedKg = Math.round(hectares * 25);
  const compoundDBags = Math.round(hectares * 8);
  const anBags = Math.round(hectares * 8);
  const estimatedYieldTons = (hectares * 5.2).toFixed(1);
  const estimatedInputCost = Math.round(hectares * 380);
  const subsidyCoverage = Math.round(estimatedInputCost * 0.65);
  const farmerCoPay = estimatedInputCost - subsidyCoverage;

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSaveSuccess(false);

    try {
      const estSeed = `${seedKg} kg (${Math.ceil(seedKg / 10)} x 10kg Bags) ${selectedCrop} Seed`;
      const estFertilizer = `${compoundDBags} Bags Compound D & ${anBags} Bags Top Dressing AN`;
      const targetYield = `${estimatedYieldTons} Tons`;

      await executeUssdAction({
        farmerCode: 'AL-FARM-001',
        farmerName: 'Tendai Mhako',
        location: 'Murehwa Ward 12',
        actionType: 'LOG_SEASON_PLAN',
        payload: {
          crop: selectedCrop,
          acreage: `${hectares} Ha`,
          estSeed,
          estFertilizer,
          targetYield,
        },
      });

      setSaveSuccess(true);
      if (onSuccess) {
        onSuccess(
          `📅 SEASON PLAN SAVED: Planned ${hectares} Ha of ${selectedCrop}. Allocated ${compoundDBags} Bags Compound D & ${anBags} Bags AN.`
        );
      }
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 1200);
    } catch (err: any) {
      alert(err.message || 'Failed to save season plan');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-2xl p-6 max-w-xl w-full shadow-2xl border border-slate-800 text-slate-100 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Farmer Season & Input Planning Model
              </h3>
              <p className="text-xs text-slate-400">
                Plan crop rotation, compute seed & fertilizer quotas, and log season budget to DB
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white font-bold w-8 h-8 rounded-lg hover:bg-slate-800 flex items-center justify-center cursor-pointer"
          >
            ✕
          </button>
        </div>

        {saveSuccess ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-white">Season Plan Saved to Database Ledger!</h4>
            <p className="text-xs text-slate-300 max-w-md mx-auto">
              Your season parameters for {hectares} Ha of {selectedCrop} have been registered and synchronized with your USSD profile and AGRITEX allocation records.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSavePlan} className="space-y-4">
            
            {/* Crop & Hectare Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Target Crop Selection
                </label>
                <select
                  value={selectedCrop}
                  onChange={(e) => setSelectedCrop(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white outline-none focus:border-emerald-500"
                >
                  <option value="Hybrid Maize (SC 637)">White Hybrid Maize (SC 637)</option>
                  <option value="Yellow Maize (SC 719)">Yellow Hybrid Maize (SC 719)</option>
                  <option value="Soybeans (Organic Grade)">Organic Soybeans</option>
                  <option value="Virginia Flue-Cured Tobacco">Virginia Tobacco</option>
                  <option value="Winter Wheat (Grade A)">Winter Wheat</option>
                  <option value="Sugar Beans">Sugar Beans</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Total Field Area (Hectares)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="50"
                  value={hectares}
                  onChange={(e) => setHectares(Math.max(0.5, parseFloat(e.target.value) || 0.5))}
                  className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white outline-none focus:border-emerald-500 font-mono"
                  required
                />
              </div>
            </div>

            {/* Calculated Inputs Breakdown */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <Calculator className="w-4 h-4" />
                  <span>AGRITEX Recommended Input Allocation ({hectares} Ha)</span>
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono">
                  65% Subsidized
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block mb-0.5">Seed Requirement</span>
                  <strong className="text-emerald-300 font-mono text-sm block">{seedKg} kg</strong>
                  <span className="text-[9px] text-slate-500">Certified Hybrid Seed</span>
                </div>

                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block mb-0.5">Basal Fertilizer</span>
                  <strong className="text-blue-300 font-mono text-sm block">{compoundDBags} Bags</strong>
                  <span className="text-[9px] text-slate-500">Compound D (50kg)</span>
                </div>

                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block mb-0.5">Top Dressing</span>
                  <strong className="text-amber-300 font-mono text-sm block">{anBags} Bags</strong>
                  <span className="text-[9px] text-slate-500">Ammonium Nitrate (50kg)</span>
                </div>

                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block mb-0.5">Expected Harvest</span>
                  <strong className="text-white font-mono text-sm block">{estimatedYieldTons} Tons</strong>
                  <span className="text-[9px] text-slate-500">Target Grain Yield</span>
                </div>

                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block mb-0.5">Govt Subsidy (65%)</span>
                  <strong className="text-emerald-400 font-mono text-sm block">${subsidyCoverage}.00</strong>
                  <span className="text-[9px] text-slate-500">Voucher Credit Covered</span>
                </div>

                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block mb-0.5">Farmer Co-Payment</span>
                  <strong className="text-indigo-300 font-mono text-sm block">${farmerCoPay}.00</strong>
                  <span className="text-[9px] text-slate-500">Wallet / Mobile Money</span>
                </div>
              </div>
            </div>

            {/* Footer buttons */}
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
                className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-slate-950 rounded-lg cursor-pointer shadow-md flex items-center gap-1.5 disabled:opacity-50"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{isSubmitting ? 'Saving Season Plan...' : 'Save & Register Season Plan'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
