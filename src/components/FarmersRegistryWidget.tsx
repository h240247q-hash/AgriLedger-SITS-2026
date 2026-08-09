import React from 'react';
import { Farmer } from '../types';

interface FarmersRegistryWidgetProps {
  farmers: Farmer[];
  openModal: (modalId: string) => void;
}

export const FarmersRegistryWidget: React.FC<FarmersRegistryWidgetProps> = ({ farmers = [], openModal }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-800">Farmers Registry</h3>
          <button
            onClick={() => openModal('registrationModal')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
          >
            View All
          </button>
        </div>

        <div className="space-y-3">
          {(farmers || []).slice(0, 3).map((f, idx) => (
            <div key={f.id || idx} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-md bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
                👤
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-900">{f.name}</h4>
                <p className="text-[11px] text-slate-400">{f.location}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 pt-3 border-t border-slate-100 text-xs font-semibold text-blue-600 flex items-center justify-between">
        <span>Total Farmers:</span>
        <span className="font-mono font-bold text-slate-900">2,345</span>
      </div>
    </div>
  );
};
