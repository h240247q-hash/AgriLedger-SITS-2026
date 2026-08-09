import React from 'react';
import { LogisticsTruck } from '../types';

interface ActiveDeliveriesTableProps {
  trucks: LogisticsTruck[];
  openModal: (modalId: string) => void;
}

export const ActiveDeliveriesTable: React.FC<ActiveDeliveriesTableProps> = ({ trucks = [], openModal }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-800">Active Deliveries</h3>
          <button
            onClick={() => openModal('logisticsModal')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
          >
            View All
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">TRUCK / DRIVER</th>
                <th className="py-2.5 px-3">FROM</th>
                <th className="py-2.5 px-3">TO</th>
                <th className="py-2.5 px-3">ETA</th>
                <th className="py-2.5 px-3 text-right">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(trucks || []).slice(0, 3).map((truck, idx) => (
                <tr key={truck.id || idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs border border-slate-200">
                        🚚
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{truck.truckPlate}</div>
                        <div className="text-[11px] text-slate-500">{truck.driverName}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-slate-600 font-medium">
                    {truck.fromLoc || 'Bindura Depot'}
                  </td>
                  <td className="py-3 px-3 text-slate-600 font-medium">
                    {truck.toLoc || 'Murehwa Ward 12'}
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-900">{truck.eta || '1h 25m'}</div>
                    <div className="text-[10px] text-slate-400">10:30 AM</div>
                  </td>
                  <td className="py-3 px-3 text-right">
                    {truck.status === 'Delayed' ? (
                      <span className="inline-block px-2 py-0.5 text-[10px] font-bold text-amber-700 bg-amber-100/80 rounded-full uppercase">
                        Delayed
                      </span>
                    ) : truck.status === 'Received by Supplier' ? (
                      <span className="inline-block px-2 py-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-100/80 rounded-full uppercase">
                        Received
                      </span>
                    ) : (
                      <span className="inline-block px-2 py-0.5 text-[10px] font-bold text-blue-700 bg-blue-100/80 rounded-full uppercase">
                        On Route
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <button
        onClick={() => openModal('logisticsModal')}
        className="w-full mt-4 py-1.5 border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium rounded-md transition-colors cursor-pointer text-center"
      >
        View All Deliveries
      </button>
    </div>
  );
};
