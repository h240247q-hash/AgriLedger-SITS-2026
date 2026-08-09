import React from 'react';

interface MarketPricesWidgetProps {
  openModal: (modalId: string) => void;
}

export const MarketPricesWidget: React.FC<MarketPricesWidgetProps> = ({ openModal }) => {
  const items = [
    { name: 'Maize', unit: '1 Ton', price: 'ZWL 8,500', trend: '+2.4%', isUp: true, icon: '🌽' },
    { name: 'Wheat', unit: '1 Ton', price: 'ZWL 9,200', trend: '+1.7%', isUp: true, icon: '🌾' },
    { name: 'Soyabean', unit: '1 Ton', price: 'ZWL 12,300', trend: '-1.2%', isUp: false, icon: '🫘' },
    { name: 'Fertilizer', unit: '50kg', price: 'ZWL 1,050', trend: '+0.8%', isUp: true, icon: '🧪' },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-800">Market Prices Overview</h3>
          <button
            onClick={() => openModal('marketplaceModal')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
          >
            View All
          </button>
        </div>

        <div className="space-y-3">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-none">
              <div className="flex items-center gap-2.5">
                <span className="text-base">{item.icon}</span>
                <div>
                  <span className="text-xs font-semibold text-slate-900">{item.name} </span>
                  <span className="text-[11px] text-slate-400">({item.unit})</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-900 font-mono">{item.price}</span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    item.isUp ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'
                  }`}
                >
                  {item.isUp ? '↑' : '↓'} {item.trend}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
        <span>Prices updated: Today, 07:30 AM</span>
        <span className="font-semibold text-slate-500">Gweru Exchange</span>
      </div>
    </div>
  );
};
