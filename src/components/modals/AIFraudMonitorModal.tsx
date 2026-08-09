import React, { useState } from 'react';
import { sendFraudReport } from '../../api/client';

interface AIFraudMonitorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AIFraudMonitorModal: React.FC<AIFraudMonitorModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [details, setDetails] = useState('');
  const [location, setLocation] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await sendFraudReport(details, location);
      alert('🔒 ANONYMOUS BROADCAST SECURED');
      setDetails('');
      setLocation('');
      onSuccess();
      onClose();
    } catch (err) {
      alert('Failed to send report');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
        <h3 className="text-base font-bold text-gray-800 mb-1">
          🛡️ Anonymous AI Fraud Tracker Registry
        </h3>
        <p className="text-xs text-gray-500 mb-4 leading-relaxed">
          Report supply line corruption, diversion of fertilizer, or black market inputs securely to the centralized ledger.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Actual Fraud / Corruption Incident Details
            </label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Describe exactly what happened (e.g. Unauthorized resale of certified seed maize bags after hours...)"
              className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg outline-none min-h-[90px] focus:ring-2 focus:ring-[#2d6a4f]/20"
              required
            ></textarea>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Location / Depot Specific Point
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Gweru Central Distribution Depot, Shed B"
              className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#2d6a4f]/20"
              required
            />
          </div>

          <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg text-xs text-emerald-800 font-medium leading-relaxed">
            🔒 Encryption Protocol Active: Your real device IP, name, and meta-coordinates will be stripped. This report goes to the feed anonymously.
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
              className="px-4 py-2 text-xs font-semibold bg-[#d90429] hover:bg-[#b00320] text-white rounded-lg cursor-pointer"
            >
              🔒 Send Anonymously
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
