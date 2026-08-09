import React, { useState } from 'react';
import { CustomCropOffer } from '../../types';
import { createCustomCrop, executeDeal } from '../../api/client';

interface MarketplaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  cropOffers: CustomCropOffer[];
  onSuccess: () => void;
}

export const MarketplaceModal: React.FC<MarketplaceModalProps> = ({
  isOpen,
  onClose,
  cropOffers = [],
  onSuccess,
}) => {
  const [cropName, setCropName] = useState('');
  const [askingPrice, setAskingPrice] = useState('');

  const [negBuyer, setNegBuyer] = useState('Grain Marketing Board (GMB)');
  const [negCrop, setNegCrop] = useState('');
  const [negPayout, setNegPayout] = useState('');

  if (!isOpen) return null;

  const handleAddCrop = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCustomCrop(cropName, parseFloat(askingPrice));
      alert(`🌾 Offer Added: ${cropName}`);
      setCropName('');
      setAskingPrice('');
      onSuccess();
    } catch (err) {
      alert('Failed to add crop offer');
    }
  };

  const handleNegotiate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await executeDeal(negBuyer, negCrop, parseFloat(negPayout));
      alert('✅ CONTRACT APPROVED & SETTLED');
      setNegCrop('');
      setNegPayout('');
      onSuccess();
      onClose();
    } catch (err) {
      alert('Failed to execute deal');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-xl w-full shadow-2xl max-h-[90vh] overflow-y-auto space-y-6">
        <h3 className="text-base font-bold text-gray-800 border-b border-gray-100 pb-3">
          📈 Decentralized Market Pricing Board
        </h3>

        {/* Farmer Crop Registration Box */}
        <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl">
          <h4 className="text-xs font-bold text-[#2d6a4f] mb-3">
            🌾 Register & Value Your Custom Harvest Crop
          </h4>
          <form onSubmit={handleAddCrop} className="flex gap-2 items-end mb-4">
            <div className="flex-2">
              <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                Crop Commodity Name
              </label>
              <input
                type="text"
                value={cropName}
                onChange={(e) => setCropName(e.target.value)}
                placeholder="e.g. Premium White Maize"
                className="w-full px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-md outline-none"
                required
              />
            </div>
            <div className="flex-1">
              <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                Asking Price / Ton
              </label>
              <input
                type="number"
                value={askingPrice}
                onChange={(e) => setAskingPrice(e.target.value)}
                placeholder="e.g. 360"
                className="w-full px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-md outline-none"
                required
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-[#2d6a4f] hover:bg-[#1b4332] text-white text-xs font-semibold rounded-md cursor-pointer"
            >
              + Add
            </button>
          </form>

          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-200 text-gray-400 font-semibold">
                <th className="py-2">Farmer's Listed Crop Spec</th>
                <th className="py-2">Asking Value</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(cropOffers || []).map((o) => (
                <tr key={o.id}>
                  <td className="py-2 font-bold text-gray-800">{o.cropName}</td>
                  <td className="py-2 text-gray-700">${o.askingPrice} / Ton</td>
                  <td className="py-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                      Live Offer
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Corporate Buyers */}
        <div>
          <h4 className="text-xs font-bold text-gray-800 mb-2">
            🏢 Verified Corporate Buyers & Floor Contracts
          </h4>
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-200 text-gray-400 font-semibold">
                <th className="py-2">Buyer Enterprise</th>
                <th className="py-2">Primary Intake Point</th>
                <th className="py-2">Verification Stamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td className="py-2 font-bold text-gray-800">Grain Marketing Board (GMB)</td>
                <td className="py-2 text-gray-600">Chitungwiza Depot Hub</td>
                <td className="py-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                    ✓ State Verified
                  </span>
                </td>
              </tr>
              <tr>
                <td className="py-2 font-bold text-gray-800">Delta Corporation</td>
                <td className="py-2 text-gray-600">Harare Central Intake</td>
                <td className="py-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-800">
                    ✓ Certified Enterprise
                  </span>
                </td>
              </tr>
              <tr>
                <td className="py-2 font-bold text-gray-800">National Foods Ltd</td>
                <td className="py-2 text-gray-600">Bulawayo Milling Terminal</td>
                <td className="py-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-800">
                    ✓ Certified Enterprise
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Deal Negotiator Form */}
        <div className="bg-amber-50/60 border border-amber-200 p-4 rounded-xl">
          <h4 className="text-xs font-bold text-amber-800 mb-3">
            🤝 Corporate Buyer Offer Negotiator Panel
          </h4>
          <form onSubmit={handleNegotiate} className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                Select Verified Corporate Counterparty
              </label>
              <select
                value={negBuyer}
                onChange={(e) => setNegBuyer(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-md outline-none"
              >
                <option value="Grain Marketing Board (GMB)">Grain Marketing Board (GMB)</option>
                <option value="Delta Corporation">Delta Corporation</option>
                <option value="National Foods Ltd">National Foods Ltd</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                  Crop Commodity
                </label>
                <input
                  type="text"
                  value={negCrop}
                  onChange={(e) => setNegCrop(e.target.value)}
                  placeholder="e.g. Premium White Maize"
                  className="w-full px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-md outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                  Negotiated Payout ($ Amount)
                </label>
                <input
                  type="number"
                  value={negPayout}
                  onChange={(e) => setNegPayout(e.target.value)}
                  placeholder="e.g. 450"
                  className="w-full px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-md outline-none"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#d08200] hover:bg-[#b06f00] text-white text-xs font-bold py-2.5 rounded-lg cursor-pointer transition-colors shadow-2xs"
            >
              🤝 Accept Offer & Sign Deal
            </button>
          </form>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg cursor-pointer"
          >
            Close Pricing Board
          </button>
        </div>
      </div>
    </div>
  );
};
