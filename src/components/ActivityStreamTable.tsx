import React from 'react';
import { ActivityLog } from '../types';

interface ActivityStreamTableProps {
  logs?: ActivityLog[];
  activityLogs?: ActivityLog[];
  openModal?: (modalId: string) => void;
}

export const ActivityStreamTable: React.FC<ActivityStreamTableProps> = ({ logs = [], activityLogs = [], openModal }) => {
  const streamLogs = logs.length > 0 ? logs : activityLogs;
  const renderBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100/80 text-emerald-800 uppercase">Verified</span>;
      case 'in-transit':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100/80 text-amber-800 uppercase">In Transit</span>;
      case 'fraud-risk':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100/80 text-rose-800 uppercase">Fraud Risk</span>;
      case 'delivered':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100/80 text-blue-800 uppercase">Delivered</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100/80 text-indigo-800 uppercase">Notified</span>;
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-800">Recent Activity Stream</h3>
        {openModal && (
          <button
            onClick={() => openModal('qrScannerModal')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
          >
            View QR Log
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <th className="py-2.5 px-3">QR / ALARM CODE</th>
              <th className="py-2.5 px-3">TYPE / BREACH DETAILS</th>
              <th className="py-2.5 px-3">STATUS</th>
              <th className="py-2.5 px-3">TIME & LOCATION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(streamLogs || []).map((log, idx) => (
              <tr key={log.id || idx} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-3 font-semibold text-slate-900 font-mono">{log.qrCode}</td>
                <td className="py-3 px-3 text-slate-700">{log.typeDetails}</td>
                <td className="py-3 px-3">{renderBadge(log.status)}</td>
                <td className="py-3 px-3 text-slate-500">
                  <span className="font-semibold text-slate-700">{log.timestamp}</span> - {log.location}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
