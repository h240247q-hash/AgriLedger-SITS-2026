import React, { useState, useEffect } from 'react';
import { MapPin, TrendingUp, Flame, ShoppingBag, Truck, RefreshCw, Filter, Layers, Zap, Search, X } from 'lucide-react';

interface HubLocation {
  id: string;
  name: string;
  district: string;
  province: string;
  region: 'Zimbabwe Domestic' | 'SADC Export Market';
  coordinates: { x: number; y: number }; // Percentage positions on map canvas
  salesBags: number;
  salesTons: number;
  topProduct: string;
  growthRate: string;
  demandLevel: 'High Demand' | 'Medium Demand' | 'Steady Demand';
  activeTrucks: number;
  lastSaleTime: string;
}

const INITIAL_HUBS: HubLocation[] = [
  // --- ZIMBABWE DOMESTIC HUBS (ALL 10 PROVINCES) ---
  {
    id: 'hub-harare',
    name: 'Msasa Factory Central Depot',
    district: 'Harare',
    province: 'Harare Metropolitan',
    region: 'Zimbabwe Domestic',
    coordinates: { x: 52, y: 38 },
    salesBags: 6200,
    salesTons: 310.0,
    topProduct: 'Compound D & AN Combo',
    growthRate: '+42.0%',
    demandLevel: 'High Demand',
    activeTrucks: 4,
    lastSaleTime: 'Just now',
  },
  {
    id: 'hub-bulawayo',
    name: 'Kelvin Industrial Agro-Hub',
    district: 'Bulawayo',
    province: 'Bulawayo Metropolitan',
    region: 'Zimbabwe Domestic',
    coordinates: { x: 30, y: 68 },
    salesBags: 4120,
    salesTons: 206.0,
    topProduct: 'Top Dressing Ammonium Nitrate',
    growthRate: '+29.4%',
    demandLevel: 'High Demand',
    activeTrucks: 3,
    lastSaleTime: '4 mins ago',
  },
  {
    id: 'hub-murehwa',
    name: 'Murehwa Agro-Hub',
    district: 'Murehwa',
    province: 'Mashonaland East',
    region: 'Zimbabwe Domestic',
    coordinates: { x: 58, y: 35 },
    salesBags: 4850,
    salesTons: 242.5,
    topProduct: 'Compound D Fertilizer',
    growthRate: '+34.2%',
    demandLevel: 'High Demand',
    activeTrucks: 3,
    lastSaleTime: '2 mins ago',
  },
  {
    id: 'hub-marondera',
    name: 'Marondera Grain & Input Depot',
    district: 'Marondera',
    province: 'Mashonaland East',
    region: 'Zimbabwe Domestic',
    coordinates: { x: 56, y: 44 },
    salesBags: 3400,
    salesTons: 170.0,
    topProduct: 'Maize & Wheat Seeds',
    growthRate: '+21.0%',
    demandLevel: 'Medium Demand',
    activeTrucks: 2,
    lastSaleTime: '10 mins ago',
  },
  {
    id: 'hub-bindura',
    name: 'Bindura Central Depot',
    district: 'Bindura',
    province: 'Mashonaland Central',
    region: 'Zimbabwe Domestic',
    coordinates: { x: 50, y: 24 },
    salesBags: 3920,
    salesTons: 196.0,
    topProduct: 'Ammonium Nitrate (AN)',
    growthRate: '+28.5%',
    demandLevel: 'High Demand',
    activeTrucks: 2,
    lastSaleTime: '5 mins ago',
  },
  {
    id: 'hub-muzarabani',
    name: 'Muzarabani Valley Depot',
    district: 'Muzarabani',
    province: 'Mashonaland Central',
    region: 'Zimbabwe Domestic',
    coordinates: { x: 52, y: 14 },
    salesBags: 1890,
    salesTons: 94.5,
    topProduct: 'Cotton & Sorghum Seed',
    growthRate: '+22.4%',
    demandLevel: 'Medium Demand',
    activeTrucks: 1,
    lastSaleTime: '30 mins ago',
  },
  {
    id: 'hub-guruve',
    name: 'Guruve Tobacco & Grain Hub',
    district: 'Guruve',
    province: 'Mashonaland Central',
    region: 'Zimbabwe Domestic',
    coordinates: { x: 44, y: 20 },
    salesBags: 2780,
    salesTons: 139.0,
    topProduct: 'Compound C & D Fertilizer',
    growthRate: '+18.2%',
    demandLevel: 'Medium Demand',
    activeTrucks: 2,
    lastSaleTime: '15 mins ago',
  },
  {
    id: 'hub-chinhoyi',
    name: 'Chinhoyi Grain & Input Hub',
    district: 'Makonde',
    province: 'Mashonaland West',
    region: 'Zimbabwe Domestic',
    coordinates: { x: 38, y: 30 },
    salesBags: 3100,
    salesTons: 155.0,
    topProduct: 'Maize Seed SC-719',
    growthRate: '+19.8%',
    demandLevel: 'Medium Demand',
    activeTrucks: 2,
    lastSaleTime: '12 mins ago',
  },
  {
    id: 'hub-karoi',
    name: 'Karoi Farming Depot',
    district: 'Hurungwe',
    province: 'Mashonaland West',
    region: 'Zimbabwe Domestic',
    coordinates: { x: 32, y: 20 },
    salesBags: 3650,
    salesTons: 182.5,
    topProduct: 'Basal Fertilizer (50kg)',
    growthRate: '+26.1%',
    demandLevel: 'High Demand',
    activeTrucks: 3,
    lastSaleTime: '8 mins ago',
  },
  {
    id: 'hub-mutare',
    name: 'Mutare Border Supply Hub',
    district: 'Mutare',
    province: 'Manicaland',
    region: 'Zimbabwe Domestic',
    coordinates: { x: 78, y: 48 },
    salesBags: 2180,
    salesTons: 109.0,
    topProduct: 'Foliar Spray & Bio-Pesticides',
    growthRate: '+11.5%',
    demandLevel: 'Steady Demand',
    activeTrucks: 1,
    lastSaleTime: '25 mins ago',
  },
  {
    id: 'hub-chipinge',
    name: 'Chipinge Estate Agro-Hub',
    district: 'Chipinge',
    province: 'Manicaland',
    region: 'Zimbabwe Domestic',
    coordinates: { x: 80, y: 64 },
    salesBags: 2950,
    salesTons: 147.5,
    topProduct: 'Macadamia & Tea Crop Nutrition',
    growthRate: '+23.8%',
    demandLevel: 'Medium Demand',
    activeTrucks: 2,
    lastSaleTime: '14 mins ago',
  },
  {
    id: 'hub-gweru',
    name: 'Gweru Industrial Depot',
    district: 'Gweru',
    province: 'Midlands',
    region: 'Zimbabwe Domestic',
    coordinates: { x: 42, y: 54 },
    salesBags: 2450,
    salesTons: 122.5,
    topProduct: 'Basal Fertilizer (50kg)',
    growthRate: '+14.1%',
    demandLevel: 'Medium Demand',
    activeTrucks: 1,
    lastSaleTime: '18 mins ago',
  },
  {
    id: 'hub-kwekwe',
    name: 'Kwekwe Fertilizer Depot',
    district: 'Kwekwe',
    province: 'Midlands',
    region: 'Zimbabwe Domestic',
    coordinates: { x: 42, y: 46 },
    salesBags: 3800,
    salesTons: 190.0,
    topProduct: 'Ammonium Nitrate (AN)',
    growthRate: '+31.0%',
    demandLevel: 'High Demand',
    activeTrucks: 3,
    lastSaleTime: '6 mins ago',
  },
  {
    id: 'hub-gokwe',
    name: 'Gokwe Cotton & Input Depot',
    district: 'Gokwe South',
    province: 'Midlands',
    region: 'Zimbabwe Domestic',
    coordinates: { x: 30, y: 42 },
    salesBags: 2890,
    salesTons: 144.5,
    topProduct: 'Cotton Seed SC-520 & Insecticides',
    growthRate: '+20.5%',
    demandLevel: 'Medium Demand',
    activeTrucks: 2,
    lastSaleTime: '22 mins ago',
  },
  {
    id: 'hub-masvingo',
    name: 'Masvingo Regional Depot',
    district: 'Masvingo',
    province: 'Masvingo',
    region: 'Zimbabwe Domestic',
    coordinates: { x: 58, y: 68 },
    salesBags: 1650,
    salesTons: 82.5,
    topProduct: 'Drought-Tolerant Seed',
    growthRate: '+8.7%',
    demandLevel: 'Steady Demand',
    activeTrucks: 1,
    lastSaleTime: '42 mins ago',
  },
  {
    id: 'hub-chiredzi',
    name: 'Chiredzi Sugarcane & Grain Hub',
    district: 'Chiredzi',
    province: 'Masvingo',
    region: 'Zimbabwe Domestic',
    coordinates: { x: 70, y: 78 },
    salesBags: 3250,
    salesTons: 162.5,
    topProduct: 'Cane Blends & Irrigation Seed',
    growthRate: '+25.0%',
    demandLevel: 'Medium Demand',
    activeTrucks: 2,
    lastSaleTime: '16 mins ago',
  },
  {
    id: 'hub-lupane',
    name: 'Lupane Provincial Input Depot',
    district: 'Lupane',
    province: 'Matabeleland North',
    region: 'Zimbabwe Domestic',
    coordinates: { x: 22, y: 52 },
    salesBags: 1420,
    salesTons: 71.0,
    topProduct: 'Sorghum & Millet Hybrid Seeds',
    growthRate: '+12.3%',
    demandLevel: 'Steady Demand',
    activeTrucks: 1,
    lastSaleTime: '35 mins ago',
  },
  {
    id: 'hub-vicfalls',
    name: 'Victoria Falls Eco-Agro Node',
    district: 'Hwange',
    province: 'Matabeleland North',
    region: 'Zimbabwe Domestic',
    coordinates: { x: 10, y: 38 },
    salesBags: 980,
    salesTons: 49.0,
    topProduct: 'Horticulture & Organic Inputs',
    growthRate: '+15.8%',
    demandLevel: 'Steady Demand',
    activeTrucks: 1,
    lastSaleTime: '50 mins ago',
  },
  {
    id: 'hub-gwanda',
    name: 'Gwanda Livestock & Grain Hub',
    district: 'Gwanda',
    province: 'Matabeleland South',
    region: 'Zimbabwe Domestic',
    coordinates: { x: 32, y: 80 },
    salesBags: 1750,
    salesTons: 87.5,
    topProduct: 'Small Grains & Animal Feed Feeds',
    growthRate: '+10.2%',
    demandLevel: 'Steady Demand',
    activeTrucks: 1,
    lastSaleTime: '28 mins ago',
  },
  {
    id: 'hub-beitbridge',
    name: 'Beitbridge Cross-Border Transit Depot',
    district: 'Beitbridge',
    province: 'Matabeleland South',
    region: 'Zimbabwe Domestic',
    coordinates: { x: 48, y: 92 },
    salesBags: 5100,
    salesTons: 255.0,
    topProduct: 'Regional Export Compound D & Seed',
    growthRate: '+38.5%',
    demandLevel: 'High Demand',
    activeTrucks: 4,
    lastSaleTime: '1 min ago',
  },

  // --- REGIONAL SADC EXPORT MARKETS ---
  {
    id: 'hub-lusaka',
    name: 'Lusaka Central Agribusiness Hub',
    district: 'Lusaka',
    province: 'Lusaka Province (Zambia)',
    region: 'SADC Export Market',
    coordinates: { x: 32, y: 8 },
    salesBags: 5800,
    salesTons: 290.0,
    topProduct: 'Export Grade Maize SC-719 Seed',
    growthRate: '+45.2%',
    demandLevel: 'High Demand',
    activeTrucks: 5,
    lastSaleTime: 'Just now',
  },
  {
    id: 'hub-beira',
    name: 'Beira Port Logistics Corridor',
    district: 'Beira',
    province: 'Sofala (Mozambique)',
    region: 'SADC Export Market',
    coordinates: { x: 92, y: 44 },
    salesBags: 4600,
    salesTons: 230.0,
    topProduct: 'Bulk NPK & Top Dressing Fertilizer',
    growthRate: '+33.0%',
    demandLevel: 'High Demand',
    activeTrucks: 3,
    lastSaleTime: '7 mins ago',
  },
  {
    id: 'hub-chimoio',
    name: 'Chimoio Manica Transit Depot',
    district: 'Chimoio',
    province: 'Manica (Mozambique)',
    region: 'SADC Export Market',
    coordinates: { x: 86, y: 52 },
    salesBags: 2900,
    salesTons: 145.0,
    topProduct: 'Hybrid Maize & Vegetable Seeds',
    growthRate: '+27.4%',
    demandLevel: 'Medium Demand',
    activeTrucks: 2,
    lastSaleTime: '19 mins ago',
  },
  {
    id: 'hub-lilongwe',
    name: 'Lilongwe Regional Seed Node',
    district: 'Lilongwe',
    province: 'Central Region (Malawi)',
    region: 'SADC Export Market',
    coordinates: { x: 74, y: 10 },
    salesBags: 3750,
    salesTons: 187.5,
    topProduct: 'Certified Hybrid Seed SC-719',
    growthRate: '+30.1%',
    demandLevel: 'High Demand',
    activeTrucks: 3,
    lastSaleTime: '11 mins ago',
  },
  {
    id: 'hub-francistown',
    name: 'Francistown Northern Supply Hub',
    district: 'Francistown',
    province: 'North-East (Botswana)',
    region: 'SADC Export Market',
    coordinates: { x: 8, y: 72 },
    salesBags: 2100,
    salesTons: 105.0,
    topProduct: 'Sorghum & Drought Resilient Seeds',
    growthRate: '+17.6%',
    demandLevel: 'Medium Demand',
    activeTrucks: 1,
    lastSaleTime: '24 mins ago',
  },
  {
    id: 'hub-musina',
    name: 'Musina Trade Gateway Depot',
    district: 'Musina',
    province: 'Limpopo (South Africa)',
    region: 'SADC Export Market',
    coordinates: { x: 48, y: 98 },
    salesBags: 4300,
    salesTons: 215.0,
    topProduct: 'Fertilizer & Herbicide Concentrates',
    growthRate: '+36.8%',
    demandLevel: 'High Demand',
    activeTrucks: 3,
    lastSaleTime: '3 mins ago',
  },
];

