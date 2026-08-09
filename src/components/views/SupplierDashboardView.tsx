import React, { useState } from 'react';
import { UserProfile, LogisticsTruck } from '../../types';
import { Truck, Factory, QrCode, MapPin, CheckCircle2, ShieldCheck, ArrowRight, Plus, Building, Send } from 'lucide-react';
import { HubSalesGeoMapWidget } from '../HubSalesGeoMapWidget';

interface SupplierDashboardViewProps {
  currentUser: UserProfile;
  trucks: LogisticsTruck[];
  openModal: (modalId: string) => void;
  onApproveTruck?: (truckId: string) => void;
  isReset?: boolean;
}

export const SupplierDashboardView: React.FC<SupplierDashboardViewProps> = ({
  currentUser,
  trucks = [],
  openModal,
  onApproveTruck,
  isReset = false,
}) => {
  const [productionBatches, setProductionBatches] = useState(
    isReset ? [] : [
      { batchCode: 'BATCH-2026-CMPD-9912', product: 'Compound D Fertilizer', quantity: 10000, qrSerialRange: 'QR-9912-0001 ➔ 20000', plant: 'Msasa Plant 1', status: 'Sealed & Certified' },
      { batchCode: 'BATCH-2026-AN-7741', product: 'Top Dressing Ammonium Nitrate', quantity: 8500, qrSerialRange: 'QR-7741-0001 ➔ 17000', plant: 'Msasa Plant 2', status: 'In Dispatch Queue' },
      { batchCode: 'BATCH-2026-SEED-3301', product: 'Certified Maize Seed SC-719', quantity: 4000, qrSerialRange: 'QR-3301-0001 ➔ 8000', plant: 'Kadoma Facility', status: 'Sealed & Certified' },
    ]
  );

  const [depotOrders, setDepotOrders] = useState(
    isReset ? [] : [
      { orderId: 'ORD-901', depot: 'Gweru Industrial Depot', item: '400 Bags Compound D', date: 'Today', status: 'Dispatch Approved' },
      { orderId: 'ORD-902', depot: 'Murehwa Central Depot', item: '250 Bags Ammonium Nitrate', date: 'Today', status: 'Loading onto Truck' },
      { orderId: 'ORD-903', depot: 'Bindura Agro-Hub', item: '150 Bags Seed Co Maize', date: 'Yesterday', status: 'Delivered' },
    ]
  );

  // Dynamic Metrics State
  const [extraProductionTons, setExtraProductionTons] = useState<number>(isReset ? 0 : 2500);
  const [connectedHubs, setConnectedHubs] = useState<number>(isReset ? 0 : 142);
  const [onTimeDeliveriesCount, setOnTimeDeliveriesCount] = useState<number>(isReset ? 0 : 128);
  const [totalDeliveriesCount, setTotalDeliveriesCount] = useState<number>(isReset ? 0 : 135);

  // Form Modals State
  const [showLogBatchModal, setShowLogBatchModal] = useState<boolean>(false);
  const [showConnectHubModal, setShowConnectHubModal] = useState<boolean>(false);

  // New Batch Form Inputs
  const [batchProduct, setBatchProduct] = useState('Compound D Fertilizer');
  const [batchPlant, setBatchPlant] = useState('Msasa Plant 1');
  const [batchTons, setBatchTons] = useState<number>(2000);

  // New Hub Form Inputs
  const [newHubName, setNewHubName] = useState('');
  const [newHubDistrict, setNewHubDistrict] = useState('');

  // Dynamically calculated total production tons
  const totalProductionTons = productionBatches.reduce((sum, b) => sum + b.quantity, 0) + extraProductionTons;

  // Dynamically calculated active truck count
  const activeTruckCount = (trucks || []).length > 0 ? trucks.length : 12;

  // Dynamically calculated delivery rate
  const deliveryScheduleRate = ((onTimeDeliveriesCount / totalDeliveriesCount) * 100).toFixed(1);

  // Handle adding new production batch
  const handleLogNewBatch = (e: React.FormEvent) => {
    e.preventDefault();
    const batchCode = `BATCH-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newBatch = {
      batchCode,
      product: batchProduct,
      quantity: batchTons,
      qrSerialRange: `QR-${Math.floor(1000 + Math.random() * 9000)}-0001 ➔ ${batchTons * 2}`,
      plant: batchPlant,
      status: 'Sealed & Certified',
    };
    setProductionBatches((prev) => [newBatch, ...prev]);
    setShowLogBatchModal(false);
    alert(`🏭 Production Batch Logged!\n${batchTons.toLocaleString()} Tons of ${batchProduct} produced at ${batchPlant}.\nFactory Production metric updated!`);
  };

  // Handle connecting new depot hub
  const handleConnectHub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHubName.trim()) return;
    setConnectedHubs((prev) => prev + 1);
    setDepotOrders((prev) => [
      {
        orderId: `ORD-${Math.floor(100 + Math.random() * 900)}`,
        depot: `${newHubName} Depot (${newHubDistrict || 'National'})`,
        item: '500 Bags Basal & Seed Order',
        date: 'Just now',
        status: 'Connected & Active',
      },
      ...prev,
    ]);
    setShowConnectHubModal(false);
    setNewHubName('');
    setNewHubDistrict('');
    alert(`🏢 New Depot Hub Connected!\n${newHubName} added to national distribution network.`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 border border-slate-800 rounded-xl p-6 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-400/20 text-amber-300 text-[11px] font-semibold mb-2">
            <Factory className="w-3.5 h-3.5 text-amber-400" />
            <span>Manufacturing Plant & Logistics Control • {currentUser.location}</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white mb-1">
            {currentUser.name} Operations Dispatch 🏭
          </h1>
          <p className="text-xs text-slate-300">
            Manage factory batch output, print serialized digital QR seals, and monitor regional delivery truck fleets.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowLogBatchModal(true)}
            className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs py-2 px-3.5 rounded-lg transition-colors cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Log Production Batch</span>
          </button>

          <button
            onClick={() => openModal('logisticsModal')}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs py-2 px-3.5 rounded-lg transition-colors cursor-pointer"
          >
            <Truck className="w-4 h-4" />
            <span>Fleet Manifest</span>
          </button>
        </div>
      </div>

      {/* Dynamic Supplier Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Dynamic Metric 1: Monthly Factory Production */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500">Monthly Factory Production</span>
              <span className="w-7 h-7 rounded bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs">
                🏭
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <div className="text-xl font-extrabold text-slate-900 font-mono">
                {totalProductionTons.toLocaleString()} Tons
              </div>
              <button
                onClick={() => setExtraProductionTons((prev) => prev + 1000)}
                className="px-2 py-0.5 text-[10px] font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded cursor-pointer transition-colors"
                title="Log +1,000 Tons"
              >
                +1,000 Tons
              </button>
            </div>
          </div>
          <p className="text-[11px] text-emerald-600 font-medium mt-2 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> All Batches QR Sealed
          </p>
        </div>

        {/* Dynamic Metric 2: Active Truck Fleet */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500">Active Truck Fleet</span>
              <span className="w-7 h-7 rounded bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                🚚
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <div className="text-xl font-extrabold text-slate-900 font-mono">{activeTruckCount} Trucks</div>
              <button
                onClick={() => openModal('logisticsModal')}
                className="px-2 py-0.5 text-[10px] font-bold text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded cursor-pointer transition-colors"
              >
                + Add Truck
              </button>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">On Route to Depot Hubs</p>
        </div>

        {/* Dynamic Metric 3: Delivery Schedule Rate */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500">Delivery Schedule Rate</span>
              <span className="w-7 h-7 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                ⏱️
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <div className="text-xl font-extrabold text-slate-900 font-mono">{deliveryScheduleRate}%</div>
              <button
                onClick={() => {
                  setOnTimeDeliveriesCount((prev) => prev + 1);
                  setTotalDeliveriesCount((prev) => prev + 1);
                }}
                className="px-2 py-0.5 text-[10px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded cursor-pointer transition-colors"
              >
                Log On-Time
              </button>
            </div>
          </div>
          <p className="text-[11px] text-emerald-600 font-medium mt-2">On-Time Depot Arrivals</p>
        </div>

        {/* Dynamic Metric 4: Connected Depot Hubs */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500">Connected Depot Hubs</span>
              <span className="w-7 h-7 rounded bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                🏢
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <div className="text-xl font-extrabold text-slate-900 font-mono">{connectedHubs} Hubs</div>
              <button
                onClick={() => setShowConnectHubModal(true)}
                className="px-2 py-0.5 text-[10px] font-bold text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded cursor-pointer transition-colors"
              >
                + Connect Hub
              </button>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Countrywide Distribution</p>
        </div>
      </div>

      {/* Live Regional Hub Sales & Geo Location Map */}
      <HubSalesGeoMapWidget openModal={openModal} isReset={isReset} />

      {/* Modal 1: Log Factory Production Batch */}
      {showLogBatchModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 border border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Factory className="w-4 h-4 text-amber-600" />
                Log New Factory Production Batch
              </h3>
              <button
                onClick={() => setShowLogBatchModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleLogNewBatch} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Product Description</label>
                <select
                  value={batchProduct}
                  onChange={(e) => setBatchProduct(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-900 outline-none bg-white font-medium"
                >
                  <option value="Compound D Fertilizer">Compound D Fertilizer (Basal)</option>
                  <option value="Top Dressing Ammonium Nitrate">Top Dressing Ammonium Nitrate</option>
                  <option value="Certified Maize Seed SC-719">Certified Maize Seed SC-719</option>
                  <option value="Glyphosate Herbicide Concentrate">Glyphosate Herbicide Concentrate</option>
                  <option value="Bio-Pesticide Foliar Spray">Bio-Pesticide Foliar Spray</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Manufacturing Plant</label>
                <select
                  value={batchPlant}
                  onChange={(e) => setBatchPlant(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-900 outline-none bg-white font-medium"
                >
                  <option value="Msasa Plant 1">Msasa Plant 1 (Harare)</option>
                  <option value="Msasa Plant 2">Msasa Plant 2 (Harare)</option>
                  <option value="Kadoma Facility">Kadoma Seed Facility</option>
                  <option value="Kwekwe Fertilizer Complex">Kwekwe Fertilizer Complex</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Batch Volume (Tons)</label>
                <input
                  type="number"
                  step={500}
                  min={500}
                  max={50000}
                  value={batchTons}
                  onChange={(e) => setBatchTons(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-900 outline-none font-mono"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowLogBatchModal(false)}
                  className="px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Log Batch & Print QR Hash</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Connect New Depot Hub */}
      {showConnectHubModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 border border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Building className="w-4 h-4 text-indigo-600" />
                Connect New Regional Depot Hub
              </h3>
              <button
                onClick={() => setShowConnectHubModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConnectHub} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Depot Hub Name</label>
                <input
                  type="text"
                  placeholder="e.g. Chirundu Border Depot"
                  value={newHubName}
                  onChange={(e) => setNewHubName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-900 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">District / Region</label>
                <input
                  type="text"
                  placeholder="e.g. Hurungwe District"
                  value={newHubDistrict}
                  onChange={(e) => setNewHubDistrict(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-900 outline-none"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowConnectHubModal(false)}
                  className="px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Register & Connect Hub</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Grid: Fleet Manifest & Production Batches */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Fleet Manifest & Dispatch */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-amber-600" />
                  Fleet Dispatches & Driver Tracking
                </h3>
                <p className="text-xs text-slate-500">Live GPS telemetry and route approvals for truck drivers.</p>
              </div>
              <button
                onClick={() => openModal('logisticsModal')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                View Full Fleet
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-[10px] uppercase">
                    <th className="py-2.5 px-3">TRUCK & DRIVER</th>
                    <th className="py-2.5 px-3">ROUTE</th>
                    <th className="py-2.5 px-3">ETA</th>
                    <th className="py-2.5 px-3">STATUS</th>
                    <th className="py-2.5 px-3 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(trucks || []).map((truck) => (
                    <tr key={truck.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900 font-mono">{truck.truckPlate}</div>
                        <div className="text-[11px] text-slate-500">{truck.driverName}</div>
                      </td>
                      <td className="py-3 px-3 text-slate-700 font-medium">
                        {truck.fromLoc} ➔ {truck.toLoc}
                      </td>
                      <td className="py-3 px-3 font-mono font-semibold text-slate-800">{truck.eta}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            truck.status === 'Received by Supplier'
                              ? 'bg-emerald-100 text-emerald-800'
                              : truck.status === 'Delayed'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {truck.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        {truck.status !== 'Received by Supplier' ? (
                          <button
                            onClick={() => onApproveTruck && onApproveTruck(truck.id)}
                            className="px-2.5 py-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded cursor-pointer transition-colors shadow-2xs"
                          >
                            Approve
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-semibold">Confirmed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Factory Serialized QR Batches */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Factory Production Batches & Digital Seals
                </h3>
                <p className="text-xs text-slate-500">Every input bag printed with unique anti-tamper QR hash.</p>
              </div>
              <button
                onClick={() => setShowLogBatchModal(true)}
                className="text-xs font-semibold text-amber-700 hover:text-amber-800 cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Log Batch</span>
              </button>
            </div>

            <div className="space-y-3">
              {productionBatches.map((batch) => (
                <div key={batch.batchCode} className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{batch.product}</span>
                      <span className="text-[10px] font-mono text-slate-500 bg-white border border-slate-200 px-1.5 py-0.5 rounded">
                        {batch.batchCode}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 mt-1 flex items-center gap-3">
                      <span>Volume: <strong>{batch.quantity.toLocaleString()} Tons</strong></span>
                      <span>•</span>
                      <span className="font-mono text-blue-600 font-semibold">{batch.qrSerialRange}</span>
                    </div>
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 shrink-0">
                    {batch.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Depot Orders */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-indigo-600" />
                Agro-Dealer Depot Bulk Requests
              </h3>
              <button
                onClick={() => setShowConnectHubModal(true)}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer"
              >
                + Connect Hub
              </button>
            </div>

            <div className="space-y-3">
              {depotOrders.map((ord) => (
                <div key={ord.orderId} className="p-3 border border-slate-200 rounded-md bg-slate-50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-900">{ord.depot}</span>
                    <span className="text-[10px] font-mono font-bold text-blue-600">{ord.orderId}</span>
                  </div>
                  <p className="text-[11px] text-slate-600">{ord.item}</p>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200 text-[10px]">
                    <span className="text-slate-400">{ord.date}</span>
                    <span className="font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                      {ord.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 text-white rounded-lg p-5 border border-slate-800 shadow-md">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
              National Supply Chain Telemetry
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              View real-time delivery timelines across all Zimbabwean provinces in the full map modal.
            </p>
            <button
              onClick={() => openModal('deliveryModal')}
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs py-2 px-3 rounded-md transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Driver ETA & Delay Matrix</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

