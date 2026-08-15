import React, { useState } from 'react';
import { UserProfile, LogisticsTruck } from '../../types';
import { Building2, Package, QrCode, Truck, Users, CheckCircle2, AlertCircle, ArrowUpRight, Plus, Minus, ShoppingCart, Send } from 'lucide-react';

interface StockItem {
  id: number;
  name: string;
  category: string;
  count: number;
  status: string;
  threshold: string;
}

interface Receipt {
  id: string;
  farmer: string;
  ward: string;
  item: string;
  time: string;
  status: string;
}

interface DealerDashboardViewProps {
  currentUser: UserProfile;
  trucks: LogisticsTruck[];
  openModal: (modalId: string) => void;
  isReset?: boolean;
  stockItems: StockItem[];
  receipts: Receipt[];
  registeredFarmers: number;
  scanComplianceRate: number;
  onAdjustStock: (id: number, delta: number) => void;
  onAddStockItem: (name: string, category: string, count: number) => void;
  onIssueReceipt: (farmer: string, ward: string, item: string, stockItemId: number, qty: number) => void;
  onMarkReceiptIssued: (id: string) => void;
  onAdjustMetric: (key: string, delta: number) => void;
  onSetMetric: (key: string, value: number) => void;
}

export const DealerDashboardView: React.FC<DealerDashboardViewProps> = ({
  currentUser,
  trucks = [],
  openModal,
  stockItems = [],
  receipts = [],
  registeredFarmers,
  scanComplianceRate,
  onAdjustStock,
  onAddStockItem,
  onIssueReceipt,
  onMarkReceiptIssued,
  onAdjustMetric,
  onSetMetric,
}) => {
  const [showIssueModal, setShowIssueModal] = useState<boolean>(false);

  // Form states for selling / issuing inputs to farmer
  const [issueFarmerName, setIssueFarmerName] = useState('Kudzai Mupotaringa');
  const [issueWard, setIssueWard] = useState('Ward 12');
  const [issueSelectedItemId, setIssueSelectedItemId] = useState<number>(0);
  const [issueQty, setIssueQty] = useState<number>(2);

  // Form state for adding new stock line
  const [showAddProduct, setShowAddProduct] = useState<boolean>(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdCat, setNewProdCat] = useState('Basal Fertilizer');
  const [newProdCount, setNewProdCount] = useState<number>(100);

  // Total warehouse stock calculated dynamically
  const totalStockBags = stockItems.reduce((acc, curr) => acc + curr.count, 0);
  const activeIssueItemId = issueSelectedItemId || stockItems[0]?.id || 0;

  // Handle issuing inputs to farmer (deducts stock and logs receipt)
  const handleIssueToFarmer = (e: React.FormEvent) => {
    e.preventDefault();
    const targetItem = stockItems.find((i) => i.id === activeIssueItemId);
    if (!targetItem) return;

    if (targetItem.count < issueQty) {
      alert(`⚠️ Insufficient stock! Only ${targetItem.count} bags left of ${targetItem.name}`);
      return;
    }

    onIssueReceipt(issueFarmerName, issueWard, `${issueQty}x ${targetItem.name}`, activeIssueItemId, issueQty);
    setShowIssueModal(false);
    alert(`✅ Inputs Successfully Issued!\n${issueQty}x ${targetItem.name} issued to ${issueFarmerName} (${issueWard}).\nWarehouse Stock updated automatically.`);
  };

  // Add new product line to warehouse
  const handleAddProductLine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim()) return;
    onAddStockItem(newProdName, newProdCat, newProdCount);
    setNewProdName('');
    setShowAddProduct(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border border-slate-800 rounded-xl p-6 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-[11px] font-semibold mb-2">
            <Building2 className="w-3.5 h-3.5 text-blue-400" />
            <span>Agro-Dealer Distribution Depot • {currentUser.location}</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white mb-1">
            {currentUser.name} Operations Hub 🏢
          </h1>
          <p className="text-xs text-slate-300">
            Monitor warehouse stock levels, scan inbound truck pallets, and issue verified input packages to local farmers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowIssueModal(true)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs py-2 px-3.5 rounded-lg transition-colors cursor-pointer shadow-sm"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Issue / Sell Input Bag</span>
          </button>
          <button
            onClick={() => openModal('qrScannerModal')}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs py-2 px-3.5 rounded-lg transition-colors cursor-pointer shadow-sm"
          >
            <QrCode className="w-4 h-4" />
            <span>Gatekeeper QR Scan</span>
          </button>
        </div>
      </div>

      {/* Dealer Metrics Grid (Calculated Dynamic Values) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Dynamic Card 1: Warehouse Stock */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Warehouse Stock</span>
            <span className="w-7 h-7 rounded bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
              📦
            </span>
          </div>
          <div className="text-xl font-extrabold text-slate-900 font-mono">
            {totalStockBags.toLocaleString()} Bags
          </div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">
            {stockItems.length} Input Product Lines Active
          </p>
        </div>

        {/* Dynamic Card 2: Inbound Supply Trucks */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Inbound Supply Trucks</span>
            <span className="w-7 h-7 rounded bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs">
              🚚
            </span>
          </div>
          <div className="text-xl font-extrabold text-slate-900 font-mono">
            {trucks.length > 0 ? trucks.length : 3} Active
          </div>
          <p className="text-[11px] text-slate-500 mt-1">ZimChem & Windmill Fleet</p>
        </div>

        {/* Dynamic Card 3: Registered Local Farmers */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500">Registered Local Farmers</span>
              <span className="w-7 h-7 rounded bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                👥
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <div className="text-xl font-extrabold text-slate-900 font-mono">{registeredFarmers} Accounts</div>
              <button
                onClick={() => onAdjustMetric('registered_farmers', 1)}
                className="px-2 py-0.5 text-[10px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded cursor-pointer"
              >
                + Register
              </button>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Wards 12, 14 & 15</p>
        </div>

        {/* Dynamic Card 4: Scan Compliance Rate */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500">Scan Compliance Rate</span>
              <span className="w-7 h-7 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                🛡️
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <div className="text-xl font-extrabold text-slate-900 font-mono">{scanComplianceRate.toFixed(1)}%</div>
              <button
                onClick={() => onSetMetric('scan_compliance_rate', 100.0)}
                className="px-2 py-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded cursor-pointer"
              >
                Verify All
              </button>
            </div>
          </div>
          <p className="text-[11px] text-emerald-600 font-medium mt-2">Zero counterfeit leaks</p>
        </div>
      </div>

      {/* Modal: Issue/Sell Input Bag to Farmer */}
      {showIssueModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 border border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-emerald-600" />
                Issue / Sell Input Bag to Farmer
              </h3>
              <button
                onClick={() => setShowIssueModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleIssueToFarmer} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Farmer Name</label>
                <input
                  type="text"
                  value={issueFarmerName}
                  onChange={(e) => setIssueFarmerName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-900 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Ward / District</label>
                <input
                  type="text"
                  value={issueWard}
                  onChange={(e) => setIssueWard(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-900 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Select Product Line</label>
                <select
                  value={activeIssueItemId}
                  onChange={(e) => setIssueSelectedItemId(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-900 outline-none bg-white font-medium"
                >
                  {stockItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({item.count} bags in stock)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Quantity (Bags)</label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={issueQty}
                  onChange={(e) => setIssueQty(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-900 outline-none font-mono"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowIssueModal(false)}
                  className="px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Confirm Sale & Issue Receipt</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Dealer Grid: Stock Table & Inbound Truck Shipments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Warehouse Inventory & Farmer Distribution */}
        <div className="lg:col-span-2 space-y-6">
          {/* Warehouse Stock Inventory */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Package className="w-4 h-4 text-blue-600" />
                  Depot Warehouse Stock Inventory
                </h3>
                <p className="text-xs text-slate-500">Real-time stock counts verified by digital QR ledger.</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAddProduct(!showAddProduct)}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Product</span>
                </button>
                <button
                  onClick={() => openModal('qrScannerModal')}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
                >
                  Scan Pallet Intake
                </button>
              </div>
            </div>

            {/* Form to add a new product line */}
            {showAddProduct && (
              <form onSubmit={handleAddProductLine} className="mb-4 p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <div className="text-xs font-bold text-slate-800">Add New Product Line</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Product Name (e.g. Urea 50kg)"
                    value={newProdName}
                    onChange={(e) => setNewProdName(e.target.value)}
                    className="px-2.5 py-1.5 text-xs border border-slate-300 rounded text-slate-900 bg-white"
                    required
                  />
                  <select
                    value={newProdCat}
                    onChange={(e) => setNewProdCat(e.target.value)}
                    className="px-2.5 py-1.5 text-xs border border-slate-300 rounded text-slate-900 bg-white"
                  >
                    <option value="Basal Fertilizer">Basal Fertilizer</option>
                    <option value="Top Dressing">Top Dressing</option>
                    <option value="Seeds">Seeds</option>
                    <option value="Herbicides">Herbicides</option>
                    <option value="Bio-Pesticides">Bio-Pesticides</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Initial Stock Count"
                    value={newProdCount}
                    onChange={(e) => setNewProdCount(Number(e.target.value))}
                    className="px-2.5 py-1.5 text-xs border border-slate-300 rounded text-slate-900 bg-white font-mono"
                    required
                  />
                </div>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddProduct(false)}
                    className="text-xs text-slate-500 hover:text-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded cursor-pointer"
                  >
                    Save Product
                  </button>
                </div>
              </form>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-[10px] uppercase">
                    <th className="py-2.5 px-3">PRODUCT DESCRIPTION</th>
                    <th className="py-2.5 px-3">CATEGORY</th>
                    <th className="py-2.5 px-3 text-right">QUANTITY</th>
                    <th className="py-2.5 px-3">STATUS</th>
                    <th className="py-2.5 px-3 text-center">STOCK CONTROLS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stockItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-3 font-semibold text-slate-900">{item.name}</td>
                      <td className="py-3 px-3 text-slate-500">{item.category}</td>
                      <td className="py-3 px-3 font-mono font-bold text-right text-slate-900">{item.count} Bags</td>
                      <td className="py-3 px-3">
                        {item.status === 'Low Stock' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                            Low Stock ({item.threshold})
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            {item.status}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onAdjustStock(item.id, 50)}
                            className="px-2 py-1 text-[10px] font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded cursor-pointer transition-colors"
                            title="Restock +50 Bags"
                          >
                            +50 Restock
                          </button>
                          <button
                            onClick={() => onAdjustStock(item.id, -10)}
                            className="px-2 py-1 text-[10px] font-bold bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 rounded cursor-pointer transition-colors"
                            title="Sell / Issue -10 Bags"
                          >
                            -10 Issue
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Farmer Distribution Gate Logs */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-600" />
                  Farmer Distribution Gate & Receipts
                </h3>
                <p className="text-xs text-slate-500">Inputs issued to farmers upon voucher presentation.</p>
              </div>
              <button
                onClick={() => setShowIssueModal(true)}
                className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg cursor-pointer transition-colors flex items-center gap-1 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Farmer Receipt</span>
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {receipts.map((p) => (
                <div key={p.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-emerald-50 text-emerald-700 font-bold text-xs flex items-center justify-center border border-emerald-100">
                      👤
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">
                        {p.farmer} <span className="text-slate-400 font-normal">({p.ward})</span>
                      </h4>
                      <p className="text-[11px] text-slate-500">{p.item}</p>
                    </div>
                  </div>

                  <div className="text-right flex items-center gap-2">
                    {p.status === 'Pending Pickup' ? (
                      <button
                        onClick={() => onMarkReceiptIssued(p.id)}
                        className="px-2.5 py-1 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded cursor-pointer transition-colors flex items-center gap-1 shadow-2xs"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Issue Inputs</span>
                      </button>
                    ) : (
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full uppercase">
                        {p.status}
                      </span>
                    )}
                    <span className="text-[10px] font-mono text-slate-400 block">{p.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Inbound Logistics Trucks */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Truck className="w-4 h-4 text-blue-600" />
                Inbound Supply Trucks
              </h3>
            </div>

            <div className="space-y-3">
              {(trucks || []).slice(0, 3).map((t) => (
                <div key={t.id} className="p-3 bg-slate-50 border border-slate-200 rounded-md">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold font-mono text-slate-900">{t.truckPlate}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        t.status === 'On Route' || t.status === 'In Transit'
                          ? 'bg-blue-100 text-blue-800'
                          : t.status === 'Delayed'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 font-medium">
                    {t.fromLoc} ➔ {t.toLoc}
                  </p>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200 text-[10px] text-slate-500">
                    <span>Driver: {t.driverName}</span>
                    <span className="font-mono font-semibold text-blue-600">ETA: {t.eta}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Fraud Monitor Link */}
          <div className="bg-slate-900 text-white border border-slate-800 rounded-lg p-5 shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-rose-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">AI Fraud Intercept Node</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Automatic alert triggers if a farmer presents a duplicated QR voucher or broken tamper seal at the counter.
            </p>
            <button
              onClick={() => openModal('aiFraudMonitorModal')}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs py-2 px-3 rounded-md transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>View Intercept Queue</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
