import React from 'react';

interface QuickActionCardsProps {
  alertCount: number;
  openModal: (modalId: string) => void;
}

export const QuickActionCards: React.FC<QuickActionCardsProps> = ({ alertCount, openModal }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Card 1: Verify Inputs */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col justify-between shadow-2xs hover:border-blue-500/50 transition-all">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-lg">🔍</span>
            <h3 className="text-xs font-semibold text-slate-800">Verify Inputs</h3>
          </div>
          <span className="text-[10px] text-slate-400 block mb-2 font-mono">(QR Scan)</span>
          <p className="text-[11px] text-slate-500 mb-3 leading-snug">
            Scan QR code to verify input authenticity
          </p>
        </div>
        <button
          onClick={() => openModal('qrScannerModal')}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium py-1.5 px-3 rounded-md transition-colors cursor-pointer"
        >
          Scan Now
        </button>
      </div>

      {/* Card 2: AI Fraud Monitor */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col justify-between shadow-2xs hover:border-blue-500/50 transition-all">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-lg">🛡️</span>
            <h3 className="text-xs font-semibold text-slate-800">AI Fraud Monitor</h3>
          </div>
          <p className="text-[11px] text-slate-500 mb-1 leading-snug">
            AI is monitoring activities
          </p>
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-blue-100 text-blue-700 text-[9px] font-bold px-1.5 py-0.5 rounded-xs uppercase">
              AI
            </span>
            <span className="text-xs font-semibold text-slate-700">
              {alertCount} <span className="font-normal text-slate-400">Suspicious</span>
            </span>
          </div>
        </div>
        <button
          onClick={() => openModal('aiFraudMonitorModal')}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium py-1.5 px-3 rounded-md transition-colors cursor-pointer"
        >
          View Alerts
        </button>
      </div>

      {/* Card 3: Driver ETA & Delays */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col justify-between shadow-2xs hover:border-blue-500/50 transition-all">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-lg">🌾</span>
            <h3 className="text-xs font-semibold text-slate-800">Driver ETA & Delays</h3>
          </div>
          <p className="text-[11px] text-slate-500 mb-1 leading-snug">
            Track driver ETA and delivery delays
          </p>
          <div className="flex items-center gap-1.5 mb-3 text-xs font-semibold text-slate-700">
            <span>⏱️</span>
            <span>12 <span className="font-normal text-slate-400">Active</span></span>
          </div>
        </div>
        <button
          onClick={() => openModal('deliveryModal')}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium py-1.5 px-3 rounded-md transition-colors cursor-pointer"
        >
          Track Now
        </button>
      </div>

      {/* Card 4: Whistleblower Portal */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col justify-between shadow-2xs hover:border-blue-500/50 transition-all">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-lg">📳</span>
            <h3 className="text-xs font-semibold text-slate-800">Whistleblower Portal</h3>
          </div>
          <p className="text-[11px] text-slate-500 mb-3 leading-snug mt-1">
            Report fraud or suspicious activities
          </p>
        </div>
        <button
          onClick={() => openModal('ussdModal')}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium py-1.5 px-3 rounded-md transition-colors cursor-pointer"
        >
          Report Now
        </button>
      </div>
    </div>
  );
};
