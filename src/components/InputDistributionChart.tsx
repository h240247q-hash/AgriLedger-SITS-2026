import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

export const InputDistributionChart: React.FC = () => {
  const data = [
    { name: 'Fertilizer', value: 650, percentage: '52%', color: '#2563eb' },
    { name: 'Seed', value: 300, percentage: '24%', color: '#059669' },
    { name: 'Chemicals', value: 200, percentage: '16%', color: '#d97706' },
    { name: 'Other Inputs', value: 100, percentage: '8%', color: '#7c3aed' },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-800">Input Distribution Overview</h3>
        <select className="text-xs bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-slate-600 outline-none">
          <option>This Month</option>
          <option>This Season</option>
          <option>This Year</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-4">
        {/* Donut Chart with Center Label */}
        <div className="relative h-44 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={3}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="text-base font-bold text-slate-900 leading-tight">1,250</span>
            <span className="text-[10px] text-slate-400 font-medium">Total Inputs</span>
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-2 text-xs">
          {data.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-xs inline-block"
                  style={{ backgroundColor: item.color }}
                ></span>
                <span className="text-slate-700 font-medium">{item.name}</span>
              </div>
              <span className="font-semibold text-slate-900 font-mono">
                {item.value} <span className="font-normal text-slate-400">({item.percentage})</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
