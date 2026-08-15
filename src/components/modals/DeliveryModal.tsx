import React, { useState } from 'react';
import { addDeliveryPayoutApi } from '../../api/client';

interface DeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const DeliveryModal: React.FC<DeliveryModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [fid, setFid] = useState('');
  const [weight, setWeight] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDeliveryPayoutApi(fid, parseFloat(weight));
      alert(`🌾 Payout Weight Logged: ${weight} Tons for Farmer ${fid}`);
      setFid('');
      setWeight('');
      onSuccess?.();
      onClose();
    } catch (err) {
      alert('Failed to log payout weight');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
        <h3 className="text-base font-bold text-gray-800 mb-4 border-b border-gray-100 pb-3">
          🌾 Process Depot Intake Delivery Weight
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Farmer Allocation ID
            </label>
            <input
              type="text"
              value={fid}
              onChange={(e) => setFid(e.target.value)}
              placeholder="e.g. AL-FARM-001"
              className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Net Weight Payload (Tons)
            </label>
            <input
              type="number"
              step="0.01"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="e.g. 4.5"
              className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg outline-none"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold bg-[#2d6a4f] hover:bg-[#1b4332] text-white rounded-lg cursor-pointer"
            >
              Log Payout Weight
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
