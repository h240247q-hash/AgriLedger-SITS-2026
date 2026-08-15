import React, { useState, useEffect, useCallback } from 'react';
import { UserRole, UserProfile, DashboardStats, ActivityLog, LogisticsTruck, CustomCropOffer, Farmer, Supplier } from './types';
import { DEFAULT_PROFILES } from './data/defaultProfiles';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { LoginScreen } from './components/LoginScreen';

import { FarmerDashboardView } from './components/views/FarmerDashboardView';
import { DealerDashboardView } from './components/views/DealerDashboardView';
import { SupplierDashboardView } from './components/views/SupplierDashboardView';
import { AdminDashboardView } from './components/views/AdminDashboardView';

import { QRScannerModal } from './components/modals/QRScannerModal';
import { AIFraudMonitorModal } from './components/modals/AIFraudMonitorModal';
import { LogisticsModal } from './components/modals/LogisticsModal';
import { MarketplaceModal } from './components/modals/MarketplaceModal';
import { FarmerRegistrationModal } from './components/modals/FarmerRegistrationModal';
import { SupplierRegistrationModal } from './components/modals/SupplierRegistrationModal';
import { AgritexOfficerModal } from './components/modals/AgritexOfficerModal';
import { USSDSimulationModal } from './components/modals/USSDSimulationModal';
import { ProfitabilityModal } from './components/modals/ProfitabilityModal';
import { ProfileModal } from './components/modals/ProfileModal';
import { DeliveryModal } from './components/modals/DeliveryModal';
import { USSDModal } from './components/modals/USSDModal';
import { SeasonPlanningModal } from './components/modals/SeasonPlanningModal';

import {
  fetchStats,
  fetchActivityLogs,
  fetchLogistics,
  fetchFarmers,
  fetchSuppliers,
  fetchCustomCrops,
  resetSystemData,
  approveDelivery,
  fetchDealerStock,
  addDealerStockItemApi,
  adjustDealerStockApi,
  fetchDealerReceipts,
  addDealerReceiptApi,
  markReceiptIssuedApi,
  fetchMetrics,
  adjustMetricApi,
  setMetricApi,
  fetchProductionBatches,
  addProductionBatchApi,
  fetchDepotOrders,
  addDepotOrderApi,
  fetchFarmerVouchers,
  addFarmerVoucherApi,
  verifyFarmerVoucherApi,
  createCustomCrop,
  deleteCustomCropApi,
  updateUserProfileApi,
} from './api/client';

