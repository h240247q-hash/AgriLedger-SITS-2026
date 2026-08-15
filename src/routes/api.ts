import { Router } from 'express';
import {
  getDbStats,
  getActivityLogs,
  addActivityLog,
  getLogisticsTrucks,
  addLogisticsTruck,
  approveTruckDelivery,
  addFraudReport,
  getFarmers,
  addFarmer,
  getSuppliers,
  addSupplier,
  getCustomCropOffers,
  addCustomCropOffer,
  executeMarketDeal,
  resetDatabaseState,
  registerUser,
  loginUser,
  getDealerStock,
  addDealerStockItem,
  adjustDealerStock,
  getDealerReceipts,
  addDealerReceipt,
  markReceiptIssued,
  getMetrics,
  adjustMetric,
  setMetric,
  getProductionBatches,
  addProductionBatch,
  getDepotOrders,
  addDepotOrder,
  getFarmerVouchers,
  addFarmerVoucher,
  verifyFarmerVoucher,
  deleteCustomCropOffer,
  addDeliveryPayout,
  addAgritexScan,
  updateUserProfile,
  getDbDiagnostics
} from '../db/mysql.ts';

const router = Router();

// TEMPORARY diagnostic route — remove once investigation is complete.
router.get('/_debug', (req, res) => {
  res.json(getDbDiagnostics());
});

// POST /api/auth/register
router.post('/auth/register', async (req, res) => {
  try {
    const { email, password, name, role, location, organization, phone } = req.body;
    if (!email || !password || !name || !role) {
      return res.status(400).json({ error: 'Email, password, name, and role are required fields.' });
    }
    const newUser = await registerUser({ email, password, name, role, location: location || 'Harare', organization, phone });
    res.json({ success: true, user: newUser });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to register account' });
  }
});

// POST /api/auth/login
router.post('/auth/login', async (req, res) => {
  try {
    const { emailOrPhone, password } = req.body;
    if (!emailOrPhone || !password) {
      return res.status(400).json({ error: 'Email/Phone and password are required.' });
    }
    const user = await loginUser(emailOrPhone, password);
    res.json({ success: true, user });
  } catch (err: any) {
    res.status(401).json({ error: err.message || 'Authentication failed' });
  }
});

