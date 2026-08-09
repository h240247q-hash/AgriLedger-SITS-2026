import React, { useState } from 'react';
import { createSupplier } from '../../api/client';

interface SupplierRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const SupplierRegistrationModal: React.FC<SupplierRegistrationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const supplier = await createSupplier(name, location);
      alert(`🏭 SUPPLIER ONBOARDING SUCCESSFUL:\nID: ${supplier.supplierCode || 'AL-SUPP'}`);
      setName('');
      setLocation('');
      onSuccess();
      onClose();
    } catch (err) {
      alert('Failed to register supplier');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
        <h3 className="text-base font-bold text-gray-800 mb-1">
          🏭 New Supplier Registration Entry
        </h3>
        <p className="text-xs text-gray-500 mb-4 leading-relaxed">
          Provision a new input manufacturing supplier node entry into the AgriLedger platform ledger.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Enterprise / Supplier Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. ZimChem Logistics Ltd"
              className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#2d6a4f]/20"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Operational Hub Province / District
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Midlands Province"
              className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#2d6a4f]/20"
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
              Save Supplier Profile & Generate Code
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