const METRIC_KEYS = [
  'registered_farmers',
  'scan_compliance_rate',
  'extra_production_tons',
  'connected_hubs',
  'on_time_deliveries',
  'total_deliveries',
  'farmer_ussd_balance',
];

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentRole, setCurrentRole] = useState<UserRole>('farmer');
  const [currentUser, setCurrentUser] = useState<UserProfile>(DEFAULT_PROFILES['farmer']);

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const [stats, setStats] = useState<DashboardStats>({
    farmersCount: 2345,
    suppliersCount: 142,
    profitRate: 24.5,
    incomeValue: 2400,
    baseInputCosts: 1812,
    activeAlerts: 0,
    deliveryRate: 96,
    totalTrucks: 2,
    approvedTrucks: 1,
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [trucks, setTrucks] = useState<LogisticsTruck[]>([]);
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [cropOffers, setCropOffers] = useState<CustomCropOffer[]>([]);

  const [dealerStock, setDealerStock] = useState<any[]>([]);
  const [dealerReceipts, setDealerReceipts] = useState<any[]>([]);
  const [productionBatches, setProductionBatches] = useState<any[]>([]);
  const [depotOrders, setDepotOrders] = useState<any[]>([]);
  const [farmerVouchers, setFarmerVouchers] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<Record<string, number>>({});

  const [smsNotification, setSmsNotification] = useState<string | null>(null);
  const [smsTimestamp, setSmsTimestamp] = useState<string>('JUST NOW');
  const [resetKey, setResetKey] = useState<number>(0);
  const [isSystemReset, setIsSystemReset] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    try {
      const [sData, aData, lData, fData, supData, cData, dsData, drData, pbData, doData, fvData, mData] = await Promise.all([
        fetchStats(),
        fetchActivityLogs(),
        fetchLogistics(),
        fetchFarmers(),
        fetchSuppliers(),
        fetchCustomCrops(),
        fetchDealerStock(),
        fetchDealerReceipts(),
        fetchProductionBatches(),
        fetchDepotOrders(),
        fetchFarmerVouchers(),
        fetchMetrics(METRIC_KEYS),
      ]);
      setStats(sData);
      setActivityLogs(aData);
      setTrucks(lData);
      setFarmers(fData);
      setSuppliers(supData);
      setCropOffers(cData);
      setDealerStock(dsData);
      setDealerReceipts(drData);
      setProductionBatches(pbData);
      setDepotOrders(doData);
      setFarmerVouchers(fvData);
      setMetrics(mData);
    } catch (e) {
      console.error('Failed to load dashboard data:', e);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle switching roles
  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    setCurrentUser(DEFAULT_PROFILES[role]);
  };

  // Handle logging in from LoginScreen
  const handleLogin = (profile: UserProfile) => {
    setCurrentUser(profile);
    setCurrentRole(profile.role);
    setIsAuthenticated(true);
  };

  // Handle logging out
  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  // Handle updating user profile (persists to the users table, matched/upserted by email)
  const handleUpdateProfile = async (updatedProfile: UserProfile) => {
    setCurrentUser(updatedProfile);
    if (updatedProfile.role !== currentRole) {
      setCurrentRole(updatedProfile.role);
    }
    try {
      await updateUserProfileApi({
        email: updatedProfile.email,
        name: updatedProfile.name,
        phone: updatedProfile.phone,
        role: updatedProfile.role,
        location: updatedProfile.location,
        organization: updatedProfile.organization,
        district: updatedProfile.district,
      });
    } catch (e) {
      console.error('Failed to persist profile update:', e);
    }
  };

  const handleApproveTruck = async (truckId: string) => {
    try {
      await approveDelivery(truckId);
      await loadData();
    } catch (e) {
      console.error('Failed to approve truck:', e);
    }
  };

  const handleReset = async () => {
    try {
      await resetSystemData();
      setIsSystemReset(true);
      setResetKey(prev => prev + 1);
      await loadData();
      setSmsNotification('🔄 System Reset Complete: All values and dashboard metrics have been reset to ZERO.');
      setSmsTimestamp(new Date().toTimeString().split(' ')[0]);
    } catch (err) {
      console.error('Reset error:', err);
      setIsSystemReset(true);
      setResetKey(prev => prev + 1);
      setSmsNotification('🔄 Local Reset Complete: Dashboard metrics set to zero.');
      setSmsTimestamp(new Date().toTimeString().split(' ')[0]);
    }
  };

  const handleSmsBroadcast = (smsMsg?: string) => {
    if (smsMsg) {
      setSmsNotification(smsMsg);
      setSmsTimestamp(new Date().toTimeString().split(' ')[0]);
    }
    loadData();
  };

  const handleCounterfeitAlert = (msg: string) => {
    setSmsNotification(msg);
    setSmsTimestamp(new Date().toTimeString().split(' ')[0]);
    loadData();
  };

  // ---- Dealer handlers ----
  const handleAdjustStock = async (id: number, delta: number) => {
    try {
      await adjustDealerStockApi(id, delta);
      await loadData();
    } catch (e) {
      console.error('Failed to adjust stock:', e);
    }
  };

  const handleAddStockItem = async (name: string, category: string, count: number) => {
    try {
      await addDealerStockItemApi(name, category, count);
      await loadData();
    } catch (e) {
      console.error('Failed to add stock item:', e);
    }
  };

  const handleIssueReceipt = async (farmer: string, ward: string, item: string, stockItemId: number, qty: number) => {
    try {
      await adjustDealerStockApi(stockItemId, -qty);
      await addDealerReceiptApi(farmer, ward, item);
      await loadData();
    } catch (e) {
      console.error('Failed to issue receipt:', e);
    }
  };

  const handleMarkReceiptIssued = async (id: string) => {
    try {
      await markReceiptIssuedApi(id);
      await loadData();
    } catch (e) {
      console.error('Failed to mark receipt issued:', e);
    }
  };

  // ---- Shared metric handler (dealer + supplier counters) ----
  const handleAdjustMetric = async (key: string, delta: number) => {
    try {
      await adjustMetricApi(key, delta);
      await loadData();
    } catch (e) {
      console.error('Failed to adjust metric:', e);
    }
  };

  const handleSetMetric = async (key: string, value: number) => {
    try {
      await setMetricApi(key, value);
      await loadData();
    } catch (e) {
      console.error('Failed to set metric:', e);
    }
  };

  // ---- Supplier handlers ----
  const handleAddBatch = async (product: string, quantity: number, plant: string) => {
    try {
      await addProductionBatchApi(product, quantity, plant);
      await loadData();
    } catch (e) {
      console.error('Failed to log production batch:', e);
    }
  };

  const handleAddDepotOrder = async (depot: string, item?: string, status?: string) => {
    try {
      await addDepotOrderApi(depot, item, status);
      await loadData();
    } catch (e) {
      console.error('Failed to connect depot hub:', e);
    }
  };

  // ---- Farmer handlers ----
  const handleAddVoucher = async (item: string) => {
    try {
      await addFarmerVoucherApi(item);
      await loadData();
    } catch (e) {
      console.error('Failed to add voucher package:', e);
    }
  };

  const handleVerifyVoucher = async (id: string) => {
    try {
      await verifyFarmerVoucherApi(id);
      await loadData();
    } catch (e) {
      console.error('Failed to verify voucher:', e);
    }
  };

  const handlePostCrop = async (cropName: string, askingPrice: number, quantity: string) => {
    try {
      await createCustomCrop(cropName, askingPrice, quantity);
      await loadData();
    } catch (e) {
      console.error('Failed to post crop offer:', e);
    }
  };

  const handleDeleteCropOffer = async (id: number) => {
    try {
      await deleteCustomCropApi(id);
      await loadData();
    } catch (e) {
      console.error('Failed to delete crop offer:', e);
    }
  };

  const openModal = (modalId: string) => setActiveModal(modalId);
  const closeModal = () => setActiveModal(null);

  // If user is not authenticated, show the Login / Persona Screen with USSD dialer capability
  if (!isAuthenticated) {
    return (
      <>
        <LoginScreen
          onLogin={handleLogin}
          onOpenUssdModal={() => setActiveModal('offlineUssdSimulationModal')}
          onNewFarmerRegistered={(farmerName) =>
            handleSmsBroadcast(`🌱 NEW FARMER REGISTERED: ${farmerName} joined the Smallholder's Association!`)
          }
        />
        <USSDSimulationModal
          isOpen={activeModal === 'offlineUssdSimulationModal'}
          onClose={closeModal}
          stats={stats}
          currentUser={currentUser || undefined}
          onSuccess={handleSmsBroadcast}
          onLoginAsFarmer={handleLogin}
        />
      </>
    );
  }

  return (
    <div className="flex bg-slate-50 min-h-screen text-slate-800 font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        currentUser={currentUser}
        currentRole={currentRole}
        alertCount={stats.activeAlerts}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openModal={openModal}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          currentUser={currentUser}
          currentRole={currentRole}
          onRoleChange={handleRoleChange}
          onReset={handleReset}
          onOpenProfile={() => openModal('profileModal')}
          onLogout={handleLogout}
        />

        <main className="p-6 md:p-8 space-y-6 overflow-y-auto max-w-[1600px] mx-auto w-full">
          {/* SMS Simulation Alert Device Box */}
          {smsNotification && (
            <div className="bg-slate-900 text-white rounded-lg p-4 border-l-4 border-rose-500 shadow-sm animate-fade-in">
              <div className="flex justify-between items-center text-[11px] text-rose-300 mb-1 font-semibold">
                <span>💬 SMS MESSAGE FROM: AgriLedger Security Node</span>
                <span className="font-mono">{smsTimestamp}</span>
              </div>
              <p className="text-xs font-semibold tracking-wide text-slate-100 leading-relaxed font-mono">
                {smsNotification}
              </p>
            </div>
          )}

          {/* AI Security Breach Banner */}
          {stats.activeAlerts > 0 && (
            <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 flex items-center gap-4 shadow-2xs">
              <div className="text-xl">🚨</div>
              <div>
                <h4 className="text-xs font-bold text-rose-700">
                  System Alarm: Security Breach Intercepted
                </h4>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Inauthentic input batch serialization intercepted and logged to active audit queue.
                </p>
              </div>
            </div>
          )}

          {/* ROLE-SPECIFIC TAILORED DASHBOARD VIEWS */}
          {currentRole === 'farmer' && (
            <FarmerDashboardView
              key={resetKey}
              currentUser={currentUser}
              openModal={openModal}
              isReset={isSystemReset}
              vouchers={farmerVouchers}
              cropOffers={cropOffers}
              activityLogs={activityLogs}
              ussdBalance={metrics.farmer_ussd_balance || 0}
              onAddVoucher={handleAddVoucher}
              onVerifyVoucher={handleVerifyVoucher}
              onPostCrop={handlePostCrop}
              onDeleteCropOffer={handleDeleteCropOffer}
              onTopUpWallet={(amount) => handleAdjustMetric('farmer_ussd_balance', amount)}
              onUpdateProfile={handleUpdateProfile}
            />
          )}

          {currentRole === 'dealer' && (
            <DealerDashboardView
              key={resetKey}
              currentUser={currentUser}
              trucks={trucks}
              openModal={openModal}
              isReset={isSystemReset}
              stockItems={dealerStock}
              receipts={dealerReceipts}
              registeredFarmers={metrics.registered_farmers || 0}
              scanComplianceRate={metrics.scan_compliance_rate || 0}
              onAdjustStock={handleAdjustStock}
              onAddStockItem={handleAddStockItem}
              onIssueReceipt={handleIssueReceipt}
              onMarkReceiptIssued={handleMarkReceiptIssued}
              onAdjustMetric={handleAdjustMetric}
              onSetMetric={handleSetMetric}
            />
          )}

          {currentRole === 'supplier' && (
            <SupplierDashboardView
              key={resetKey}
              currentUser={currentUser}
              trucks={trucks}
              openModal={openModal}
              onApproveTruck={handleApproveTruck}
              productionBatches={productionBatches}
              depotOrders={depotOrders}
              extraProductionTons={metrics.extra_production_tons || 0}
              connectedHubs={metrics.connected_hubs || 0}
              onTimeDeliveriesCount={metrics.on_time_deliveries || 0}
              totalDeliveriesCount={metrics.total_deliveries || 0}
              onAddBatch={handleAddBatch}
              onAddDepotOrder={handleAddDepotOrder}
              onAdjustMetric={handleAdjustMetric}
            />
          )}

          {currentRole === 'admin' && (
            <AdminDashboardView
              key={resetKey}
              currentUser={currentUser}
              stats={stats}
              trucks={trucks}
              activityLogs={activityLogs}
              farmers={farmers}
              suppliers={suppliers}
              openModal={openModal}
              onApproveTruck={handleApproveTruck}
            />
          )}
        </main>
      </div>

      {/* ALL MODALS */}
      <QRScannerModal
        isOpen={activeModal === 'qrScannerModal'}
        onClose={closeModal}
        onSuccess={loadData}
        onCounterfeit={handleCounterfeitAlert}
      />
      <AIFraudMonitorModal
        isOpen={activeModal === 'aiFraudMonitorModal'}
        onClose={closeModal}
        onSuccess={loadData}
      />
      <LogisticsModal
        isOpen={activeModal === 'logisticsModal'}
        onClose={closeModal}
        trucks={trucks}
        onSuccess={loadData}
      />
      <MarketplaceModal
        isOpen={activeModal === 'marketplaceModal'}
        onClose={closeModal}
        cropOffers={cropOffers}
        onSuccess={loadData}
      />
      <FarmerRegistrationModal
        isOpen={activeModal === 'registrationModal'}
        onClose={closeModal}
        onSuccess={loadData}
      />
      <SupplierRegistrationModal
        isOpen={activeModal === 'supplierRegistrationModal'}
        onClose={closeModal}
        onSuccess={loadData}
      />
      <AgritexOfficerModal
        isOpen={activeModal === 'agritexOfficerModal'}
        onClose={closeModal}
        onSuccess={handleSmsBroadcast}
        farmers={farmers}
      />
      <USSDSimulationModal
        isOpen={activeModal === 'offlineUssdSimulationModal'}
        onClose={closeModal}
        stats={stats}
        currentUser={currentUser}
        onSuccess={handleSmsBroadcast}
        onLoginAsFarmer={handleLogin}
      />
      <ProfitabilityModal
        isOpen={activeModal === 'profitabilityModal'}
        onClose={closeModal}
        stats={stats}
      />
      <ProfileModal
        isOpen={activeModal === 'profileModal'}
        onClose={closeModal}
        currentUser={currentUser}
        onUpdateProfile={handleUpdateProfile}
        onLogout={handleLogout}
      />
      <DeliveryModal isOpen={activeModal === 'deliveryModal'} onClose={closeModal} onSuccess={loadData} />
      <USSDModal
        isOpen={activeModal === 'ussdModal'}
        onClose={closeModal}
        onSuccess={handleSmsBroadcast}
      />
      <SeasonPlanningModal
        isOpen={activeModal === 'seasonPlanningModal'}
        onClose={closeModal}
        onSuccess={handleSmsBroadcast}
      />
    </div>
  );
}
