export type UserRole = 'farmer' | 'dealer' | 'supplier' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  location: string;
  district?: string;
  province?: string;
  avatarInitials: string;
  nationalId?: string;
  organization?: string;
  memberSince?: string;
}

export interface Farmer {
  id: number;
  farmerCode: string;
  name: string;
  location: string;
  province?: string;
  phone?: string;
  createdAt?: string;
}

export interface Supplier {
  id: number;
  supplierCode: string;
  name: string;
  location: string;
  productTypes?: string;
  createdAt?: string;
}

export interface ActivityLog {
  id: number;
  qrCode: string;
  typeDetails: string;
  status: 'verified' | 'in-transit' | 'fraud-risk' | 'delivered' | 'notified';
  location: string;
  timestamp: string;
  userRole?: string;
}

export interface LogisticsTruck {
  id: string;
  truckPlate: string;
  driverName: string;
  fromLoc: string;
  toLoc: string;
  eta: string;
  status: 'On Route' | 'Delayed' | 'Received by Supplier' | 'In Transit';
  updatedAt?: string;
}

export interface FraudReport {
  id: number;
  reportCode: string;
  details: string;
  location: string;
  status: string;
  timestamp: string;
}

export interface CustomCropOffer {
  id: number;
  cropName: string;
  askingPrice: number;
  status: string;
  quantity?: string;
  buyers?: string;
  createdAt?: string;
}

export interface AgritexBatch {
  id?: number;
  inputType: string;
  quantity: string;
  donor: string;
  receivedDate: string;
  qrScannedCount: number;
  status: string;
}

export interface DashboardStats {
  farmersCount: number;
  suppliersCount: number;
  profitRate: number;
  incomeValue: number;
  baseInputCosts: number;
  activeAlerts: number;
  deliveryRate: number;
  totalTrucks: number;
  approvedTrucks: number;
}
