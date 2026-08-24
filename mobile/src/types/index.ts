export type UserRole = 'LANDLORD' | 'TENANT' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatarUrl?: string;
}

export interface Property {
  id: string;
  name: string;
  address: string;
  city: string;
  description: string;
  imageUrl?: string;
  totalUnits: number;
  availableUnits: number;
  minPrice: number;
  maxPrice: number;
  facilities: string[];
  rating?: number;
}

export interface RoomUnit {
  id: string;
  propertyId: string;
  unitNumber: string;
  roomNumber?: string;
  roomType: string;
  type?: string;
  floor?: number;
  pricePerMonth: number;
  price?: number;
  isAvailable: boolean;
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';
  tenantName?: string;
  facilities?: string[];
  images?: string[];
}

export interface TenantBooking {
  id: string;
  tenantId: string;
  propertyId: string;
  propertyName: string;
  unitNumber: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  status: 'PENDING' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  dueDate: string;
}

export interface PaymentInvoice {
  id: string;
  bookingId: string;
  amount: number;
  dueDate: string;
  period: string; // e.g. "Agustus 2026"
  status: 'PAID' | 'UNPAID' | 'PENDING' | 'OVERDUE';
  paymentUrl?: string;
  paymentDate?: string;
}

export interface MaintenanceTicket {
  id: string;
  unitNumber: string;
  title: string;
  description: string;
  category: 'PLUMBING' | 'ELECTRICAL' | 'FURNITURE' | 'INTERNET' | 'OTHER';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  createdAt: string;
  imageUrl?: string;
}
