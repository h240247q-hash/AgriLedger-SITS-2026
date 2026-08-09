import React, { useState } from 'react';
import { LogisticsTruck } from '../../types';
import { createLogisticsTruck, approveDelivery } from '../../api/client';

interface LogisticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  trucks: LogisticsTruck[];
  onSuccess: () => void;
}

export const LogisticsModal: React.FC<LogisticsModalProps> = ({
  isOpen,
  onClose,
  trucks = [],
  onSuccess,
}) => {
  const [fleetDriver, setFleetDriver] = useState('');
  const [fleetTruck, setFleetTruck] = useState('');

  if (!isOpen) return null;

  const handleDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createLogisticsTruck(fleetDriver, fleetTruck);
      alert('🚚 Cargo Dispatched.');
      setFleetDriver('');
      setFleetTruck('');
      onSuccess();
    } catch (err) {
      alert('Failed to dispatch cargo');
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await approveDelivery(id);
      alert('✅ DELIVERY CERTIFIED.');
      onSuccess();
    } catch (err) {
      alert('Failed to approve delivery');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-base font-bold text-gray-800 mb-1">
          🚚 Logistics Fleet Inventory Logs
        </h3>
        <p className="text-xs text-gray-500 mb-4 leading-relaxed">
          Register product transport dispatch metrics. Unapproved assets stay in transit until explicitly certified by the supplier.
        </p>

        {/* Dispatch Form */}
        <form onSubmit={handleDispatch} className="bg-gray-50 border border-gray-200 p-4 rounded-xl mb-5">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Driver's Name</label>
              <input
                type="text"
                value={fleetDriver}
                onChange={(e) => setFleetDriver(e.target.value)}
                placeholder="e.g. T. Mukamuri"
                className="w-full px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Truck Number Plate</label>
              <input
                type="text"
                value={fleetTruck}
                onChange={(e) => setFleetTruck(e.target.value)}
                placeholder="e.g. ABB 4421"
                className="w-full px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg outline-none"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-[#2d6a4f] hover:bg-[#1b4332] text-white text-xs font-semibold py-2 rounded-lg cursor-pointer transition-colors"
          >
            🚚 Log & Dispatch Cargo Asset
          </button>
        </form>

        <h4 className="text-xs font-bold text-gray-800 mb-3">Active Fleet Dispatch Manifest Ledger</h4>
        <div className="overflow-x-auto mb-4">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-gray-500 font-semibold uppercase text-[10px]">
                <th className="py-2 px-3">Truck Plate</th>
                <th className="py-2 px-3">Driver Name</th>
                <th className="py-2 px-3">Status</th>
                <th className="py-2 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(trucks || []).map((t) => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="py-2.5 px-3 font-bold text-gray-800">{t.truckPlate}</td>
                  <td className="py-2.5 px-3 text-gray-600">{t.driverName}</td>
                  <td className="py-2.5 px-3">
                    {t.status === 'Received by Supplier' ? (
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                        Received by Supplier
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800">
                        In Transit
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    {t.status === 'Received by Supplier' ? (
                      <span className="text-[11px] text-gray-400 font-semibold">Signed</span>
                    ) : (
                      <button
                        onClick={() => handleApprove(t.id)}
                        className="bg-[#2d6a4f] hover:bg-[#1b4332] text-white text-[11px] font-bold px-2.5 py-1 rounded cursor-pointer"
                      >
                        ✓ Approve
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg cursor-pointer"
          >
            Close Panel
          </button>
        </div>
      </div>
    </div>
  );
};