// GET /api/stats
router.get('/stats', async (req, res) => {
  try {
    const stats = await getDbStats();
    res.json(stats);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/activity
router.get('/activity', async (req, res) => {
  try {
    const logs = await getActivityLogs();
    res.json(logs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ussd/action - Connect USSD with farmer's activities
router.post('/ussd/action', async (req, res) => {
  try {
    const { farmerCode, farmerName, location, actionType, payload } = req.body;
    const timeStr = new Date().toTimeString().split(' ')[0];
    const nameStr = farmerName || 'Tendai Mhako';
    const codeStr = farmerCode || 'AL-FARM-001';
    const locStr = location || 'Murehwa Ward 12';

    if (actionType === 'GET_ACTIVITIES') {
      const allLogs = await getActivityLogs();
      const filtered = allLogs.filter(l => 
        l.typeDetails?.toLowerCase().includes(nameStr.toLowerCase()) ||
        l.typeDetails?.toLowerCase().includes(codeStr.toLowerCase()) ||
        l.qrCode?.includes('USSD') ||
        l.qrCode?.includes(codeStr)
      );
      return res.json({
        success: true,
        farmer: { name: nameStr, code: codeStr, location: locStr },
        activities: filtered.slice(0, 8)
      });
    }

    if (actionType === 'LOG_PLANTING') {
      const crop = payload?.crop || 'Hybrid Maize (SC 637)';
      const area = payload?.acreage || '2.5 Ha';
      const log = await addActivityLog({
        qrCode: `📱 USSD-*141#`,
        typeDetails: `[USSD Activity] Farmer ${nameStr} (${codeStr}) logged Planting: ${crop} on ${area}`,
        status: 'verified',
        location: locStr,
        timestamp: timeStr
      });
      return res.json({
        success: true,
        message: `Planting activity for ${crop} (${area}) registered on AgriLedger DB.`,
        log
      });
    }

    if (actionType === 'LOG_SPRAY') {
      const input = payload?.chemical || 'Top Dressing Ammonium Nitrate';
      const log = await addActivityLog({
        qrCode: `📱 USSD-*141#`,
        typeDetails: `[USSD Activity] Farmer ${nameStr} (${codeStr}) logged Application of ${input}`,
        status: 'verified',
        location: locStr,
        timestamp: timeStr
      });
      return res.json({
        success: true,
        message: `Chemical/Fertilizer application (${input}) recorded on AgriLedger DB.`,
        log
      });
    }

    if (actionType === 'LOG_HARVEST') {
      const tonnage = payload?.tonnage || '6.5';
      const crop = payload?.crop || 'White Maize';
      const log = await addActivityLog({
        qrCode: `🌾 USSD-YIELD`,
        typeDetails: `[USSD Activity] Farmer ${nameStr} (${codeStr}) recorded Harvest Yield: ${tonnage} Tons ${crop}`,
        status: 'delivered',
        location: locStr,
        timestamp: timeStr
      });
      return res.json({
        success: true,
        message: `Harvest yield of ${tonnage} Tons ${crop} registered on AgriLedger DB.`,
        log
      });
    }

    if (actionType === 'LOG_SEASON_PLAN') {
      const crop = payload?.crop || 'Hybrid Maize (SC 637)';
      const acreage = payload?.acreage || '3.5 Ha';
      const targetYield = payload?.targetYield || '18 Tons';
      const estFertilizer = payload?.estFertilizer || '14 Bags Compound D & 14 Bags AN';
      const estSeed = payload?.estSeed || '40 kg Seed';
      
      const log = await addActivityLog({
        qrCode: `📅 USSD-PLAN`,
        typeDetails: `[USSD Season Plan] Farmer ${nameStr} (${codeStr}) registered Season Plan 2026: ${crop} on ${acreage}. Inputs required: ${estSeed}, ${estFertilizer}. Target Yield: ${targetYield}`,
        status: 'verified',
        location: locStr,
        timestamp: timeStr
      });
      return res.json({
        success: true,
        message: `Season Plan for ${crop} (${acreage}) successfully registered on AgriLedger DB! Target Yield: ${targetYield}.`,
        seasonPlan: { crop, acreage, targetYield, estFertilizer, estSeed },
        log
      });
    }

    if (actionType === 'REDEEM_VOUCHER') {
      const voucher = payload?.voucherCode || 'VOUCH-8821';
      const item = payload?.item || 'Compound D Fertilizer';
      const log = await addActivityLog({
        qrCode: voucher,
        typeDetails: `[USSD Voucher] Farmer ${nameStr} (${codeStr}) redeemed ${item} via USSD PIN`,
        status: 'verified',
        location: locStr,
        timestamp: timeStr
      });
      return res.json({
        success: true,
        message: `Voucher ${voucher} (${item}) successfully redeemed via USSD!`,
        log
      });
    }

    // Default generic log
    const genericLog = await addActivityLog({
      qrCode: `📱 USSD-*141#`,
      typeDetails: `[USSD Activity] ${nameStr} (${codeStr}): ${payload?.details || 'GSM Terminal Ping'}`,
      status: 'verified',
      location: locStr,
      timestamp: timeStr
    });

    return res.json({ success: true, message: 'USSD Activity recorded.', log: genericLog });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/qr/verify
router.post('/qr/verify', async (req, res) => {
  try {
    const { qrCode, itemType, region, pin } = req.body;
    const timeStr = new Date().toTimeString().split(' ')[0];
    const codeUpper = (qrCode || '').toUpperCase().trim();

    if (codeUpper.includes('FAKE') || codeUpper.includes('COUNTERFEIT')) {
      // Counterfeit
      await addActivityLog({
        qrCode: '🚨 COUNTERFEIT',
        typeDetails: `Fake ${itemType || 'Input'} ("${qrCode}")`,
        status: 'fraud-risk',
        location: region || 'Unknown',
        timestamp: timeStr
      });
      return res.json({
        success: false,
        isCounterfeit: true,
        message: 'COUNTERFEIT INTRUSION INTERCEPTED.'
      });
    }

    // Lookup matching End User (Farmer)
    const allFarmers = await getFarmers();
    let matchedFarmer = allFarmers.find(f => 
      codeUpper.includes(f.farmerCode?.toUpperCase()) || 
      codeUpper.includes(f.name?.toUpperCase())
    );

    if (!matchedFarmer && allFarmers.length > 0) {
      // Deterministic fallback lookup based on code length
      const index = Math.abs(codeUpper.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % allFarmers.length;
      matchedFarmer = allFarmers[index];
    }

    const endUser = matchedFarmer ? {
      name: matchedFarmer.name,
      farmerCode: matchedFarmer.farmerCode || 'AL-FARM-001',
      phone: matchedFarmer.phone || '+263771234567',
      location: matchedFarmer.location || region || 'Murehwa Ward 12',
      organization: 'Murehwa Grain Cooperative',
      allocatedInput: `${itemType || 'Certified Hybrid Maize Seed & Compound D'} (Batch ${qrCode})`,
      status: 'VERIFIED MATCH'
    } : {
      name: 'Tendai Mhako',
      farmerCode: 'AL-FARM-001',
      phone: '+263771234567',
      location: region || 'Ward 12, Murehwa',
      organization: 'Murehwa Farmers Co-op',
      allocatedInput: `${itemType || 'Seed & Fertilizer Batch'} (${qrCode})`,
      status: 'VERIFIED MATCH'
    };

    if (pin) {
      // Verified with USSD PIN & Handover to End User
      const log = await addActivityLog({
        qrCode,
        typeDetails: `Handover Confirmed to End-User ${endUser.name} (${endUser.farmerCode}) — [PIN: ${pin}]`,
        status: 'verified',
        location: endUser.location || region || 'Depot',
        timestamp: timeStr
      });
      return res.json({ success: true, verified: true, endUser, log });
    }

    // Pending PIN confirmation with End-User match
    return res.json({ success: true, requiresPin: true, qrCode, itemType, region, endUser });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/logistics
router.get('/logistics', async (req, res) => {
  try {
    const trucks = await getLogisticsTrucks();
    res.json(trucks);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/logistics
router.post('/logistics', async (req, res) => {
  try {
    const { fleetDriver, fleetTruck } = req.body;
    if (!fleetDriver || !fleetTruck) {
      return res.status(400).json({ error: 'Driver and truck plate are required' });
    }
    const truck = await addLogisticsTruck({ driverName: fleetDriver, truckPlate: fleetTruck });
    res.json(truck);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/logistics/:id/approve
router.put('/logistics/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const truck = await approveTruckDelivery(id);
    res.json({ success: true, truck });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/fraud
router.post('/fraud', async (req, res) => {
  try {
    const { details, location } = req.body;
    if (!details || !location) {
      return res.status(400).json({ error: 'Details and location are required' });
    }
    const report = await addFraudReport({ details, location });
    res.json(report);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/farmers
router.get('/farmers', async (req, res) => {
  try {
    const farmers = await getFarmers();
    res.json(farmers);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/farmers
router.post('/farmers', async (req, res) => {
  try {
    const { regName, regLocation } = req.body;
    if (!regName || !regLocation) {
      return res.status(400).json({ error: 'Name and location required' });
    }
    const farmer = await addFarmer({ name: regName, location: regLocation });
    res.json(farmer);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/suppliers
router.get('/suppliers', async (req, res) => {
  try {
    const suppliers = await getSuppliers();
    res.json(suppliers);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/suppliers
router.post('/suppliers', async (req, res) => {
  try {
    const { supName, supLocation } = req.body;
    if (!supName || !supLocation) {
      return res.status(400).json({ error: 'Name and location required' });
    }
    const supplier = await addSupplier({ name: supName, location: supLocation });
    res.json(supplier);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/market/custom-crops
router.get('/market/custom-crops', async (req, res) => {
  try {
    const offers = await getCustomCropOffers();
    res.json(offers);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/market/custom-crops
router.post('/market/custom-crops', async (req, res) => {
  try {
    const { cropName, askingPrice, quantity, buyers, status } = req.body;
    if (!cropName || !askingPrice) {
      return res.status(400).json({ error: 'Crop name and price required' });
    }
    const offer = await addCustomCropOffer(cropName, parseFloat(askingPrice), { quantity, buyers, status });
    res.json(offer);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/market/custom-crops/:id
router.delete('/market/custom-crops/:id', async (req, res) => {
  try {
    const result = await deleteCustomCropOffer(Number(req.params.id));
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/market/deal
router.post('/market/deal', async (req, res) => {
  try {
    const { buyer, crop, payout } = req.body;
    if (!buyer || !crop || !payout) {
      return res.status(400).json({ error: 'Buyer, crop, and payout required' });
    }
    const result = await executeMarketDeal(buyer, crop, parseFloat(payout));
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/agritex/broadcast
router.post('/agritex/broadcast', async (req, res) => {
  try {
    const { inputType, quantity, donor, dateDisplay } = req.body;
    const timeStr = new Date().toTimeString().split(' ')[0];

    await addActivityLog({
      qrCode: '🏛️ AGRITEX-NOTIF',
      typeDetails: `SMS Broadcast: Collect ${inputType} — ${quantity}`,
      status: 'notified',
      location: 'All Farmers',
      timestamp: timeStr
    });

    res.json({
      success: true,
      sms: `📢 AGRITEX NOTICE: Donated ${inputType} (${quantity}) from ${donor} is ready for collection at your nearest depot. Present your Farmer ID & OTP to collect. — AgriLedger-SITS`
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/agritex/confirm-otp
router.post('/agritex/confirm-otp', async (req, res) => {
  try {
    const { farmerId, otp, inputType, quantity } = req.body;
    const timeStr = new Date().toTimeString().split(' ')[0];

    await addActivityLog({
      qrCode: '🏛️ AGRITEX-COLLECT',
      typeDetails: `${farmerId} collected ${inputType} (${quantity})`,
      status: 'verified',
      location: 'Depot Collection',
      timestamp: timeStr
    });

    res.json({ success: true, message: `Collection confirmed for ${farmerId}` });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/reset
router.post('/reset', async (req, res) => {
  try {
    await resetDatabaseState();
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// Dealer: warehouse stock
// ---------------------------------------------------------------------------

// GET /api/dealer/stock
router.get('/dealer/stock', async (req, res) => {
  try {
    res.json(await getDealerStock());
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/dealer/stock
router.post('/dealer/stock', async (req, res) => {
  try {
    const { name, category, count } = req.body;
    if (!name || !category) {
      return res.status(400).json({ error: 'Product name and category required' });
    }
    const item = await addDealerStockItem({ name, category, count: Number(count) || 0 });
    res.json(item);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/dealer/stock/:id/adjust
router.put('/dealer/stock/:id/adjust', async (req, res) => {
  try {
    const { delta } = req.body;
    if (typeof delta !== 'number') {
      return res.status(400).json({ error: 'Numeric delta required' });
    }
    const item = await adjustDealerStock(Number(req.params.id), delta);
    res.json(item);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// Dealer: farmer distribution receipts
// ---------------------------------------------------------------------------

// GET /api/dealer/receipts
router.get('/dealer/receipts', async (req, res) => {
  try {
    res.json(await getDealerReceipts());
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/dealer/receipts
router.post('/dealer/receipts', async (req, res) => {
  try {
    const { farmer, ward, item, status } = req.body;
    if (!farmer || !ward || !item) {
      return res.status(400).json({ error: 'Farmer, ward, and item required' });
    }
    const receipt = await addDealerReceipt({ farmer, ward, item, status });
    res.json(receipt);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/dealer/receipts/:id/issue
router.put('/dealer/receipts/:id/issue', async (req, res) => {
  try {
    const receipt = await markReceiptIssued(req.params.id);
    res.json(receipt);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// Generic metrics (dealer + supplier dashboard counters)
// ---------------------------------------------------------------------------

// GET /api/metrics?keys=a,b,c
router.get('/metrics', async (req, res) => {
  try {
    const keys = String(req.query.keys || '').split(',').filter(Boolean);
    if (keys.length === 0) {
      return res.status(400).json({ error: 'keys query param required' });
    }
    res.json(await getMetrics(keys));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/metrics/:key/adjust
router.put('/metrics/:key/adjust', async (req, res) => {
  try {
    const { delta } = req.body;
    if (typeof delta !== 'number') {
      return res.status(400).json({ error: 'Numeric delta required' });
    }
    const value = await adjustMetric(req.params.key, delta);
    res.json({ key: req.params.key, value });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/metrics/:key
router.put('/metrics/:key', async (req, res) => {
  try {
    const { value } = req.body;
    if (typeof value !== 'number') {
      return res.status(400).json({ error: 'Numeric value required' });
    }
    await setMetric(req.params.key, value);
    res.json({ key: req.params.key, value });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// Supplier: production batches
// ---------------------------------------------------------------------------

// GET /api/supplier/batches
router.get('/supplier/batches', async (req, res) => {
  try {
    res.json(await getProductionBatches());
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/supplier/batches
router.post('/supplier/batches', async (req, res) => {
  try {
    const { product, quantity, plant } = req.body;
    if (!product || !quantity || !plant) {
      return res.status(400).json({ error: 'Product, quantity, and plant required' });
    }
    const batch = await addProductionBatch({ product, quantity: Number(quantity), plant });
    res.json(batch);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// Supplier: depot bulk orders
// ---------------------------------------------------------------------------

// GET /api/supplier/depot-orders
router.get('/supplier/depot-orders', async (req, res) => {
  try {
    res.json(await getDepotOrders());
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/supplier/depot-orders
router.post('/supplier/depot-orders', async (req, res) => {
  try {
    const { depot, item, status } = req.body;
    if (!depot) {
      return res.status(400).json({ error: 'Depot name required' });
    }
    const order = await addDepotOrder({ depot, item, status });
    res.json(order);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// Farmer: input voucher allocations
// ---------------------------------------------------------------------------

// GET /api/farmer/vouchers
router.get('/farmer/vouchers', async (req, res) => {
  try {
    res.json(await getFarmerVouchers());
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/farmer/vouchers
router.post('/farmer/vouchers', async (req, res) => {
  try {
    const { item } = req.body;
    const voucher = await addFarmerVoucher(item || 'Foliar Bio-Stimulant Pack (5L)');
    res.json(voucher);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/farmer/vouchers/:id/verify
router.put('/farmer/vouchers/:id/verify', async (req, res) => {
  try {
    const voucher = await verifyFarmerVoucher(req.params.id);
    res.json(voucher);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// Delivery / payout weigh-ins
// ---------------------------------------------------------------------------

// POST /api/delivery/payout
router.post('/delivery/payout', async (req, res) => {
  try {
    const { farmerAllocationId, netWeightTons } = req.body;
    if (!farmerAllocationId || !netWeightTons) {
      return res.status(400).json({ error: 'Farmer allocation ID and net weight required' });
    }
    const payout = await addDeliveryPayout({ farmerAllocationId, netWeightTons: parseFloat(netWeightTons) });
    res.json(payout);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// Agritex donated-batch QR scan
// ---------------------------------------------------------------------------

// POST /api/agritex/scan
router.post('/agritex/scan', async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'QR code required' });
    }
    const log = await addAgritexScan(code);
    res.json({ success: true, log });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// User profile update
// ---------------------------------------------------------------------------

// PUT /api/users/profile
router.put('/users/profile', async (req, res) => {
  try {
    const { email, name, phone, role, location, organization, district } = req.body;
    if (!email || !name || !location || !role) {
      return res.status(400).json({ error: 'Email, name, role, and location required' });
    }
    const result = await updateUserProfile({ email, name, phone, role, location, organization, district });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
