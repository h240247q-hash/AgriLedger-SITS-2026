import React from 'react';

interface DeliveryMapWidgetProps {
  openModal: (modalId: string) => void;
}

export const DeliveryMapWidget: React.FC<DeliveryMapWidgetProps> = ({ openModal }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-800">Delivery Route Telemetry</h3>
        <button
          onClick={() => openModal('logisticsModal')}
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
        >
          View Full Map
        </button>
      </div>

      {/* Interactive Vector Route Canvas */}
      <div className="relative w-full h-44 bg-slate-900 rounded-md border border-slate-800 overflow-hidden flex items-center justify-center p-2 shadow-inner">
        {/* Topography Grid Pattern Background */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#94a3b8 1px, transparent 1px)`,
            backgroundSize: '16px 16px',
          }}
        ></div>

        <svg className="w-full h-full relative z-10" viewBox="0 0 300 150">
          {/* Animated Route Line */}
          <path
            d="M 60 30 L 180 60 L 100 120 L 220 110"
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            strokeDasharray="4,4"
            className="animate-pulse"
          />

          {/* Location Waypoints */}
          {/* Bindura */}
          <circle cx="60" cy="30" r="4" fill="#10b981" stroke="#0f172a" strokeWidth="1.5" />
          <text x="60" y="20" textAnchor="middle" className="text-[10px] font-semibold fill-slate-300">
            Bindura
          </text>

          {/* Murehwa */}
          <circle cx="180" cy="60" r="4" fill="#10b981" stroke="#0f172a" strokeWidth="1.5" />
          <text x="180" y="50" textAnchor="middle" className="text-[10px] font-semibold fill-slate-300">
            Murehwa
          </text>

          {/* Harare */}
          <circle cx="100" cy="120" r="4" fill="#10b981" stroke="#0f172a" strokeWidth="1.5" />
          <text x="100" y="138" textAnchor="middle" className="text-[10px] font-semibold fill-slate-300">
            Harare
          </text>

          {/* Marondera */}
          <circle cx="220" cy="110" r="4" fill="#f43f5e" stroke="#0f172a" strokeWidth="1.5" />
          <text x="220" y="128" textAnchor="middle" className="text-[10px] font-semibold fill-slate-300">
            Marondera
          </text>

          {/* Truck Marker Icon */}
          <g transform="translate(145, 80)">
            <rect x="-12" y="-8" width="24" height="16" rx="3" fill="#2563eb" stroke="#ffffff" strokeWidth="1" />
            <text x="0" y="4" textAnchor="middle" className="text-[10px] fill-white">
              🚚
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
};
