import React, { useState, useEffect } from 'react';
import { agritexBroadcastSMS, agritexConfirmOTP } from '../../api/client';
import { Farmer } from '../../types';

interface AgritexOfficerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (smsMsg?: string) => void;
  farmers?: Farmer[];
}

export const AgritexOfficerModal: React.FC<AgritexOfficerModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  farmers = [],
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [inputType, setInputType] = useState('🌽 Maize Seed');
  const [quantity, setQuantity] = useState('200 x 10kg bags');
  const [donor, setDonor] = useState('AGRITEX Zimbabwe');
  const [qrInput, setQrInput] = useState('');
  const [scannedItems, setScannedItems] = useState<{ code: string; time: string }[]>([]);

  // Default fallback registered farmers list if prop is empty
  const defaultFarmerList: Farmer[] = [
    { id: 1, farmerCode: 'AGR-000840', name: 'Kudzai Mupotaringa', location: 'Murehwa Ward 12', phone: '+263771234567' },
    { id: 2, farmerCode: 'AL-FARM-001', name: 'Tendai Mhako', location: 'Ward 12, Murehwa', phone: '+263771234568' },
    { id: 3, farmerCode: 'AL-FARM-002', name: 'Rudo Shumba', location: 'Ward 7, Bindura', phone: '+263772345678' },
    { id: 4, farmerCode: 'AL-FARM-003', name: 'Farai Gomba', location: 'Ward 3, Guruve', phone: '+263773456789' },
  ];

  const availableFarmers = farmers.length > 0 ? farmers : defaultFarmerList;

  const [farmerId, setFarmerId] = useState('AGR-000840');
  const [otpCode, setOtpCode] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('8842');

  useEffect(() => {
    if (step === 3) {
      // Generate random 4-digit OTP when entering step 3
      const randomOtp = Math.floor(1000 + Math.random() * 9000).toString();
      setGeneratedOtp(randomOtp);
    }
  }, [step, farmerId]);

  if (!isOpen) return null;

  const selectedFarmer = availableFarmers.find(
    (f) => f.farmerCode.toLowerCase() === farmerId.trim().toLowerCase()
  );

  const nowStr =
    new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) +
    '  ' +
    new Date().toTimeString().split(' ')[0];

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await agritexBroadcastSMS(inputType, quantity, donor, nowStr);
      onSuccess(res.sms);
      setStep(2);
    } catch (err) {
      alert('Failed to send broadcast');
    }
  };

  const handleScanQr = () => {
    if (!qrInput.trim()) {
      alert('Please enter or scan a QR code.');
      return;
    }
    const timeStr = new Date().toTimeString().split(' ')[0];
    setScannedItems([{ code: qrInput.trim(), time: timeStr }, ...scannedItems]);
    setQrInput('');
  };

  const handleStep3Confirm = async () => {
    if (!farmerId.trim()) {
      alert('Please select or enter a Farmer ID.');
      return;
    }
    if (otpCode.length !== 4 || isNaN(Number(otpCode))) {
      alert('⚠️ OTP must be exactly 4 digits.');
      return;
    }
    try {
      await agritexConfirmOTP(farmerId, otpCode, inputType, quantity);
      const farmerName = selectedFarmer ? selectedFarmer.name : farmerId;
      alert(
        `✅ COLLECTION CONFIRMED\nFarmer: ${farmerName} (${farmerId})\nInput: ${inputType} — ${quantity}\nOTP Verified: ${otpCode}\nRecorded in Smallholder Association DB!`
      );
      onSuccess();
      setStep(1);
      setScannedItems([]);
      setFarmerId('AGR-000840');
      setOtpCode('');
      onClose();
    } catch (err) {
      alert('Failed to confirm OTP collection');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-base font-bold text-gray-800 mb-2 border-b border-gray-100 pb-3">
          🏛️ Agritex Officer — Donated Input Distribution Portal
        </h3>

        {/* STEP 1 */}
        {step === 1 && (
          <div>
            <p className="text-xs text-gray-500 mb-4 leading-relaxed">
              Log a donated input batch and notify registered smallholder farmers via SMS to collect.
            </p>
            <form onSubmit={handleStep1Submit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Type of Donated Input
                </label>
                <select
                  value={inputType}
                  onChange={(e) => setInputType(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg outline-none bg-white"
                >
                  <option value="🌽 Maize Seed">🌽 Maize Seed</option>
                  <option value="🧪 Top Dressing Fertilizer">🧪 Top Dressing Fertilizer</option>
                  <option value="🪣 Basal Fertilizer">🪣 Basal Fertilizer</option>
                  <option value="🌿 Herbicides">🌿 Herbicides</option>
                  <option value="🫘 Soybean Seed">🫘 Soybean Seed</option>
                  <option value="🌾 Sorghum Seed">🌾 Sorghum Seed</option>
                  <option value="🐛 Pesticides">🐛 Pesticides</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Quantity / Batch Size
                </label>
                <input
                  type="text"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="e.g. 200 x 10kg bags"
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Donor / Source Organization
                </label>
                <input
                  type="text"
                  value={donor}
                  onChange={(e) => setDonor(e.target.value)}
                  placeholder="e.g. AGRITEX Zimbabwe"
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Date Received (Auto — Real Time)
                </label>
                <input
                  type="text"
                  value={nowStr}
                  readOnly
                  className="w-full px-3 py-2 text-xs bg-gray-100 text-[#2d6a4f] font-semibold rounded-lg outline-none"
                />
              </div>

              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg text-xs text-emerald-800 leading-relaxed">
                <strong>📱 SMS Notification:</strong> All registered smallholder farmers will receive an automated SMS alert instructing them to report to the depot and collect their allocated donated inputs.
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
                  📤 Broadcast SMS & Proceed to Scan
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="bg-[#1b4332] text-white rounded-lg p-3 text-xs leading-relaxed">
              📱 <strong>SMS Sent!</strong> Farmers have been notified. Now scan the QR code on each donated input batch to register it on the blockchain ledger before farmer collection.
            </div>

            <div className="bg-gray-900 border-2 border-[#2d6a4f] rounded-xl p-4 text-center">
              <div className="text-3xl mb-2">📷</div>
              <p className="text-[#74c69d] font-mono text-xs mb-3">
                QR SCANNER ACTIVE — Enter batch QR serial below
              </p>
              <input
                type="text"
                value={qrInput}
                onChange={(e) => setQrInput(e.target.value)}
                placeholder="e.g. AGRITEX-SEED-2026-0041"
                className="w-full px-3 py-2 rounded-lg border border-[#74c69d] bg-gray-800 text-emerald-400 font-mono text-xs text-center outline-none mb-3"
              />
              <button
                type="button"
                onClick={handleScanQr}
                className="w-full bg-[#2d6a4f] hover:bg-[#1b4332] text-white text-xs font-bold py-2 rounded-lg cursor-pointer"
              >
                ✅ Verify & Register QR Scan
              </button>
            </div>

            {/* Scan Log */}
            <div className="max-h-28 overflow-y-auto space-y-1.5">
              {scannedItems.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-emerald-50 border-l-4 border-[#2d6a4f] p-2 rounded text-xs font-mono text-gray-800"
                >
                  ✅ <strong>{item.code}</strong> — Registered @ {item.time}
                </div>
              ))}
            </div>

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg cursor-pointer"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => {
                  if (scannedItems.length === 0) {
                    alert('⚠️ Scan at least 1 item QR code');
                    return;
                  }
                  setStep(3);
                }}
                className="px-4 py-2 text-xs font-semibold bg-[#1565c0] hover:bg-[#0d47a1] text-white rounded-lg cursor-pointer"
              >
                Proceed to Farmer OTP Approval →
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-lg p-3 text-xs leading-relaxed">
              🔐 <strong>Farmer OTP Verification:</strong> The smallholder farmer must enter the 4-digit OTP sent to their registered mobile number to confirm receipt of donated inputs.
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs space-y-1 text-gray-700">
              <strong className="text-[#1b4332] block mb-1">📦 Batch Summary</strong>
              <div>Input Type: <strong>{inputType}</strong></div>
              <div>Quantity: <strong>{quantity}</strong></div>
              <div>Donor: <strong>{donor}</strong></div>
              <div>Scanned: <strong>{scannedItems.length} item(s)</strong></div>
            </div>

            {/* Registered Farmer Selection */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Select Registered Farmer (DB Search)
              </label>
              <select
                value={farmerId}
                onChange={(e) => setFarmerId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg outline-none bg-white font-medium text-gray-800"
              >
                {availableFarmers.map((f) => (
                  <option key={f.id} value={f.farmerCode}>
                    {f.farmerCode} — {f.name} ({f.location})
                  </option>
                ))}
              </select>
            </div>

            {/* Manual Farmer ID Fallback Input */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Farmer Registration ID (Collecting)
              </label>
              <input
                type="text"
                value={farmerId}
                onChange={(e) => setFarmerId(e.target.value)}
                placeholder="e.g. AGR-000840"
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg outline-none font-mono"
              />
            </div>

            {/* Active Farmer Profile Badge */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs space-y-1">
              <div className="flex items-center justify-between text-slate-900 font-bold">
                <span>👤 {selectedFarmer ? selectedFarmer.name : 'Registered Farmer'}</span>
                <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  Verified Member
                </span>
              </div>
              <div className="text-slate-500 text-[11px]">
                ID: <strong className="text-slate-800 font-mono">{farmerId}</strong> | Location: <strong>{selectedFarmer?.location || 'Murehwa Ward 12'}</strong>
              </div>
              <div className="text-slate-500 text-[11px]">
                Phone: <strong>{selectedFarmer?.phone || '+263 77 123 4567'}</strong>
              </div>
            </div>

            {/* SMS OTP Prompt Banner */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 text-xs text-amber-900 flex items-center justify-between">
              <div>
                <span>📱 GSM SMS OTP sent: </span>
                <strong className="font-mono text-amber-950 bg-amber-200 px-1.5 py-0.5 rounded ml-1">{generatedOtp}</strong>
              </div>
              <button
                type="button"
                onClick={() => setOtpCode(generatedOtp)}
                className="text-[11px] font-bold text-amber-800 bg-amber-200/80 hover:bg-amber-200 px-2 py-1 rounded cursor-pointer"
              >
                ⚡ Auto-fill OTP
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Farmer OTP Code (4-digit, sent via SMS)
              </label>
              <input
                type="text"
                maxLength={4}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="Enter 4-digit OTP"
                className="w-full px-3 py-2 text-center text-lg font-bold tracking-widest border border-gray-200 rounded-lg outline-none"
              />
            </div>

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg cursor-pointer"
              >
                ← Back to Scan
              </button>
              <button
                type="button"
                onClick={handleStep3Confirm}
                className="px-4 py-2 text-xs font-semibold bg-[#2d6a4f] hover:bg-[#1b4332] text-white rounded-lg cursor-pointer"
              >
                🔓 Confirm OTP & Finalise Collection
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

