import React from 'react';
import { UserProfile, DashboardStats, LogisticsTruck, ActivityLog, Farmer, Supplier } from '../../types';
import { HeroBanner } from '../HeroBanner';
import { QuickActionCards } from '../QuickActionCards';
import { ActiveDeliveriesTable } from '../ActiveDeliveriesTable';
import { ActivityStreamTable } from '../ActivityStreamTable';
import { DeliveryMapWidget } from '../DeliveryMapWidget';
import { InputDistributionChart } from '../InputDistributionChart';

interface AdminDashboardViewProps {
  currentUser: UserProfile;
  stats: DashboardStats;
  trucks: LogisticsTruck[];
  activityLogs: ActivityLog[];
  farmers?: Farmer[];
  suppliers?: Supplier[];
  openModal: (modalId: string) => void;
  onApproveTruck: (truckId: string) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  currentUser,
  stats,
  trucks,
  activityLogs,
  openModal,
  onApproveTruck,
}) => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero Banner with Executive Overview */}
      <HeroBanner
        currentRole="admin"
        stats={stats}
        openModal={openModal}
      />

      {/* Quick Action Shortcuts */}
      <QuickActionCards openModal={openModal} />

      {/* Primary Analytics & Operations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Deliveries & Fleet Tracking (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <ActiveDeliveriesTable
            trucks={trucks}
            openModal={openModal}
            onApproveTruck={onApproveTruck}
          />
          <ActivityStreamTable activityLogs={activityLogs} openModal={openModal} />
        </div>

        {/* Widgets Panel (1 col) */}
        <div className="space-y-6">
          <DeliveryMapWidget openModal={openModal} />
        </div>
      </div>

      {/* National Input Distribution Chart */}
      <InputDistributionChart />
    </div>
  );
};

