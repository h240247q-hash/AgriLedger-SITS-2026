import React from 'react';
import { Supplier } from '../types';

interface SuppliersRegistryWidgetProps {
  suppliers: Supplier[];
  openModal: (modalId: string) => void;
}

export const SuppliersRegistryWidget: React.FC<SuppliersRegistryWidgetProps> = ({ suppliers = [], openModal }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-800">Suppliers Registry</h3>
          <button
            onClick={() => openModal('supplierRegistrationModal')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
          >
            View All
          </button>
        </div>

        <div className="space-y-3">
          {(suppliers || []).slice(0, 3).map((s, idx) => (
            <div key={s.id || idx} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-md bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
                🏢
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-900">{s.name}</h4>
                <p className="text-[11px] text-slate-400">{s.location}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 pt-3 border-t border-slate-100 text-xs font-semibold text-blue-600 flex items-center justify-between">
        <span>Total Suppliers:</span>
        <span className="font-mono font-bold text-slate-900">142</span>
      </div>
    </div>
  );
};
