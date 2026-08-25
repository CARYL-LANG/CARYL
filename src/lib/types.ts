// User and Role Types
export type UserRole = 'admin' | 'staff' | 'customer';

export interface User {
  id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  role: UserRole;
  status?: 'active' | 'inactive';
}

// Staff Account Type
export interface StaffAccount {
  id: string;
  firstName: string;
  middleInitial?: string;
  lastName: string;
  email: string;
  position: string;
  phone: string;
  status: 'active' | 'inactive';
  joinDate: string;
  password?: string;
}

// Room Types
export interface Room {
  id: string;
  roomNumber: string;
  type: 'single' | 'double' | 'suite';
  pricePerNight: number;
  capacity: number;
  amenities: string[];
  status: 'available' | 'reserved' | 'occupied' | 'maintenance';
  image?: string;
}

// Cottage Types
export interface Cottage {
  id: string;
  cottageNumber: string;
  name: string;
  description?: string;
  pricePerNight: number;
  capacity: number;
  status: 'available' | 'reserved' | 'occupied' | 'maintenance' | 'unavailable';
  image?: string;
}

// Reservation/Booking Types
export interface Booking {
  id: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  bookingType: 'room' | 'event' | 'cottage';
  roomId?: string | null;
  roomNumber?: string | null;
  cottageId?: string | null;
  cottageNumber?: string | null;
  checkInDate: string;
  checkOutDate: string;
  status: 'pending' | 'confirmed' | 'checked-in' | 'checked-out' | 'cancelled' | 'rejected';
  totalPrice: number;
  numberOfGuests: number;
  createdAt: string;
  paymentMethod?: PaymentMethod;
  paymentReference?: string;
  transactionScreenshot?: string; // Base64 encoded screenshot for GCASH/MAYA
  paymentStatus?: 'pending' | 'completed' | 'cancelled';
  checkInTime?: string;
  checkOutTime?: string;
  createdBy?: 'staff' | 'customer' | null;
  assignedStaffId?: string | null;
}
export interface EventBooking {
  id: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  eventType: string;
  eventName?: string;
  eventDate: string;
  eventEndDate: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  basePrice: number; // Base price for the event
  totalPrice: number;
  numberOfGuests: number;
  serviceIds: string[];
  selectedRooms: string[]; // For event rooms like ballroom, banquet hall, etc
  createdAt: string;
  paymentMethod?: PaymentMethod;
  paymentReference?: string;
  transactionScreenshot?: string; // Base64 encoded screenshot for GCASH/MAYA
  paymentStatus?: 'pending' | 'completed' | 'cancelled';
}

// Service Types (add-ons)
export interface Service {
  id: string;
  name: string;
  category: 'swimming-pool' | 'videoke' | 'cottages' | 'foods' | 'function-hall';
  description: string;
  price: number;
  capacity?: number;
  available: boolean;
  status?: 'available' | 'maintenance' | 'unavailable';
  image?: string;
  durationHours?: number;
  operatingHours?: string;
}

// Facility Booking Types (swimming pool, videoke)
export interface FacilityBooking {
  id: string;
  facilityType: 'swimming-pool' | 'videoke';
  facilityId?: string;
  facilityName?: string;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  bookingDate: string;
  startTime?: string;
  endTime?: string;
  numberOfGuests: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  totalPrice: number;
  paymentMethod?: PaymentMethod;
  paymentReference?: string;
  paymentStatus?: 'pending' | 'completed' | 'cancelled';
  transactionScreenshot?: string;
  createdAt: string;
}

// Food Menu Item Types
export interface FoodMenuItem {
  id: string;
  name: string;
  category: 'meal' | 'snack' | 'beverage' | 'dessert' | 'package';
  description: string;
  price: number;
  available: boolean;
  packageItems?: string[];
  status?: 'available' | 'maintenance' | 'unavailable';
  image?: string;
}

// Food Order Types
export interface FoodOrderItem {
  id: string;
  foodOrderId: string;
  menuItemId?: string;
  menuItemName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface FoodOrder {
  id: string;
  bookingId?: string;
  eventBookingId?: string;
  customerName: string;
  status: 'pending' | 'preparing' | 'served' | 'cancelled';
  totalPrice: number;
  notes?: string;
  items: FoodOrderItem[];
  createdAt: string;
}

// Activity Log Types
export interface ActivityLog {
  id: string;
  userId?: string;
  userName?: string;
  userRole?: 'admin' | 'staff' | 'customer';
  action: string;
  entityType?: string;
  entityId?: string;
  details?: string;
  createdAt: string;
}

// Maintenance Report Types
export interface MaintenanceReport {
  id: string;
  itemType: 'room' | 'facility';
  itemId?: string;
  itemName: string;
  reportedBy?: string;
  reporterName?: string;
  issueDescription: string;
  status: 'reported' | 'in-progress' | 'resolved';
  createdAt: string;
  updatedAt: string;
}

// Payment Types
export type PaymentMethod = 'counter' | 'gcash' | 'maya';

export interface Payment {
  id: string;
  bookingId: string;
  method: PaymentMethod;
  amount: number;
  reference?: string; // For GCASH/MAYA reference number
  transactionScreenshot?: string; // Base64 encoded screenshot for GCASH/MAYA
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface PaymentConfig {
  gcashNumber?: string;
  mayaNumber?: string;
  lastUpdated?: string;
}

export interface BusinessInfo {
  adminName?: string;
  ownerName?: string;
  fbLink?: string;
  businessPermitUrl?: string;
  contactNumber?: string;
  location?: string;
  checkInTime?: string;
  checkOutTime?: string;
  cancellationPolicy?: string;
  poolOperatingHours?: string;
  functionHallImage?: string;
}

// Dashboard Metrics
export interface DashboardMetrics {
  todaysBookings: number;
  availableRooms: number;
  checkedInGuests: number;
  pendingPayments: number;
  monthlyRevenue: number;
  occupancyRate: number;
}

// Chart Data Types
export interface MonthlyRevenueData {
  month: string;
  revenue: number;
}

export interface OccupancyData {
  name: string;
  value: number;
  color: string;
}
