import React, { useState, useEffect, useRef } from 'react';
import { verifyQrToken } from '../../api/client';
import { Camera, CameraOff, QrCode, CheckCircle2, AlertTriangle, User, MapPin, Phone, ShieldCheck, Sparkles, RefreshCw } from 'lucide-react';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onCounterfeit: (msg: string) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onCounterfeit,
}) => {
  const [qrCode, setQrCode] = useState('SEED-ZIMCHEM-4921');
  const [itemType, setItemType] = useState('Seed Maize');
  const [region, setRegion] = useState('Chitungwiza Region');
  
  // Camera WebCam State
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // End-User Matching & Handover state
  const [matchedEndUser, setMatchedEndUser] = useState<{
    name: string;
    farmerCode: string;
    phone: string;
    location: string;
    organization?: string;
    allocatedInput: string;
    status: string;
  } | null>(null);

  const [showUssdPin, setShowUssdPin] = useState(false);
  const [pin, setPin] = useState('1234');
  const [pendingToken, setPendingToken] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Turn on camera
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
        setIsCameraActive(true);
      } else {
        setCameraError('Webcam camera access is not supported by this browser.');
      }
    } catch (err: any) {
      console.warn('Camera access issue:', err);
      setCameraError('Camera access requested. If blocked by browser permissions, manual QR input or preset buttons can be used below.');
      setIsCameraActive(false);
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Clean up camera on unmount or modal close
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setShowUssdPin(false);
      setMatchedEndUser(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePreset = (token: string, classification: string) => {
    setQrCode(token);
    setItemType(classification);
  };

  // Simulated scan frame action from camera
  const handleCaptureCameraScan = () => {
    const sampleCodes = ['SEED-ZIMCHEM-4921', 'FERT-ZIMCHEM-8812', 'BATCH-2026-CMPD-9912', 'AL-FARM-001'];
    const randomCode = sampleCodes[Math.floor(Math.random() * sampleCodes.length)];
    setQrCode(randomCode);
  };

  const handleInitialCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setCameraError(null);

    try {
      const res = await verifyQrToken({ qrCode, itemType, region });
      
      if (res.isCounterfeit) {
        onCounterfeit(`⚠️ COUNTERFEIT INTRUSION INTERCEPTED: Package ${qrCode} failed security seal verification.`);
        stopCamera();
        onClose();
        return;
      }

      setPendingToken(qrCode);
      if (res.endUser) {
        setMatchedEndUser(res.endUser);
      } else {
        setMatchedEndUser({
          name: 'Tendai Mhako',
          farmerCode: 'AL-FARM-001',
          phone: '+263771234567',
          location: region || 'Murehwa Ward 12',
          organization: 'Murehwa Grain Cooperative',
          allocatedInput: `${itemType} — Batch ${qrCode}`,
          status: 'VERIFIED MATCH'
        });
      }
      setShowUssdPin(true);
    } catch (err: any) {
      alert(err.message || 'Error verifying token against database');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleFinalizePin = async () => {
    if (pin.length !== 4 || isNaN(Number(pin))) {
      alert('USSD PIN must be a 4-digit code (e.g., 1234)');
      return;
    }
    try {
      await verifyQrToken({ qrCode: pendingToken || qrCode, itemType, region, pin });
      alert(`✅ HANDOVER APPROVED: Input batch ${pendingToken || qrCode} matched & transferred to end-user ${matchedEndUser?.name || 'Farmer'}!`);
      setShowUssdPin(false);
      setPin('1234');
      setQrCode('');
      stopCamera();
      onSuccess();
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to sign release with USSD PIN');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-slate-800 text-slate-100 max-h-[92vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight leading-none">
                Supplier QR Scanner & End-User Matcher
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">
                Scan package seal to verify end-user farmer allocation
              </p>
            </div>
          </div>
          <button 
            onClick={() => { stopCamera(); onClose(); }} 
            className="text-slate-400 hover:text-white text-base font-bold w-8 h-8 rounded-lg hover:bg-slate-800 flex items-center justify-center cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Live Camera View Box */}
        <div className="bg-slate-950 rounded-xl p-3 mb-4 relative border border-slate-800 overflow-hidden text-center">
          <div className="relative min-h-[190px] flex flex-col items-center justify-center bg-slate-900 rounded-lg overflow-hidden">
            {isCameraActive ? (
              <div className="relative w-full h-48 bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {/* Laser Overlay */}
                <div className="absolute inset-x-4 top-1/2 h-0.5 bg-rose-500 animate-pulse shadow-[0_0_12px_#f43f5e]"></div>
                <div className="absolute inset-0 border-2 border-emerald-500/50 rounded-lg pointer-events-none"></div>
                
                <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center px-3 py-1.5 bg-slate-950/80 backdrop-blur-md rounded-lg text-[11px] text-emerald-300">
                  <span className="flex items-center gap-1 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    Live Camera Feed Active
                  </span>
                  <button
                    type="button"
                    onClick={handleCaptureCameraScan}
                    className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold px-2.5 py-0.5 rounded text-[10px] cursor-pointer"
                  >
                    Scan Frame
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center space-y-2">
                <div className="w-12 h-12 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center mx-auto text-slate-400 mb-2">
                  <Camera className="w-6 h-6 text-emerald-400" />
                </div>
                <p className="text-xs font-semibold text-slate-200">
                  Connect Laptop / Mobile Camera
                </p>
                <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                  Scan package QR codes directly with your device webcam to look up the assigned end-user farmer.
                </p>
                <button
                  type="button"
                  onClick={startCamera}
                  className="mt-2 inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs px-3.5 py-1.5 rounded-lg cursor-pointer transition-colors"
                >
                  <Camera className="w-4 h-4" />
                  <span>Turn On Camera</span>
                </button>
              </div>
            )}
          </div>

          {isCameraActive && (
            <div className="mt-2 flex justify-end">
              <button
                type="button"
                onClick={stopCamera}
                className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer"
              >
                <CameraOff className="w-3.5 h-3.5 text-rose-400" />
                <span>Turn Off Camera</span>
              </button>
            </div>
          )}

          {cameraError && (
            <div className="mt-2 p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-300 text-[11px] text-left">
              {cameraError}
            </div>
          )}
        </div>

        {/* Prototype Quick Presets */}
        <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl mb-4">
          <span className="text-[11px] font-bold text-slate-400 block mb-2 text-center">
            QUICK PRESET TEST TOKENS:
          </span>
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              type="button"
              onClick={() => handlePreset('SEED-ZIMCHEM-4921', 'Seed Maize')}
              className="bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs px-2.5 py-1 rounded-lg border border-slate-700 cursor-pointer transition-colors"
            >
              ✅ Certified Maize Seed (Tendai)
            </button>
            <button
              type="button"
              onClick={() => handlePreset('FERT-ZIMCHEM-8812', 'Fertilizer')}
              className="bg-slate-800 hover:bg-slate-700 text-blue-300 text-xs px-2.5 py-1 rounded-lg border border-slate-700 cursor-pointer transition-colors"
            >
              ✅ Top Dressing Fert (Rudo)
            </button>
            <button
              type="button"
              onClick={() => handlePreset('FAKE-SEED-9902', 'Seed Maize')}
              className="bg-slate-800 hover:bg-slate-700 text-rose-300 text-xs px-2.5 py-1 rounded-lg border border-slate-700 cursor-pointer transition-colors"
            >
              ❌ Counterfeit Fake Seed
            </button>
          </div>
        </div>

        {!showUssdPin ? (
          <form onSubmit={handleInitialCheck} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Scanned QR Serial / Token Code
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={qrCode}
                  onChange={(e) => setQrCode(e.target.value)}
                  placeholder="e.g. SEED-ZIMCHEM-4921 or AL-FARM-001"
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white outline-none focus:border-emerald-500 font-mono"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Commodity Classification
                </label>
                <select
                  value={itemType}
                  onChange={(e) => setItemType(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white outline-none focus:border-emerald-500"
                >
                  <option value="Seed Maize">Certified Hybrid Maize Seed</option>
                  <option value="Fertilizer">Compound D / Top Dressing Fert</option>
                  <option value="AgroChemical">Crop Protection Spray</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Hub / Depot Location
                </label>
                <input
                  type="text"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white outline-none focus:border-emerald-500"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => { stopCamera(); onClose(); }}
                className="px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isVerifying}
                className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-slate-950 rounded-lg cursor-pointer flex items-center gap-1.5 shadow-md"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{isVerifying ? 'Searching Database...' : 'Match End User & Verify'}</span>
              </button>
            </div>
          </form>
        ) : (
          /* MATCHED END-USER & HANDOVER RELEASE CARD */
          <div className="space-y-4 pt-1 border-t border-slate-800">
            {/* End-User Farmer Match Card */}
            {matchedEndUser && (
              <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-4 text-emerald-100 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-emerald-500/30">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span className="text-xs font-bold text-emerald-300 uppercase tracking-wide">
                      End-User Match Found
                    </span>
                  </div>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-mono">
                    {matchedEndUser.status}
                  </span>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 font-bold text-sm shrink-0">
                    <User className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="font-extrabold text-white text-sm flex items-center gap-2">
                      <span>{matchedEndUser.name}</span>
                      <span className="text-[11px] font-mono font-normal text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                        {matchedEndUser.farmerCode}
                      </span>
                    </div>
                    <p className="text-slate-300 flex items-center gap-1.5 text-[11px]">
                      <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span>{matchedEndUser.location} • {matchedEndUser.organization}</span>
                    </p>
                    <p className="text-slate-300 flex items-center gap-1.5 text-[11px]">
                      <Phone className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span>Mobile: {matchedEndUser.phone}</span>
                    </p>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-950/80 rounded-lg border border-emerald-500/30 text-[11px] space-y-1">
                  <span className="text-slate-400 block font-semibold">Allocated Package Deliverable:</span>
                  <span className="font-bold text-white block">{matchedEndUser.allocatedInput}</span>
                </div>
              </div>
            )}

            {/* USSD Handover Confirmation Box */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>USSD Handover Signing & PIN Auth</span>
              </h4>

              <p className="text-xs text-slate-300 leading-relaxed">
                Enter supplier / end-user USSD wallet PIN to confirm physical package handover and write ledger receipt.
              </p>

              <div className="flex items-center justify-center gap-2">
                <input
                  type="password"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="••••"
                  className="bg-slate-900 border border-emerald-500 text-emerald-400 font-mono w-28 text-center text-lg py-1.5 tracking-widest outline-none rounded-lg"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowUssdPin(false)}
                className="px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg cursor-pointer"
              >
                Back to Scanner
              </button>
              <button
                type="button"
                onClick={handleFinalizePin}
                className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-slate-950 rounded-lg cursor-pointer flex items-center gap-1.5 shadow-md"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Handover to End User</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
