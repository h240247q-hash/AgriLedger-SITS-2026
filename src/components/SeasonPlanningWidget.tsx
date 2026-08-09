import React from 'react';

interface SeasonPlanningWidgetProps {
  openModal: (modalId: string) => void;
}

export const SeasonPlanningWidget: React.FC<SeasonPlanningWidgetProps> = ({ openModal }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-800">Season Planning</h3>
          <button
            onClick={() => openModal('seasonPlanningModal')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
          >
            View Plan
          </button>
        </div>

        {/* Season Badge */}
        <div className="bg-slate-50 border border-slate-200 rounded-md p-2.5 flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
            <span>📅</span>
            <span>2024 / 2025 Season</span>
          </div>
          <span className="bg-emerald-100/80 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
            Active
          </span>
        </div>

        {/* Schedule List */}
        <div className="space-y-2.5 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-xs bg-emerald-600 inline-block"></span>
              <span className="font-semibold text-slate-900">Planting</span>
            </div>
            <span className="text-slate-500 font-mono text-[11px]">Oct - Dec 2024</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-xs bg-blue-600 inline-block"></span>
              <span className="font-semibold text-slate-900">Top Dressing</span>
            </div>
            <span className="text-slate-500 font-mono text-[11px]">Jan - Feb 2025</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-xs bg-amber-500 inline-block"></span>
              <span className="font-semibold text-slate-900">Harvesting</span>
            </div>
            <span className="text-slate-500 font-mono text-[11px]">Apr - Jun 2025</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4 pt-3 border-t border-slate-100">
        <div className="flex justify-between text-xs mb-1.5 font-semibold">
          <span className="text-slate-600">Season Progress</span>
          <span className="text-blue-600 font-bold font-mono">65%</span>
        </div>
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-blue-600 rounded-full" style={{ width: '65%' }}></div>
        </div>
      </div>
    </div>
  );
};