interface HubSalesGeoMapWidgetProps {
  openModal?: (modalId: string) => void;
  isReset?: boolean;
}

export const HubSalesGeoMapWidget: React.FC<HubSalesGeoMapWidgetProps> = ({ openModal, isReset = false }) => {
  const [hubs, setHubs] = useState<HubLocation[]>(() =>
    isReset
      ? INITIAL_HUBS.map((h) => ({
          ...h,
          salesBags: 0,
          salesTons: 0,
          activeTrucks: 0,
          demandLevel: 'Normal Demand' as const,
          growthRate: '0.0%',
        }))
      : INITIAL_HUBS
  );
  const [selectedHub, setSelectedHub] = useState<HubLocation>(() =>
    isReset
      ? {
          ...INITIAL_HUBS[0],
          salesBags: 0,
          salesTons: 0,
          activeTrucks: 0,
          demandLevel: 'Normal Demand' as const,
          growthRate: '0.0%',
        }
      : INITIAL_HUBS[0]
  );
  const [marketRegion, setMarketRegion] = useState<'All Markets' | 'Zimbabwe Domestic' | 'SADC Export Market'>('All Markets');
  const [filterCategory, setFilterCategory] = useState<string>('All Inputs');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLiveUpdating, setIsLiveUpdating] = useState<boolean>(true);
  const [recentSalesNotification, setRecentSalesNotification] = useState<string | null>(null);

  // Live sales simulation ticker
  useEffect(() => {
    if (!isLiveUpdating) return;

    const interval = setInterval(() => {
      // Pick a random hub to simulate a new bulk sale
      const randomHubIndex = Math.floor(Math.random() * hubs.length);
      const saleQty = Math.floor(10 + Math.random() * 40); // 10 to 50 bags

      setHubs((prevHubs) =>
        prevHubs.map((h, idx) => {
          if (idx === randomHubIndex) {
            const updatedBags = h.salesBags + saleQty;
            const updatedTons = Number((updatedBags * 0.05).toFixed(1));
            return {
              ...h,
              salesBags: updatedBags,
              salesTons: updatedTons,
              lastSaleTime: 'Just now',
            };
          }
          return h;
        })
      );

      const targetHub = hubs[randomHubIndex];
      setRecentSalesNotification(
        `⚡ Live Sale Logged: +${saleQty} bags of ${targetHub.topProduct} sold at ${targetHub.name}!`
      );

      // Clear notification toast after 4 seconds
      setTimeout(() => {
        setRecentSalesNotification(null);
      }, 4000);
    }, 6000);

    return () => clearInterval(interval);
  }, [isLiveUpdating, hubs]);

  // Filtered hubs based on Market Region, Product Category & Search Query Selection
  const visibleHubs = hubs.filter((h) => {
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      const matchName = h.name.toLowerCase().includes(q);
      const matchDistrict = h.district.toLowerCase().includes(q);
      const matchProvince = h.province.toLowerCase().includes(q);
      const matchProduct = h.topProduct.toLowerCase().includes(q);
      const matchDemand = h.demandLevel.toLowerCase().includes(q);
      const matchRegion = h.region.toLowerCase().includes(q);
      if (!matchName && !matchDistrict && !matchProvince && !matchProduct && !matchDemand && !matchRegion) {
        return false;
      }
    } else {
      if (marketRegion !== 'All Markets' && h.region !== marketRegion) return false;
      if (filterCategory === 'Basal Fertilizer' && !h.topProduct.toLowerCase().includes('compound') && !h.topProduct.toLowerCase().includes('basal') && !h.topProduct.toLowerCase().includes('npk')) return false;
      if (filterCategory === 'Top Dressing' && !h.topProduct.toLowerCase().includes('ammonium') && !h.topProduct.toLowerCase().includes('an') && !h.topProduct.toLowerCase().includes('top')) return false;
      if (filterCategory === 'Seeds' && !h.topProduct.toLowerCase().includes('seed') && !h.topProduct.toLowerCase().includes('grain')) return false;
    }

    return true;
  });

  // Auto-sync selectedHub when search or filter narrows visibleHubs
  useEffect(() => {
    if (visibleHubs.length > 0 && !visibleHubs.some((h) => h.id === selectedHub.id)) {
      setSelectedHub(visibleHubs[0]);
    }
  }, [visibleHubs, selectedHub.id]);

  // Explicit Search Execution Handler
  const handleExecuteSearch = (e?: React.FormEvent, overrideQuery?: string) => {
    if (e) e.preventDefault();
    const query = overrideQuery !== undefined ? overrideQuery : searchQuery;
    if (overrideQuery !== undefined) {
      setSearchQuery(overrideQuery);
    }

    if (!query.trim()) {
      return;
    }

    const q = query.toLowerCase().trim();
    const matches = hubs.filter((h) => {
      const matchName = h.name.toLowerCase().includes(q);
      const matchDistrict = h.district.toLowerCase().includes(q);
      const matchProvince = h.province.toLowerCase().includes(q);
      const matchProduct = h.topProduct.toLowerCase().includes(q);
      const matchDemand = h.demandLevel.toLowerCase().includes(q);
      const matchRegion = h.region.toLowerCase().includes(q);
      return matchName || matchDistrict || matchProvince || matchProduct || matchDemand || matchRegion;
    });

    if (matches.length > 0) {
      setSelectedHub(matches[0]);
      setRecentSalesNotification(`🔍 Search found matching location: "${matches[0].name}" (${matches[0].district}, ${matches[0].province}).`);
      setTimeout(() => setRecentSalesNotification(null), 4000);
    } else {
      // Create and pin user's custom location onto the map grid
      const formattedLoc = query.trim().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
      const newCustomHub: HubLocation = {
        id: `custom-hub-${Date.now()}`,
        name: formattedLoc.toLowerCase().includes('depot') || formattedLoc.toLowerCase().includes('hub') ? formattedLoc : `${formattedLoc} Depot Hub`,
        district: formattedLoc,
        province: 'Inputted Location',
        region: 'Zimbabwe Domestic',
        coordinates: { x: 30 + Math.floor(Math.random() * 45), y: 25 + Math.floor(Math.random() * 40) },
        salesBags: 2400,
        salesTons: 120.0,
        demandLevel: 'High Demand',
        topProduct: 'Compound D Fertilizer',
        growthRate: '+22.4%',
        activeTrucks: 3,
        lastSaleTime: 'Just now'
      };

      setHubs(prev => [newCustomHub, ...prev]);
      setSelectedHub(newCustomHub);
      setRecentSalesNotification(`📍 Custom location "${newCustomHub.name}" pinned to live geo-map with 2,400 bags telemetry capacity!`);
      setTimeout(() => setRecentSalesNotification(null), 4500);
    }
  };

  // Total sales across visible regional hubs
  const totalNetworkBags = visibleHubs.reduce((sum, h) => sum + h.salesBags, 0);
  const totalNetworkTons = (totalNetworkBags * 0.05).toFixed(1);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-md bg-amber-50 text-amber-600 border border-amber-200/60 font-bold text-xs">
              🗺️ Regional Geo-Sales Grid
            </span>
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
              Zimbabwe & SADC Regional Depot Hub Sales & Demand Map
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Geospatial visualization of fertilizer & seed sales hotspots across all 10 Zimbabwean provinces and key SADC export trade markets (Zambia, Mozambique, Malawi, Botswana, South Africa).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Market Region Filter Tabs */}
          <div className="flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setMarketRegion('All Markets')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                marketRegion === 'All Markets'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Markets ({hubs.length})
            </button>
            <button
              onClick={() => setMarketRegion('Zimbabwe Domestic')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                marketRegion === 'Zimbabwe Domestic'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🇿🇼 Zimbabwe (20 Hubs)
            </button>
            <button
              onClick={() => setMarketRegion('SADC Export Market')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                marketRegion === 'SADC Export Market'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🌍 SADC Exports (6 Nodes)
            </button>
          </div>

          {/* Live Sync Toggle */}
          <button
            onClick={() => setIsLiveUpdating(!isLiveUpdating)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-lg border cursor-pointer transition-colors ${
              isLiveUpdating
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                : 'bg-slate-100 text-slate-600 border-slate-300'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLiveUpdating ? 'animate-spin text-emerald-600' : ''}`} />
            <span>{isLiveUpdating ? 'Live Feed' : 'Paused'}</span>
          </button>

          {/* Category Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-500 ml-1" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-transparent text-slate-800 font-semibold outline-none cursor-pointer text-xs"
            >
              <option value="All Inputs">All Inputs</option>
              <option value="Basal Fertilizer">Basal Fertilizer</option>
              <option value="Top Dressing">Top Dressing (AN)</option>
              <option value="Seeds">Hybrid Seeds</option>
            </select>
          </div>
        </div>
      </div>

      {/* Direct Custom Location Search Input */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs">
        <form onSubmit={handleExecuteSearch} className="flex items-center gap-2 bg-white border border-slate-300 rounded-lg px-3 py-2 focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/20 shadow-2xs">
          <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
          <input
            type="text"
            placeholder="Input location, depot name, district, or province (e.g., Murehwa, Goromonzi, Bindura, Harare, Chipinge)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent outline-none text-slate-800 placeholder-slate-400 font-medium text-xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
              }}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
              title="Clear input"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="submit"
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-1.5 rounded-md text-xs transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 shadow-xs"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search Location</span>
          </button>
        </form>
      </div>

      {/* Live Sales Ticker Toast */}
      {recentSalesNotification && (
        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-900 px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between animate-fade-in shadow-2xs">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-600 animate-bounce" />
            <span>{recentSalesNotification}</span>
          </div>
          <span className="text-[10px] bg-amber-200/60 px-2 py-0.5 rounded font-mono text-amber-950 font-bold">
            LIVE TRANSACTIONS
          </span>
        </div>
      )}

      {/* Main Container: Map Stage (Left/Top) + Hub Inspector & Sales Leaderboard (Right/Bottom) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* LEFT COLUMN: Vector Geographic Map Canvas (Zimbabwe Territory Visualizer) */}
        <div className="lg:col-span-7 bg-slate-950 rounded-xl p-4 border border-slate-800 relative overflow-hidden flex flex-col justify-between min-h-[340px]">
          {/* Topography Dot Grid Overlay */}
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(#38bdf8 1px, transparent 1px)`,
              backgroundSize: '18px 18px',
            }}
          ></div>

          {/* Map Overlay Badge */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 text-slate-200 px-3 py-1 rounded-full text-[11px] font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>Regional Geo-Grid (Active Nodes: {visibleHubs.length})</span>
            </div>
            <div className="text-[11px] font-mono text-amber-400 font-bold">
              Total Sales: {totalNetworkBags.toLocaleString()} Bags ({totalNetworkTons} Tons)
            </div>
          </div>

          {/* Interactive Geo Canvas with Hub Pins */}
          <div className="relative w-full h-[300px] my-2">
            {/* Outline SVG representing simplified Zimbabwe & regional geographic contours */}
            <svg className="w-full h-full text-slate-800/80" viewBox="0 0 100 100" preserveAspectRatio="none">
              {/* Regional Territory Contour */}
              <path
                d="M 15,5 C 40,2 75,10 95,25 C 98,45 92,75 75,95 C 50,98 20,92 8,70 C 5,45 10,20 15,5 Z"
                fill="#0f172a"
                stroke="#334155"
                strokeWidth="0.8"
                strokeDasharray="2,2"
              />
              
              {/* Internal Provincial & Regional Telemetry Lines */}
              <path
                d="M 52,38 L 58,35 M 52,38 L 50,24 M 52,38 L 38,30 M 52,38 L 42,54 M 52,38 L 78,48 M 52,38 L 58,68 M 52,38 L 32,8 M 52,38 L 92,44 M 52,38 L 74,10 M 52,38 L 48,92"
                stroke="#1e293b"
                strokeWidth="0.5"
              />
            </svg>

            {/* Interactive Hub Location Pins */}
            {visibleHubs.length === 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 rounded-lg text-slate-300 z-30 space-y-2 p-4 text-center border border-slate-800">
                <Search className="w-8 h-8 text-amber-400 opacity-80" />
                <p className="text-sm font-bold text-white">No regional depot hubs found matching &quot;{searchQuery}&quot;</p>
                <p className="text-xs text-slate-400">Try searching by district (e.g., Murehwa, Bindura, Lusaka), product line, or province.</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setMarketRegion('All Markets');
                    setFilterCategory('All Inputs');
                  }}
                  className="mt-2 text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer shadow-sm"
                >
                  Reset Search &amp; Filters
                </button>
              </div>
            )}

            {visibleHubs.map((hub) => {
              const isSelected = selectedHub.id === hub.id;
              const isHighDemand = hub.demandLevel === 'High Demand';
              const isExportNode = hub.region === 'SADC Export Market';

              return (
                <div
                  key={hub.id}
                  onClick={() => setSelectedHub(hub)}
                  style={{ left: `${hub.coordinates.x}%`, top: `${hub.coordinates.y}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20"
                >
                  {/* Pulse Animation Ring for High Demand Nodes */}
                  {isHighDemand && (
                    <span className="absolute -inset-2 rounded-full bg-amber-500/30 animate-ping pointer-events-none"></span>
                  )}

                  {/* Hub Pin Button */}
                  <div
                    className={`relative flex items-center justify-center p-1.5 rounded-full border transition-all duration-200 ${
                      isSelected
                        ? 'bg-amber-400 text-slate-950 border-white scale-125 shadow-lg shadow-amber-500/50'
                        : isHighDemand
                        ? 'bg-amber-500 text-slate-950 border-amber-300 hover:scale-110'
                        : isExportNode
                        ? 'bg-purple-600 text-white border-purple-300 hover:scale-110'
                        : 'bg-blue-600 text-white border-blue-400 hover:scale-110'
                    }`}
                  >
                    {isHighDemand ? (
                      <Flame className="w-3.5 h-3.5 fill-current" />
                    ) : (
                      <MapPin className="w-3.5 h-3.5" />
                    )}
                  </div>

                  {/* Pin Name Label Tag */}
                  <div className={`absolute top-6 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded text-[10px] font-bold font-mono transition-all border shadow-md ${
                    isSelected
                      ? 'bg-amber-400 text-slate-950 border-white z-30'
                      : 'bg-slate-900/90 text-slate-200 border-slate-700 group-hover:bg-slate-800'
                  }`}>
                    {hub.district} ({hub.salesBags} bags)
                  </div>
                </div>
              );
            })}
          </div>

          {/* Geo Map Legend Footer */}
          <div className="relative z-10 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-2 font-mono flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> High Sales Hotspot 🔥
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span> Domestic Hub 🇿🇼
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span> SADC Export Node 🌍
              </span>
            </div>
            <span>Click any pin to inspect telemetry & dispatch trucks</span>
          </div>
        </div>

        {/* RIGHT COLUMN: Active Hub Inspector & Sales Hotspot Leaderboard */}
        <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
          
          {/* Selected Hub Inspector Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-slate-100 shadow-md space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold text-xs">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-white">{selectedHub.name}</h4>
                  <p className="text-[11px] text-slate-400">{selectedHub.district} District • {selectedHub.province}</p>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                selectedHub.demandLevel === 'High Demand'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
              }`}>
                {selectedHub.demandLevel}
              </span>
            </div>

            {/* Hub Metrics Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-mono">Total Bags Sold</span>
                <span className="text-base font-extrabold text-amber-400 font-mono">
                  {selectedHub.salesBags.toLocaleString()} Bags
                </span>
                <span className="text-[10px] text-slate-500 block">({selectedHub.salesTons} Tons)</span>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-mono">Sales Growth</span>
                <span className="text-base font-extrabold text-emerald-400 font-mono flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" /> {selectedHub.growthRate}
                </span>
                <span className="text-[10px] text-slate-500 block">vs previous cycle</span>
              </div>
            </div>

            {/* Top Product & Dispatch details */}
            <div className="space-y-1.5 text-xs bg-slate-950/80 p-3 rounded-lg border border-slate-800/80">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">🔥 Top Selling Product:</span>
                <span className="font-bold text-white">{selectedHub.topProduct}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">🚚 Active Dispatches:</span>
                <span className="font-bold text-blue-400">{selectedHub.activeTrucks} Supply Trucks en route</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">⏱️ Last Transaction:</span>
                <span className="font-mono text-emerald-400 font-medium">{selectedHub.lastSaleTime}</span>
              </div>
            </div>

            {/* Action button */}
            {openModal && (
              <button
                onClick={() => openModal('logisticsModal')}
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold py-2 px-3 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm"
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Dispatch Fertilizer Truck to {selectedHub.district}</span>
              </button>
            )}
          </div>

          {/* Regional Sales Leaderboard */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800">
              <span className="flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>Top Regional Sales Leaderboard</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">By Bag Volume</span>
            </div>

            <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
              {[...visibleHubs]
                .sort((a, b) => b.salesBags - a.salesBags)
                .slice(0, 5)
                .map((hub, rank) => (
                  <div
                    key={hub.id}
                    onClick={() => setSelectedHub(hub)}
                    className={`p-2 rounded-lg border transition-all cursor-pointer flex items-center justify-between text-xs ${
                      selectedHub.id === hub.id
                        ? 'bg-amber-100/80 border-amber-300 text-slate-900 font-bold'
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[10px] font-bold ${
                        rank === 0 ? 'bg-amber-500 text-slate-950' : 'bg-slate-200 text-slate-700'
                      }`}>
                        #{rank + 1}
                      </span>
                      <div>
                        <div className="font-bold text-slate-900">{hub.name}</div>
                        <div className="text-[10px] text-slate-500">{hub.topProduct}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-extrabold text-slate-900 font-mono">{hub.salesBags.toLocaleString()} bags</div>
                      <div className="text-[10px] text-emerald-600 font-semibold">{hub.growthRate}</div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
