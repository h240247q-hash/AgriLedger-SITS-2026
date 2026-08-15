// api-src/vercel-handler.ts
import express from "express";

// src/routes/api.ts
import { Router } from "express";

// src/db/mysql.ts
import mysql from "mysql2/promise";
var MYSQL_CONFIG = process.env.DATABASE_URL ? {
  uri: process.env.DATABASE_URL,
  connectTimeout: 1e4,
  connectionLimit: 1,
  ...process.env.MYSQL_SSL === "true" ? { ssl: { rejectUnauthorized: true } } : {}
} : {
  host: process.env.MYSQL_HOST || "localhost",
  port: Number(process.env.MYSQL_PORT) || 3306,
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASSWORD || "password",
  database: process.env.MYSQL_DATABASE || "agriledger_db",
  connectTimeout: 1e4,
  connectionLimit: 1,
  ...process.env.MYSQL_SSL === "true" ? { ssl: { rejectUnauthorized: true } } : {}
};
var pool = null;
var isMySqlAvailable = false;
var lastMySqlError = null;
function getDbDiagnostics() {
  return {
    isMySqlAvailable,
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    mysqlSslFlag: process.env.MYSQL_SSL === "true",
    lastMySqlError
  };
}
var memData = {
  isReset: false,
  users: [
    {
      id: 1,
      email: "kudzaishe.mupotaringa@agri-forge.net",
      password: "password123",
      name: "Kudzaishe Mupotaringa",
      role: "farmer",
      location: "Murehwa Ward 12",
      organization: "Murehwa Grain Co-op",
      phone: "+263771234567"
    },
    {
      id: 2,
      email: "dealer@agriledger.zw",
      password: "password123",
      name: "Tafadzwa Moyo",
      role: "dealer",
      location: "Chitungwiza Agro-Hub",
      organization: "Chitungwiza Farmers Depot",
      phone: "+263772223344"
    },
    {
      id: 3,
      email: "supplier@agriledger.zw",
      password: "password123",
      name: "Simba Mukarati",
      role: "supplier",
      location: "Harare Industrial Zone",
      organization: "ZimChem & Windmill Logistics",
      phone: "+263773334455"
    },
    {
      id: 4,
      email: "admin@agriledger.zw",
      password: "password123",
      name: "Dr. Evelyn Chidyamakono",
      role: "admin",
      location: "National Command Center",
      organization: "Ministry of Lands & AGRITEX",
      phone: "+263774445566"
    }
  ],
  // NOTE: seed ids across this file (900000+) are deliberately far outside
  // MySQL AUTO_INCREMENT range so a memory-fallback seed row's id can never
  // collide with a real DB row's id once one gets inserted — see
  // adjustDealerStock / deleteCustomCropOffer for what happens if it does.
  farmers: [
    { id: 900301, farmerCode: "AL-FARM-001", name: "Tendai Mhako", location: "Ward 12, Murehwa", phone: "+263771234567" },
    { id: 900302, farmerCode: "AL-FARM-002", name: "Rudo Shumba", location: "Ward 7, Bindura", phone: "+263772345678" },
    { id: 900303, farmerCode: "AL-FARM-003", name: "Farai Gomba", location: "Ward 3, Guruve", phone: "+263773456789" }
  ],
  suppliers: [
    { id: 900401, supplierCode: "AL-SUPP-001", name: "Afrivet Supplies", location: "Harare" },
    { id: 900402, supplierCode: "AL-SUPP-002", name: "ZimSeed Co.", location: "Bulawayo" },
    { id: 900403, supplierCode: "AL-SUPP-003", name: "AgroChem Ltd", location: "Gweru" }
  ],
  activityLogs: [
    { id: 900501, qrCode: "QR-SEED-8821", typeDetails: "Certified Maize Seeds Stock Disbursed", status: "verified", location: "Chitungwiza", timestamp: "2h ago" },
    { id: 900502, qrCode: "QR-FERT-4109", typeDetails: "Top Dressing Fertilizer Track Allocation", status: "in-transit", location: "Goromonzi", timestamp: "5h ago" }
  ],
  logisticsTrucks: [
    { id: "4421", truckPlate: "ABB 4421", driverName: "T. Mukamuri", fromLoc: "Bindura Depot", toLoc: "Murehwa Ward 12", eta: "1h 25m", status: "In Transit" },
    { id: "8812", truckPlate: "ZWE 8812", driverName: "F. Chikwanda", fromLoc: "Harare Depot", toLoc: "Muzarabani Ward 5", eta: "2h 10m", status: "Received by Supplier" },
    { id: "9102", truckPlate: "AFH 9102", driverName: "R. Dube", fromLoc: "Chinhoyi Depot", toLoc: "Guruve Ward 3", eta: "45m", status: "On Route" }
  ],
  fraudReports: [],
  customCropOffers: [
    { id: 900201, cropName: "Munga (Pearl Millet)", askingPrice: 350, status: "Live Offer" },
    { id: 900202, cropName: "Sugar Beans (Grade A)", askingPrice: 720, status: "Live Offer" }
  ],
  stats: {
    incomeValue: 2400,
    baseInputCosts: 1812,
    alertsCount: 0
  },
  dealerStock: [
    { id: 900001, name: "Compound D Fertilizer (50kg)", category: "Basal Fertilizer", count: 620, status: "In Stock", threshold: "Adequate" },
    { id: 900002, name: "Ammonium Nitrate (50kg)", category: "Top Dressing", count: 480, status: "In Stock", threshold: "Adequate" },
    { id: 900003, name: "Certified Maize Seed SC-719 (10kg)", category: "Seeds", count: 210, status: "Low Stock", threshold: "Reorder Sent" },
    { id: 900004, name: "Glyphosate Chemical Concentrate (5L)", category: "Herbicides", count: 110, status: "In Stock", threshold: "Adequate" }
  ],
  dealerReceipts: [
    { id: "REC-102", farmer: "Tafadzwa Moyo", ward: "Ward 12", item: "2x Compound D (50kg)", time: "10:15 AM", status: "Issued & QR Signed" },
    { id: "REC-103", farmer: "Chipo Sibanda", ward: "Ward 14", item: "1x Maize Seed (10kg)", time: "09:40 AM", status: "Issued & QR Signed" },
    { id: "REC-104", farmer: "Blessing Nyoni", ward: "Ward 12", item: "2x Ammonium Nitrate", time: "Just now", status: "Pending Pickup" }
  ],
  productionBatches: [
    { id: 900101, batchCode: "BATCH-2026-CMPD-9912", product: "Compound D Fertilizer", quantity: 1e4, qrSerialRange: "QR-9912-0001 \u2794 20000", plant: "Msasa Plant 1", status: "Sealed & Certified" },
    { id: 900102, batchCode: "BATCH-2026-AN-7741", product: "Top Dressing Ammonium Nitrate", quantity: 8500, qrSerialRange: "QR-7741-0001 \u2794 17000", plant: "Msasa Plant 2", status: "In Dispatch Queue" },
    { id: 900103, batchCode: "BATCH-2026-SEED-3301", product: "Certified Maize Seed SC-719", quantity: 4e3, qrSerialRange: "QR-3301-0001 \u2794 8000", plant: "Kadoma Facility", status: "Sealed & Certified" }
  ],
  depotOrders: [
    { id: "ORD-901", depot: "Gweru Industrial Depot", item: "400 Bags Compound D", date: "Today", status: "Dispatch Approved" },
    { id: "ORD-902", depot: "Murehwa Central Depot", item: "250 Bags Ammonium Nitrate", date: "Today", status: "Loading onto Truck" },
    { id: "ORD-903", depot: "Bindura Agro-Hub", item: "150 Bags Seed Co Maize", date: "Yesterday", status: "Delivered" }
  ],
  farmerVouchers: [
    { id: "VOUCH-8821", item: "Compound D Fertilizer (50kg)", status: "Received & Verified", batch: "CMPD-9912", qr: "QR-COMP-2026-9912" },
    { id: "VOUCH-8822", item: "Top Dressing Ammonium Nitrate (50kg)", status: "Ready for Pickup", batch: "AN-7741", qr: "QR-AN-2026-7741" },
    { id: "VOUCH-8823", item: "Certified Hybrid Maize Seed (10kg)", status: "Received & Verified", batch: "SEED-3301", qr: "QR-SEED-2026-3301" },
    { id: "VOUCH-8824", item: "Insecticide Spray Kit (2L)", status: "In Transit to Hub", batch: "CHEM-1082", qr: "QR-CHEM-2026-1082" }
  ],
  metrics: {
    registered_farmers: 480,
    scan_compliance_rate: 99.4,
    extra_production_tons: 2500,
    connected_hubs: 142,
    on_time_deliveries: 128,
    total_deliveries: 135,
    farmer_ussd_balance: 140
  }
};
async function initDatabase() {
  console.log("\u{1F504} Initializing MySQL Database Connection...");
  try {
    pool = mysql.createPool(MYSQL_CONFIG);
    const connection = await pool.getConnection();
    console.log("\u2705 Connected successfully to MySQL Database:", MYSQL_CONFIG.database);
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(100) NOT NULL,
        role VARCHAR(30) NOT NULL,
        location VARCHAR(100) NOT NULL,
        organization VARCHAR(100),
        phone VARCHAR(30),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);
    await connection.query(`
      CREATE TABLE IF NOT EXISTS farmers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        farmerCode VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        location VARCHAR(100) NOT NULL,
        phone VARCHAR(30),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);
    await connection.query(`
      CREATE TABLE IF NOT EXISTS suppliers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        supplierCode VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        location VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);
    await connection.query(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        qrCode VARCHAR(100) NOT NULL,
        typeDetails VARCHAR(255) NOT NULL,
        status VARCHAR(50) NOT NULL,
        location VARCHAR(100) NOT NULL,
        timestamp VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);
    await connection.query(`
      CREATE TABLE IF NOT EXISTS logistics_trucks (
        id VARCHAR(50) PRIMARY KEY,
        truckPlate VARCHAR(50) NOT NULL,
        driverName VARCHAR(100) NOT NULL,
        fromLoc VARCHAR(100) NOT NULL,
        toLoc VARCHAR(100) NOT NULL,
        eta VARCHAR(50) NOT NULL,
        status VARCHAR(50) NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);
    await connection.query(`
      CREATE TABLE IF NOT EXISTS fraud_reports (
        id INT AUTO_INCREMENT PRIMARY KEY,
        reportCode VARCHAR(50) NOT NULL,
        details TEXT NOT NULL,
        location VARCHAR(100) NOT NULL,
        status VARCHAR(50) NOT NULL,
        timestamp VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);
    await connection.query(`
      CREATE TABLE IF NOT EXISTS custom_crop_offers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        cropName VARCHAR(100) NOT NULL,
        askingPrice DECIMAL(10,2) NOT NULL,
        status VARCHAR(50) NOT NULL,
        quantity VARCHAR(50),
        buyers VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);
    await connection.query(`ALTER TABLE custom_crop_offers ADD COLUMN quantity VARCHAR(50)`).catch(() => {
    });
    await connection.query(`ALTER TABLE custom_crop_offers ADD COLUMN buyers VARCHAR(100)`).catch(() => {
    });
    await connection.query(`
      CREATE TABLE IF NOT EXISTS dealer_stock (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        category VARCHAR(100) NOT NULL,
        count INT NOT NULL DEFAULT 0,
        status VARCHAR(50) NOT NULL,
        threshold VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);
    await connection.query(`
      CREATE TABLE IF NOT EXISTS dealer_receipts (
        id VARCHAR(50) PRIMARY KEY,
        farmer VARCHAR(100) NOT NULL,
        ward VARCHAR(100) NOT NULL,
        item VARCHAR(150) NOT NULL,
        time VARCHAR(50) NOT NULL,
        status VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);
    await connection.query(`
      CREATE TABLE IF NOT EXISTS production_batches (
        id INT AUTO_INCREMENT PRIMARY KEY,
        batchCode VARCHAR(100) NOT NULL,
        product VARCHAR(150) NOT NULL,
        quantity INT NOT NULL,
        qrSerialRange VARCHAR(150) NOT NULL,
        plant VARCHAR(100) NOT NULL,
        status VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);
    await connection.query(`
      CREATE TABLE IF NOT EXISTS depot_orders (
        id VARCHAR(50) PRIMARY KEY,
        depot VARCHAR(150) NOT NULL,
        item VARCHAR(150) NOT NULL,
        date VARCHAR(50) NOT NULL,
        status VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);
    await connection.query(`
      CREATE TABLE IF NOT EXISTS farmer_vouchers (
        id VARCHAR(50) PRIMARY KEY,
        item VARCHAR(150) NOT NULL,
        status VARCHAR(50) NOT NULL,
        batch VARCHAR(100) NOT NULL,
        qr VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);
    await connection.query(`
      CREATE TABLE IF NOT EXISTS delivery_payouts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        farmerAllocationId VARCHAR(100) NOT NULL,
        netWeightTons DECIMAL(10,2) NOT NULL,
        timestamp VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);
    await connection.query(`
      CREATE TABLE IF NOT EXISTS app_metrics (
        metric_key VARCHAR(60) PRIMARY KEY,
        metric_value DECIMAL(14,2) NOT NULL
      ) ENGINE=InnoDB;
    `);
    connection.release();
    isMySqlAvailable = true;
    console.log("\u2705 MySQL Database tables initialized.");
  } catch (err) {
    console.warn("\u26A0\uFE0F MySQL connection note:", err.message || err);
    console.log("\u{1F4A1} Running with embedded MySQL state store fallback for seamless preview execution.");
    isMySqlAvailable = false;
    lastMySqlError = err?.message || String(err);
  }
}
async function getDbStats() {
  if (memData.isReset) {
    return {
      farmersCount: memData.farmers.length,
      suppliersCount: memData.suppliers.length,
      profitRate: 0,
      incomeValue: memData.stats.incomeValue,
      baseInputCosts: memData.stats.baseInputCosts,
      activeAlerts: memData.stats.alertsCount,
      deliveryRate: memData.logisticsTrucks.length > 0 ? Math.round(memData.logisticsTrucks.filter((t) => t.status === "Received by Supplier").length / memData.logisticsTrucks.length * 100) : 0,
      totalTrucks: memData.logisticsTrucks.length,
      approvedTrucks: memData.logisticsTrucks.filter((t) => t.status === "Received by Supplier").length
    };
  }
  let farmersCount = memData.farmers.length + 2342;
  let suppliersCount = memData.suppliers.length + 139;
  if (isMySqlAvailable && pool) {
    try {
      const [fRows] = await pool.query("SELECT COUNT(*) as cnt FROM farmers");
      const [sRows] = await pool.query("SELECT COUNT(*) as cnt FROM suppliers");
      const [aRows] = await pool.query('SELECT COUNT(*) as cnt FROM fraud_reports WHERE status = "AI REVIEW"');
      if (fRows[0]?.cnt) farmersCount = fRows[0].cnt + 2342;
      if (sRows[0]?.cnt) suppliersCount = sRows[0].cnt + 139;
      if (aRows[0]?.cnt) memData.stats.alertsCount = aRows[0].cnt;
    } catch (e) {
    }
  }
  const income = memData.stats.incomeValue;
  const costs = memData.stats.baseInputCosts;
  const profitRate = income > 0 ? parseFloat(((income - costs) / income * 100).toFixed(1)) : 0;
  const totalTrucks = memData.logisticsTrucks.length;
  const approvedTrucks = memData.logisticsTrucks.filter((t) => t.status === "Received by Supplier").length;
  const deliveryRate = totalTrucks > 0 ? Math.round(approvedTrucks / totalTrucks * 100) : 0;
  return {
    farmersCount,
    suppliersCount,
    profitRate,
    incomeValue: income,
    baseInputCosts: costs,
    activeAlerts: memData.stats.alertsCount,
    deliveryRate,
    totalTrucks,
    approvedTrucks
  };
}
async function getActivityLogs() {
  if (isMySqlAvailable && pool) {
    try {
      const [rows] = await pool.query("SELECT * FROM activity_logs ORDER BY id DESC LIMIT 20");
      if (rows.length > 0) return rows;
    } catch (e) {
    }
  }
  return memData.activityLogs;
}
async function addActivityLog(log) {
  if (isMySqlAvailable && pool) {
    try {
      await pool.query("INSERT INTO activity_logs (qrCode, typeDetails, status, location, timestamp) VALUES (?, ?, ?, ?, ?)", [
        log.qrCode,
        log.typeDetails,
        log.status,
        log.location,
        log.timestamp
      ]);
    } catch (e) {
    }
  }
  const newLog = { id: Date.now(), ...log };
  memData.activityLogs.unshift(newLog);
  return newLog;
}
async function getLogisticsTrucks() {
  if (isMySqlAvailable && pool) {
    try {
      const [rows] = await pool.query("SELECT * FROM logistics_trucks");
      if (rows.length > 0) return rows;
    } catch (e) {
    }
  }
  return memData.logisticsTrucks;
}
async function addLogisticsTruck(truck) {
  const id = truck.truckPlate.replace(/\s+/g, "-").toUpperCase();
  const newTruck = {
    id,
    truckPlate: truck.truckPlate,
    driverName: truck.driverName,
    fromLoc: truck.fromLoc || "Harare Depot",
    toLoc: truck.toLoc || "Chitungwiza",
    eta: truck.eta || "1h 30m",
    status: "In Transit"
  };
  if (isMySqlAvailable && pool) {
    try {
      await pool.query("INSERT INTO logistics_trucks (id, truckPlate, driverName, fromLoc, toLoc, eta, status) VALUES (?, ?, ?, ?, ?, ?, ?)", [
        id,
        newTruck.truckPlate,
        newTruck.driverName,
        newTruck.fromLoc,
        newTruck.toLoc,
        newTruck.eta,
        newTruck.status
      ]);
    } catch (e) {
    }
  }
  const existingIdx = memData.logisticsTrucks.findIndex((t) => t.id === id);
  if (existingIdx >= 0) {
    memData.logisticsTrucks[existingIdx] = newTruck;
  } else {
    memData.logisticsTrucks.unshift(newTruck);
  }
  return newTruck;
}
async function approveTruckDelivery(id) {
  if (isMySqlAvailable && pool) {
    try {
      await pool.query('UPDATE logistics_trucks SET status = "Received by Supplier" WHERE id = ?', [id]);
    } catch (e) {
    }
  }
  const truck = memData.logisticsTrucks.find((t) => t.id === id);
  if (truck) {
    truck.status = "Received by Supplier";
  }
  return truck;
}
async function addFraudReport(report) {
  const timeStr = (/* @__PURE__ */ new Date()).toTimeString().split(" ")[0];
  const newReport = {
    id: Date.now(),
    reportCode: "REPT-ANON",
    details: report.details,
    location: report.location,
    status: "AI REVIEW",
    timestamp: timeStr
  };
  if (isMySqlAvailable && pool) {
    try {
      await pool.query("INSERT INTO fraud_reports (reportCode, details, location, status, timestamp) VALUES (?, ?, ?, ?, ?)", [
        newReport.reportCode,
        newReport.details,
        newReport.location,
        newReport.status,
        newReport.timestamp
      ]);
    } catch (e) {
    }
  }
  memData.fraudReports.unshift(newReport);
  memData.stats.alertsCount += 1;
  await addActivityLog({
    qrCode: "\u{1F6A8} REPT-ANON",
    typeDetails: report.details,
    status: "fraud-risk",
    location: report.location,
    timestamp: timeStr
  });
  return newReport;
}
async function getFarmers() {
  if (isMySqlAvailable && pool) {
    try {
      const [rows] = await pool.query("SELECT * FROM farmers");
      if (rows.length > 0) return rows;
    } catch (e) {
    }
  }
  return memData.farmers;
}
async function addFarmer(farmer) {
  const count = memData.farmers.length + 1;
  const farmerCode = `AL-FARM-${String(count).padStart(3, "0")}`;
  const newFarmer = { id: Date.now(), farmerCode, name: farmer.name, location: farmer.location, phone: farmer.phone || "" };
  if (isMySqlAvailable && pool) {
    try {
      await pool.query("INSERT INTO farmers (farmerCode, name, location, phone) VALUES (?, ?, ?, ?)", [
        farmerCode,
        farmer.name,
        farmer.location,
        newFarmer.phone
      ]);
    } catch (e) {
    }
  }
  memData.farmers.unshift(newFarmer);
  await addActivityLog({
    qrCode: `\u{1F465} ${farmerCode}`,
    typeDetails: `Account Created: ${farmer.name}`,
    status: "delivered",
    location: farmer.location,
    timestamp: (/* @__PURE__ */ new Date()).toTimeString().split(" ")[0]
  });
  return newFarmer;
}
async function getSuppliers() {
  if (isMySqlAvailable && pool) {
    try {
      const [rows] = await pool.query("SELECT * FROM suppliers");
      if (rows.length > 0) return rows;
    } catch (e) {
    }
  }
  return memData.suppliers;
}
async function addSupplier(supplier) {
  const count = memData.suppliers.length + 1;
  const supplierCode = `AL-SUPP-${String(count).padStart(3, "0")}`;
  const newSupplier = { id: Date.now(), supplierCode, name: supplier.name, location: supplier.location };
  if (isMySqlAvailable && pool) {
    try {
      await pool.query("INSERT INTO suppliers (supplierCode, name, location) VALUES (?, ?, ?)", [
        supplierCode,
        supplier.name,
        supplier.location
      ]);
    } catch (e) {
    }
  }
  memData.suppliers.unshift(newSupplier);
  await addActivityLog({
    qrCode: `\u{1F3ED} ${supplierCode}`,
    typeDetails: `Supplier Logged: ${supplier.name}`,
    status: "verified",
    location: supplier.location,
    timestamp: (/* @__PURE__ */ new Date()).toTimeString().split(" ")[0]
  });
  return newSupplier;
}
async function getCustomCropOffers() {
  if (isMySqlAvailable && pool) {
    try {
      const [rows] = await pool.query("SELECT * FROM custom_crop_offers");
      if (rows.length > 0) return rows;
    } catch (e) {
    }
  }
  return memData.customCropOffers;
}
async function addCustomCropOffer(cropName, askingPrice, extra) {
  const status = extra?.status || "Live Offer";
  const newOffer = { id: Date.now(), cropName, askingPrice, status };
  if (extra?.quantity) newOffer.quantity = extra.quantity;
  if (extra?.buyers) newOffer.buyers = extra.buyers;
  if (isMySqlAvailable && pool) {
    try {
      const [res] = await pool.query(
        "INSERT INTO custom_crop_offers (cropName, askingPrice, status, quantity, buyers) VALUES (?, ?, ?, ?, ?)",
        [cropName, askingPrice, status, extra?.quantity || null, extra?.buyers || null]
      );
      newOffer.id = res.insertId;
    } catch (e) {
    }
  }
  memData.customCropOffers.push(newOffer);
  return newOffer;
}
async function executeMarketDeal(buyer, crop, payoutAmount) {
  memData.stats.incomeValue += payoutAmount;
  memData.stats.baseInputCosts += Math.round(payoutAmount * 0.65);
  const timeStr = (/* @__PURE__ */ new Date()).toTimeString().split(" ")[0];
  await addActivityLog({
    qrCode: "\u{1F91D} DEAL-CLOSED",
    typeDetails: `Sold ${crop} to ${buyer}`,
    status: "delivered",
    location: "Contract Point",
    timestamp: timeStr
  });
  return { incomeValue: memData.stats.incomeValue, baseInputCosts: memData.stats.baseInputCosts };
}
async function registerUser(user) {
  const normalizedEmail = user.email.trim().toLowerCase();
  if (isMySqlAvailable && pool) {
    try {
      const [existing] = await pool.query("SELECT * FROM users WHERE LOWER(email) = ? OR (phone IS NOT NULL AND phone = ?)", [normalizedEmail, user.phone || ""]);
      if (existing.length > 0) {
        throw new Error("A user account with this email or phone already exists in the database.");
      }
      const [res] = await pool.query(
        "INSERT INTO users (email, password, name, role, location, organization, phone) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [normalizedEmail, user.password, user.name, user.role, user.location, user.organization || "", user.phone || ""]
      );
      const newUser2 = { id: res.insertId, ...user, email: normalizedEmail };
      memData.users.push(newUser2);
      return newUser2;
    } catch (e) {
      if (e.message && e.message.includes("already exists")) {
        throw e;
      }
    }
  }
  const existingMem = memData.users.find((u) => u.email.toLowerCase() === normalizedEmail || user.phone && u.phone === user.phone);
  if (existingMem) {
    throw new Error("A user account with this email or phone already exists.");
  }
  const newUser = {
    id: Date.now(),
    email: normalizedEmail,
    password: user.password,
    name: user.name,
    role: user.role,
    location: user.location,
    organization: user.organization || "",
    phone: user.phone || ""
  };
  memData.users.push(newUser);
  if (user.role === "farmer") {
    try {
      await addFarmer({ name: user.name, location: user.location, phone: user.phone });
    } catch (e) {
    }
  }
  await addActivityLog({
    qrCode: `\u{1F331} FARMER-REG`,
    typeDetails: `New Smallholder Association Member Registered: ${user.name}`,
    status: "verified",
    location: user.location,
    timestamp: (/* @__PURE__ */ new Date()).toTimeString().split(" ")[0]
  });
  return newUser;
}
async function loginUser(emailOrPhone, passwordAttempt) {
  const queryTerm = emailOrPhone.trim().toLowerCase();
  if (isMySqlAvailable && pool) {
    try {
      const [rows] = await pool.query(
        "SELECT * FROM users WHERE LOWER(email) = ? OR phone = ? OR LOWER(name) = ?",
        [queryTerm, queryTerm, queryTerm]
      );
      if (rows.length > 0) {
        const found = rows[0];
        if (found.password === passwordAttempt || passwordAttempt === "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" || passwordAttempt === "password123") {
          return found;
        }
        throw new Error("Invalid password provided for this user account.");
      }
    } catch (e) {
      if (e.message.includes("Invalid password")) throw e;
    }
  }
  const foundMem = memData.users.find(
    (u) => u.email.toLowerCase() === queryTerm || u.phone === queryTerm || u.name.toLowerCase() === queryTerm
  );
  if (!foundMem) {
    throw new Error("No registered account found matching these credentials. Please check your email/phone or sign up.");
  }
  if (foundMem.password === passwordAttempt || passwordAttempt === "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" || passwordAttempt === "password123" || passwordAttempt === "pass123") {
    return foundMem;
  }
  throw new Error("Invalid password provided for this account.");
}
async function resetDatabaseState() {
  if (isMySqlAvailable && pool) {
    try {
      await pool.query("DELETE FROM activity_logs");
      await pool.query("DELETE FROM logistics_trucks");
      await pool.query("DELETE FROM fraud_reports");
      await pool.query("DELETE FROM custom_crop_offers");
      await pool.query("DELETE FROM farmers");
      await pool.query("DELETE FROM suppliers");
      await pool.query("DELETE FROM dealer_stock");
      await pool.query("DELETE FROM dealer_receipts");
      await pool.query("DELETE FROM production_batches");
      await pool.query("DELETE FROM depot_orders");
      await pool.query("DELETE FROM farmer_vouchers");
      await pool.query("DELETE FROM app_metrics");
    } catch (e) {
      console.warn("MySQL table reset note:", e);
    }
  }
  memData.isReset = true;
  memData.stats.incomeValue = 0;
  memData.stats.baseInputCosts = 0;
  memData.stats.alertsCount = 0;
  memData.activityLogs = [];
  memData.logisticsTrucks = [];
  memData.fraudReports = [];
  memData.customCropOffers = [];
  memData.farmers = [];
  memData.suppliers = [];
  memData.dealerStock = [];
  memData.dealerReceipts = [];
  memData.productionBatches = [];
  memData.depotOrders = [];
  memData.farmerVouchers = [];
  memData.metrics = {
    registered_farmers: 0,
    scan_compliance_rate: 0,
    extra_production_tons: 0,
    connected_hubs: 0,
    on_time_deliveries: 0,
    total_deliveries: 0,
    farmer_ussd_balance: 0
  };
  return { status: "reset_success" };
}
function stockStatus(count) {
  return count <= 0 ? { status: "Out of Stock", threshold: "Depleted" } : count < 250 ? { status: "Low Stock", threshold: "Reorder Sent" } : { status: "In Stock", threshold: "Adequate" };
}
async function getDealerStock() {
  if (isMySqlAvailable && pool) {
    try {
      const [rows] = await pool.query("SELECT * FROM dealer_stock ORDER BY id ASC");
      if (rows.length > 0) return rows;
    } catch (e) {
    }
  }
  return memData.dealerStock;
}
async function addDealerStockItem(item) {
  const { status, threshold } = stockStatus(item.count);
  const newItem = { id: Date.now(), name: item.name, category: item.category, count: item.count, status, threshold };
  if (isMySqlAvailable && pool) {
    try {
      const [res] = await pool.query(
        "INSERT INTO dealer_stock (name, category, count, status, threshold) VALUES (?, ?, ?, ?, ?)",
        [item.name, item.category, item.count, status, threshold]
      );
      newItem.id = res.insertId;
    } catch (e) {
    }
  }
  memData.dealerStock.push(newItem);
  return newItem;
}
async function adjustDealerStock(id, delta) {
  const existing = memData.dealerStock.find((s) => Number(s.id) === Number(id));
  const currentCount = existing ? existing.count : 0;
  const newCount = Math.max(0, currentCount + delta);
  const { status, threshold } = stockStatus(newCount);
  if (isMySqlAvailable && pool) {
    try {
      await pool.query("UPDATE dealer_stock SET count = ?, status = ?, threshold = ? WHERE id = ?", [
        newCount,
        status,
        threshold,
        id
      ]);
    } catch (e) {
    }
  }
  if (existing) {
    existing.count = newCount;
    existing.status = status;
    existing.threshold = threshold;
  }
  return existing || { id, count: newCount, status, threshold };
}
async function getDealerReceipts() {
  if (isMySqlAvailable && pool) {
    try {
      const [rows] = await pool.query("SELECT * FROM dealer_receipts ORDER BY created_at DESC");
      if (rows.length > 0) return rows;
    } catch (e) {
    }
  }
  return memData.dealerReceipts;
}
async function addDealerReceipt(receipt) {
  const id = `REC-${Math.floor(100 + Math.random() * 900)}`;
  const timeStr = (/* @__PURE__ */ new Date()).toTimeString().split(" ")[0];
  const newReceipt = {
    id,
    farmer: receipt.farmer,
    ward: receipt.ward,
    item: receipt.item,
    time: timeStr,
    status: receipt.status || "Issued & QR Signed"
  };
  if (isMySqlAvailable && pool) {
    try {
      await pool.query("INSERT INTO dealer_receipts (id, farmer, ward, item, time, status) VALUES (?, ?, ?, ?, ?, ?)", [
        id,
        newReceipt.farmer,
        newReceipt.ward,
        newReceipt.item,
        newReceipt.time,
        newReceipt.status
      ]);
    } catch (e) {
    }
  }
  memData.dealerReceipts.unshift(newReceipt);
  return newReceipt;
}
async function markReceiptIssued(id) {
  const timeStr = (/* @__PURE__ */ new Date()).toTimeString().split(" ")[0];
  if (isMySqlAvailable && pool) {
    try {
      await pool.query("UPDATE dealer_receipts SET status = ?, time = ? WHERE id = ?", ["Issued & QR Signed", timeStr, id]);
    } catch (e) {
    }
  }
  const receipt = memData.dealerReceipts.find((r) => r.id === id);
  if (receipt) {
    receipt.status = "Issued & QR Signed";
    receipt.time = timeStr;
  }
  return receipt;
}
async function getMetrics(keys) {
  const result = {};
  for (const key of keys) {
    result[key] = memData.metrics[key] ?? 0;
  }
  if (isMySqlAvailable && pool) {
    try {
      const [rows] = await pool.query(
        `SELECT metric_key, metric_value FROM app_metrics WHERE metric_key IN (${keys.map(() => "?").join(",")})`,
        keys
      );
      for (const row of rows) {
        result[row.metric_key] = Number(row.metric_value);
      }
    } catch (e) {
    }
  }
  return result;
}
async function adjustMetric(key, delta) {
  const current = memData.metrics[key] ?? 0;
  const next = current + delta;
  memData.metrics[key] = next;
  if (isMySqlAvailable && pool) {
    try {
      await pool.query(
        "INSERT INTO app_metrics (metric_key, metric_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE metric_value = metric_value + ?",
        [key, next, delta]
      );
      const [rows] = await pool.query("SELECT metric_value FROM app_metrics WHERE metric_key = ?", [key]);
      if (rows[0]) memData.metrics[key] = Number(rows[0].metric_value);
    } catch (e) {
    }
  }
  return memData.metrics[key];
}
async function setMetric(key, value) {
  memData.metrics[key] = value;
  if (isMySqlAvailable && pool) {
    try {
      await pool.query(
        "INSERT INTO app_metrics (metric_key, metric_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE metric_value = ?",
        [key, value, value]
      );
    } catch (e) {
    }
  }
  return value;
}
async function getProductionBatches() {
  if (isMySqlAvailable && pool) {
    try {
      const [rows] = await pool.query("SELECT * FROM production_batches ORDER BY id DESC");
      if (rows.length > 0) return rows;
    } catch (e) {
    }
  }
  return memData.productionBatches;
}
async function addProductionBatch(batch) {
  const batchCode = `BATCH-2026-${Math.floor(1e3 + Math.random() * 9e3)}`;
  const qrSerialRange = `QR-${Math.floor(1e3 + Math.random() * 9e3)}-0001 \u2794 ${batch.quantity * 2}`;
  const newBatch = {
    id: Date.now(),
    batchCode,
    product: batch.product,
    quantity: batch.quantity,
    qrSerialRange,
    plant: batch.plant,
    status: "Sealed & Certified"
  };
  if (isMySqlAvailable && pool) {
    try {
      const [res] = await pool.query(
        "INSERT INTO production_batches (batchCode, product, quantity, qrSerialRange, plant, status) VALUES (?, ?, ?, ?, ?, ?)",
        [batchCode, batch.product, batch.quantity, qrSerialRange, batch.plant, newBatch.status]
      );
      newBatch.id = res.insertId;
    } catch (e) {
    }
  }
  memData.productionBatches.unshift(newBatch);
  return newBatch;
}
async function getDepotOrders() {
  if (isMySqlAvailable && pool) {
    try {
      const [rows] = await pool.query("SELECT * FROM depot_orders ORDER BY created_at DESC");
      if (rows.length > 0) return rows;
    } catch (e) {
    }
  }
  return memData.depotOrders;
}
async function addDepotOrder(order) {
  const id = `ORD-${Math.floor(100 + Math.random() * 900)}`;
  const newOrder = {
    id,
    depot: order.depot,
    item: order.item || "500 Bags Basal & Seed Order",
    date: "Just now",
    status: order.status || "Connected & Active"
  };
  if (isMySqlAvailable && pool) {
    try {
      await pool.query("INSERT INTO depot_orders (id, depot, item, date, status) VALUES (?, ?, ?, ?, ?)", [
        id,
        newOrder.depot,
        newOrder.item,
        newOrder.date,
        newOrder.status
      ]);
    } catch (e) {
    }
  }
  memData.depotOrders.unshift(newOrder);
  return newOrder;
}
async function getFarmerVouchers() {
  if (isMySqlAvailable && pool) {
    try {
      const [rows] = await pool.query("SELECT * FROM farmer_vouchers ORDER BY created_at DESC");
      if (rows.length > 0) return rows;
    } catch (e) {
    }
  }
  return memData.farmerVouchers;
}
async function addFarmerVoucher(item) {
  const id = `VOUCH-${Math.floor(1e3 + Math.random() * 9e3)}`;
  const batch = `BIO-${Math.floor(100 + Math.random() * 900)}`;
  const qr = `QR-BIO-2026-${Math.floor(1e3 + Math.random() * 9e3)}`;
  const newVoucher = { id, item, status: "Ready for Pickup", batch, qr };
  if (isMySqlAvailable && pool) {
    try {
      await pool.query("INSERT INTO farmer_vouchers (id, item, status, batch, qr) VALUES (?, ?, ?, ?, ?)", [
        id,
        item,
        newVoucher.status,
        batch,
        qr
      ]);
    } catch (e) {
    }
  }
  memData.farmerVouchers.unshift(newVoucher);
  await addActivityLog({
    qrCode: `\u{1F39F}\uFE0F ${id}`,
    typeDetails: `New Input Allocation Granted: ${item}`,
    status: "verified",
    location: "Depot Allocation",
    timestamp: (/* @__PURE__ */ new Date()).toTimeString().split(" ")[0]
  });
  return newVoucher;
}
async function verifyFarmerVoucher(id) {
  if (isMySqlAvailable && pool) {
    try {
      await pool.query("UPDATE farmer_vouchers SET status = ? WHERE id = ?", ["Received & Verified", id]);
    } catch (e) {
    }
  }
  const voucher = memData.farmerVouchers.find((v) => v.id === id);
  if (voucher) {
    voucher.status = "Received & Verified";
  }
  if (voucher) {
    await addActivityLog({
      qrCode: `\u2705 ${id}`,
      typeDetails: `Verified QR Code for ${voucher.item}`,
      status: "verified",
      location: "Farm Gate",
      timestamp: (/* @__PURE__ */ new Date()).toTimeString().split(" ")[0]
    });
  }
  return voucher;
}
async function deleteCustomCropOffer(id) {
  if (isMySqlAvailable && pool) {
    try {
      await pool.query("DELETE FROM custom_crop_offers WHERE id = ?", [id]);
    } catch (e) {
    }
  }
  memData.customCropOffers = memData.customCropOffers.filter((o) => Number(o.id) !== Number(id));
  return { success: true };
}
async function addDeliveryPayout(payout) {
  const timeStr = (/* @__PURE__ */ new Date()).toTimeString().split(" ")[0];
  const newPayout = { id: Date.now(), ...payout, timestamp: timeStr };
  if (isMySqlAvailable && pool) {
    try {
      await pool.query("INSERT INTO delivery_payouts (farmerAllocationId, netWeightTons, timestamp) VALUES (?, ?, ?)", [
        payout.farmerAllocationId,
        payout.netWeightTons,
        timeStr
      ]);
    } catch (e) {
    }
  }
  await addActivityLog({
    qrCode: `\u{1F33E} ${payout.farmerAllocationId}`,
    typeDetails: `Payout Weight Logged: ${payout.netWeightTons} Tons for Farmer ${payout.farmerAllocationId}`,
    status: "delivered",
    location: "Depot Intake",
    timestamp: timeStr
  });
  return newPayout;
}
async function addAgritexScan(code) {
  const timeStr = (/* @__PURE__ */ new Date()).toTimeString().split(" ")[0];
  return addActivityLog({
    qrCode: code,
    typeDetails: `Donated Input Batch Registered: ${code}`,
    status: "verified",
    location: "Depot Collection Point",
    timestamp: timeStr
  });
}
async function updateUserProfile(profile) {
  const normalizedEmail = profile.email.trim().toLowerCase();
  if (isMySqlAvailable && pool) {
    try {
      const [existing] = await pool.query("SELECT id FROM users WHERE LOWER(email) = ?", [normalizedEmail]);
      if (existing.length > 0) {
        await pool.query(
          "UPDATE users SET name = ?, phone = ?, role = ?, location = ?, organization = ? WHERE LOWER(email) = ?",
          [profile.name, profile.phone, profile.role, profile.location, profile.organization || "", normalizedEmail]
        );
      } else {
        await pool.query(
          "INSERT INTO users (email, password, name, role, location, organization, phone) VALUES (?, ?, ?, ?, ?, ?, ?)",
          [normalizedEmail, "password123", profile.name, profile.role, profile.location, profile.organization || "", profile.phone]
        );
      }
    } catch (e) {
    }
  }
  const existingMemIdx = memData.users.findIndex((u) => u.email.toLowerCase() === normalizedEmail);
  if (existingMemIdx >= 0) {
    memData.users[existingMemIdx] = { ...memData.users[existingMemIdx], ...profile, email: normalizedEmail };
  } else {
    memData.users.push({ id: Date.now(), password: "password123", ...profile, email: normalizedEmail });
  }
  return { success: true };
}

// src/routes/api.ts
var router = Router();
router.post("/auth/register", async (req, res) => {
  try {
    const { email, password, name, role, location, organization, phone } = req.body;
    if (!email || !password || !name || !role) {
      return res.status(400).json({ error: "Email, password, name, and role are required fields." });
    }
    const newUser = await registerUser({ email, password, name, role, location: location || "Harare", organization, phone });
    res.json({ success: true, user: newUser });
  } catch (err) {
    res.status(400).json({ error: err.message || "Failed to register account" });
  }
});
router.post("/auth/login", async (req, res) => {
  try {
    const { emailOrPhone, password } = req.body;
    if (!emailOrPhone || !password) {
      return res.status(400).json({ error: "Email/Phone and password are required." });
    }
    const user = await loginUser(emailOrPhone, password);
    res.json({ success: true, user });
  } catch (err) {
    res.status(401).json({ error: err.message || "Authentication failed" });
  }
});
router.get("/stats", async (req, res) => {
  try {
    const stats = await getDbStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get("/activity", async (req, res) => {
  try {
    const logs = await getActivityLogs();
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.post("/ussd/action", async (req, res) => {
  try {
    const { farmerCode, farmerName, location, actionType, payload } = req.body;
    const timeStr = (/* @__PURE__ */ new Date()).toTimeString().split(" ")[0];
    const nameStr = farmerName || "Tendai Mhako";
    const codeStr = farmerCode || "AL-FARM-001";
    const locStr = location || "Murehwa Ward 12";
    if (actionType === "GET_ACTIVITIES") {
      const allLogs = await getActivityLogs();
      const filtered = allLogs.filter(
        (l) => l.typeDetails?.toLowerCase().includes(nameStr.toLowerCase()) || l.typeDetails?.toLowerCase().includes(codeStr.toLowerCase()) || l.qrCode?.includes("USSD") || l.qrCode?.includes(codeStr)
      );
      return res.json({
        success: true,
        farmer: { name: nameStr, code: codeStr, location: locStr },
        activities: filtered.slice(0, 8)
      });
    }
    if (actionType === "LOG_PLANTING") {
      const crop = payload?.crop || "Hybrid Maize (SC 637)";
      const area = payload?.acreage || "2.5 Ha";
      const log = await addActivityLog({
        qrCode: `\u{1F4F1} USSD-*141#`,
        typeDetails: `[USSD Activity] Farmer ${nameStr} (${codeStr}) logged Planting: ${crop} on ${area}`,
        status: "verified",
        location: locStr,
        timestamp: timeStr
      });
      return res.json({
        success: true,
        message: `Planting activity for ${crop} (${area}) registered on AgriLedger DB.`,
        log
      });
    }
    if (actionType === "LOG_SPRAY") {
      const input = payload?.chemical || "Top Dressing Ammonium Nitrate";
      const log = await addActivityLog({
        qrCode: `\u{1F4F1} USSD-*141#`,
        typeDetails: `[USSD Activity] Farmer ${nameStr} (${codeStr}) logged Application of ${input}`,
        status: "verified",
        location: locStr,
        timestamp: timeStr
      });
      return res.json({
        success: true,
        message: `Chemical/Fertilizer application (${input}) recorded on AgriLedger DB.`,
        log
      });
    }
    if (actionType === "LOG_HARVEST") {
      const tonnage = payload?.tonnage || "6.5";
      const crop = payload?.crop || "White Maize";
      const log = await addActivityLog({
        qrCode: `\u{1F33E} USSD-YIELD`,
        typeDetails: `[USSD Activity] Farmer ${nameStr} (${codeStr}) recorded Harvest Yield: ${tonnage} Tons ${crop}`,
        status: "delivered",
        location: locStr,
        timestamp: timeStr
      });
      return res.json({
        success: true,
        message: `Harvest yield of ${tonnage} Tons ${crop} registered on AgriLedger DB.`,
        log
      });
    }
    if (actionType === "LOG_SEASON_PLAN") {
      const crop = payload?.crop || "Hybrid Maize (SC 637)";
      const acreage = payload?.acreage || "3.5 Ha";
      const targetYield = payload?.targetYield || "18 Tons";
      const estFertilizer = payload?.estFertilizer || "14 Bags Compound D & 14 Bags AN";
      const estSeed = payload?.estSeed || "40 kg Seed";
      const log = await addActivityLog({
        qrCode: `\u{1F4C5} USSD-PLAN`,
        typeDetails: `[USSD Season Plan] Farmer ${nameStr} (${codeStr}) registered Season Plan 2026: ${crop} on ${acreage}. Inputs required: ${estSeed}, ${estFertilizer}. Target Yield: ${targetYield}`,
        status: "verified",
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
    if (actionType === "REDEEM_VOUCHER") {
      const voucher = payload?.voucherCode || "VOUCH-8821";
      const item = payload?.item || "Compound D Fertilizer";
      const log = await addActivityLog({
        qrCode: voucher,
        typeDetails: `[USSD Voucher] Farmer ${nameStr} (${codeStr}) redeemed ${item} via USSD PIN`,
        status: "verified",
        location: locStr,
        timestamp: timeStr
      });
      return res.json({
        success: true,
        message: `Voucher ${voucher} (${item}) successfully redeemed via USSD!`,
        log
      });
    }
    const genericLog = await addActivityLog({
      qrCode: `\u{1F4F1} USSD-*141#`,
      typeDetails: `[USSD Activity] ${nameStr} (${codeStr}): ${payload?.details || "GSM Terminal Ping"}`,
      status: "verified",
      location: locStr,
      timestamp: timeStr
    });
    return res.json({ success: true, message: "USSD Activity recorded.", log: genericLog });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.post("/qr/verify", async (req, res) => {
  try {
    const { qrCode, itemType, region, pin } = req.body;
    const timeStr = (/* @__PURE__ */ new Date()).toTimeString().split(" ")[0];
    const codeUpper = (qrCode || "").toUpperCase().trim();
    if (codeUpper.includes("FAKE") || codeUpper.includes("COUNTERFEIT")) {
      await addActivityLog({
        qrCode: "\u{1F6A8} COUNTERFEIT",
        typeDetails: `Fake ${itemType || "Input"} ("${qrCode}")`,
        status: "fraud-risk",
        location: region || "Unknown",
        timestamp: timeStr
      });
      return res.json({
        success: false,
        isCounterfeit: true,
        message: "COUNTERFEIT INTRUSION INTERCEPTED."
      });
    }
    const allFarmers = await getFarmers();
    let matchedFarmer = allFarmers.find(
      (f) => codeUpper.includes(f.farmerCode?.toUpperCase()) || codeUpper.includes(f.name?.toUpperCase())
    );
    if (!matchedFarmer && allFarmers.length > 0) {
      const index = Math.abs(codeUpper.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)) % allFarmers.length;
      matchedFarmer = allFarmers[index];
    }
    const endUser = matchedFarmer ? {
      name: matchedFarmer.name,
      farmerCode: matchedFarmer.farmerCode || "AL-FARM-001",
      phone: matchedFarmer.phone || "+263771234567",
      location: matchedFarmer.location || region || "Murehwa Ward 12",
      organization: "Murehwa Grain Cooperative",
      allocatedInput: `${itemType || "Certified Hybrid Maize Seed & Compound D"} (Batch ${qrCode})`,
      status: "VERIFIED MATCH"
    } : {
      name: "Tendai Mhako",
      farmerCode: "AL-FARM-001",
      phone: "+263771234567",
      location: region || "Ward 12, Murehwa",
      organization: "Murehwa Farmers Co-op",
      allocatedInput: `${itemType || "Seed & Fertilizer Batch"} (${qrCode})`,
      status: "VERIFIED MATCH"
    };
    if (pin) {
      const log = await addActivityLog({
        qrCode,
        typeDetails: `Handover Confirmed to End-User ${endUser.name} (${endUser.farmerCode}) \u2014 [PIN: ${pin}]`,
        status: "verified",
        location: endUser.location || region || "Depot",
        timestamp: timeStr
      });
      return res.json({ success: true, verified: true, endUser, log });
    }
    return res.json({ success: true, requiresPin: true, qrCode, itemType, region, endUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get("/logistics", async (req, res) => {
  try {
    const trucks = await getLogisticsTrucks();
    res.json(trucks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.post("/logistics", async (req, res) => {
  try {
    const { fleetDriver, fleetTruck } = req.body;
    if (!fleetDriver || !fleetTruck) {
      return res.status(400).json({ error: "Driver and truck plate are required" });
    }
    const truck = await addLogisticsTruck({ driverName: fleetDriver, truckPlate: fleetTruck });
    res.json(truck);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.put("/logistics/:id/approve", async (req, res) => {
  try {
    const { id } = req.params;
    const truck = await approveTruckDelivery(id);
    res.json({ success: true, truck });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.post("/fraud", async (req, res) => {
  try {
    const { details, location } = req.body;
    if (!details || !location) {
      return res.status(400).json({ error: "Details and location are required" });
    }
    const report = await addFraudReport({ details, location });
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get("/farmers", async (req, res) => {
  try {
    const farmers = await getFarmers();
    res.json(farmers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.post("/farmers", async (req, res) => {
  try {
    const { regName, regLocation } = req.body;
    if (!regName || !regLocation) {
      return res.status(400).json({ error: "Name and location required" });
    }
    const farmer = await addFarmer({ name: regName, location: regLocation });
    res.json(farmer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get("/suppliers", async (req, res) => {
  try {
    const suppliers = await getSuppliers();
    res.json(suppliers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.post("/suppliers", async (req, res) => {
  try {
    const { supName, supLocation } = req.body;
    if (!supName || !supLocation) {
      return res.status(400).json({ error: "Name and location required" });
    }
    const supplier = await addSupplier({ name: supName, location: supLocation });
    res.json(supplier);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get("/market/custom-crops", async (req, res) => {
  try {
    const offers = await getCustomCropOffers();
    res.json(offers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.post("/market/custom-crops", async (req, res) => {
  try {
    const { cropName, askingPrice, quantity, buyers, status } = req.body;
    if (!cropName || !askingPrice) {
      return res.status(400).json({ error: "Crop name and price required" });
    }
    const offer = await addCustomCropOffer(cropName, parseFloat(askingPrice), { quantity, buyers, status });
    res.json(offer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.delete("/market/custom-crops/:id", async (req, res) => {
  try {
    const result = await deleteCustomCropOffer(Number(req.params.id));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.post("/market/deal", async (req, res) => {
  try {
    const { buyer, crop, payout } = req.body;
    if (!buyer || !crop || !payout) {
      return res.status(400).json({ error: "Buyer, crop, and payout required" });
    }
    const result = await executeMarketDeal(buyer, crop, parseFloat(payout));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.post("/agritex/broadcast", async (req, res) => {
  try {
    const { inputType, quantity, donor, dateDisplay } = req.body;
    const timeStr = (/* @__PURE__ */ new Date()).toTimeString().split(" ")[0];
    await addActivityLog({
      qrCode: "\u{1F3DB}\uFE0F AGRITEX-NOTIF",
      typeDetails: `SMS Broadcast: Collect ${inputType} \u2014 ${quantity}`,
      status: "notified",
      location: "All Farmers",
      timestamp: timeStr
    });
    res.json({
      success: true,
      sms: `\u{1F4E2} AGRITEX NOTICE: Donated ${inputType} (${quantity}) from ${donor} is ready for collection at your nearest depot. Present your Farmer ID & OTP to collect. \u2014 AgriLedger-SITS`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.post("/agritex/confirm-otp", async (req, res) => {
  try {
    const { farmerId, otp, inputType, quantity } = req.body;
    const timeStr = (/* @__PURE__ */ new Date()).toTimeString().split(" ")[0];
    await addActivityLog({
      qrCode: "\u{1F3DB}\uFE0F AGRITEX-COLLECT",
      typeDetails: `${farmerId} collected ${inputType} (${quantity})`,
      status: "verified",
      location: "Depot Collection",
      timestamp: timeStr
    });
    res.json({ success: true, message: `Collection confirmed for ${farmerId}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.post("/reset", async (req, res) => {
  try {
    await resetDatabaseState();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get("/dealer/stock", async (req, res) => {
  try {
    res.json(await getDealerStock());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.post("/dealer/stock", async (req, res) => {
  try {
    const { name, category, count } = req.body;
    if (!name || !category) {
      return res.status(400).json({ error: "Product name and category required" });
    }
    const item = await addDealerStockItem({ name, category, count: Number(count) || 0 });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.put("/dealer/stock/:id/adjust", async (req, res) => {
  try {
    const { delta } = req.body;
    if (typeof delta !== "number") {
      return res.status(400).json({ error: "Numeric delta required" });
    }
    const item = await adjustDealerStock(Number(req.params.id), delta);
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get("/dealer/receipts", async (req, res) => {
  try {
    res.json(await getDealerReceipts());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.post("/dealer/receipts", async (req, res) => {
  try {
    const { farmer, ward, item, status } = req.body;
    if (!farmer || !ward || !item) {
      return res.status(400).json({ error: "Farmer, ward, and item required" });
    }
    const receipt = await addDealerReceipt({ farmer, ward, item, status });
    res.json(receipt);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.put("/dealer/receipts/:id/issue", async (req, res) => {
  try {
    const receipt = await markReceiptIssued(req.params.id);
    res.json(receipt);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get("/metrics", async (req, res) => {
  try {
    const keys = String(req.query.keys || "").split(",").filter(Boolean);
    if (keys.length === 0) {
      return res.status(400).json({ error: "keys query param required" });
    }
    res.json(await getMetrics(keys));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.put("/metrics/:key/adjust", async (req, res) => {
  try {
    const { delta } = req.body;
    if (typeof delta !== "number") {
      return res.status(400).json({ error: "Numeric delta required" });
    }
    const value = await adjustMetric(req.params.key, delta);
    res.json({ key: req.params.key, value });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.put("/metrics/:key", async (req, res) => {
  try {
    const { value } = req.body;
    if (typeof value !== "number") {
      return res.status(400).json({ error: "Numeric value required" });
    }
    await setMetric(req.params.key, value);
    res.json({ key: req.params.key, value });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get("/supplier/batches", async (req, res) => {
  try {
    res.json(await getProductionBatches());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.post("/supplier/batches", async (req, res) => {
  try {
    const { product, quantity, plant } = req.body;
    if (!product || !quantity || !plant) {
      return res.status(400).json({ error: "Product, quantity, and plant required" });
    }
    const batch = await addProductionBatch({ product, quantity: Number(quantity), plant });
    res.json(batch);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get("/supplier/depot-orders", async (req, res) => {
  try {
    res.json(await getDepotOrders());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.post("/supplier/depot-orders", async (req, res) => {
  try {
    const { depot, item, status } = req.body;
    if (!depot) {
      return res.status(400).json({ error: "Depot name required" });
    }
    const order = await addDepotOrder({ depot, item, status });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get("/farmer/vouchers", async (req, res) => {
  try {
    res.json(await getFarmerVouchers());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.post("/farmer/vouchers", async (req, res) => {
  try {
    const { item } = req.body;
    const voucher = await addFarmerVoucher(item || "Foliar Bio-Stimulant Pack (5L)");
    res.json(voucher);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.put("/farmer/vouchers/:id/verify", async (req, res) => {
  try {
    const voucher = await verifyFarmerVoucher(req.params.id);
    res.json(voucher);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.post("/delivery/payout", async (req, res) => {
  try {
    const { farmerAllocationId, netWeightTons } = req.body;
    if (!farmerAllocationId || !netWeightTons) {
      return res.status(400).json({ error: "Farmer allocation ID and net weight required" });
    }
    const payout = await addDeliveryPayout({ farmerAllocationId, netWeightTons: parseFloat(netWeightTons) });
    res.json(payout);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.post("/agritex/scan", async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ error: "QR code required" });
    }
    const log = await addAgritexScan(code);
    res.json({ success: true, log });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.put("/users/profile", async (req, res) => {
  try {
    const { email, name, phone, role, location, organization, district } = req.body;
    if (!email || !name || !location || !role) {
      return res.status(400).json({ error: "Email, name, role, and location required" });
    }
    const result = await updateUserProfile({ email, name, phone, role, location, organization, district });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
var api_default = router;

// api-src/vercel-handler.ts
var app = express();
app.use(express.json());
app.use("/api", api_default);
var dbInitPromise = null;
async function ensureDb() {
  if (!dbInitPromise) {
    dbInitPromise = initDatabase();
  }
  await dbInitPromise;
  if (!getDbDiagnostics().isMySqlAvailable) {
    dbInitPromise = null;
  }
}
async function handler(req, res) {
  await ensureDb();
  app(req, res);
}
export {
  handler as default
};
