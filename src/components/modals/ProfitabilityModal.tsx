import React from 'react';
import { DashboardStats } from '../../types';

interface ProfitabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: DashboardStats;
}

export const ProfitabilityModal: React.FC<ProfitabilityModalProps> = ({
  isOpen,
  onClose,
  stats,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
        <h3 className="text-base font-bold text-gray-800 mb-1">
          📊 Financial Profitability Ledger Matrix
        </h3>
        <p className="text-xs text-gray-500 mb-4 leading-relaxed">
          This data rate syncs automatically with incoming payout items logged via the Market Board Negotiator.
        </p>

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4 space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-600 font-medium">Aggregated Portal Return Rate:</span>
            <strong className="text-[#2d6a4f] text-base font-bold">{stats.profitRate}%</strong>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-600 font-medium">Linked Revenue Sells Input:</span>
            <strong className="text-gray-800 font-bold">${stats.incomeValue.toLocaleString()}</strong>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-600 font-medium">Calculated Input Seed Costs:</span>
            <strong className="text-rose-600 font-bold">${stats.baseInputCosts.toLocaleString()}</strong>
          </div>
        </div>

        <div className="text-xs text-gray-500 leading-relaxed bg-amber-50/50 border border-amber-100 p-3 rounded-lg mb-4">
          ℹ️ <strong>System Formula Link:</strong> Net margins track gross contract values using a fixed structural baseline variable representing equipment and supply-chain logistical overhead.
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg cursor-pointer"
          >
            Close Matrix
          </button>
        </div>
      </div>
    </div>
  );
};
