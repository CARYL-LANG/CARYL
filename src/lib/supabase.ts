import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper types for database tables
export interface DatabaseRoom {
  id: string;
  room_number: string;
  type: 'single' | 'double' | 'suite';
  price_per_night: number;
  capacity: number;
  amenities: string[];
  status: 'available' | 'reserved' | 'occupied' | 'maintenance';
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface DatabaseService {
  id: string;
  name: string;
  category: 'swimming-pool' | 'videoke' | 'cottages' | 'foods' | 'function-hall';
  description: string;
  price: number;
  capacity: number | null;
  available: boolean;
  image_url: string | null;
  status: 'available' | 'maintenance' | 'unavailable';
  duration_hours: number | null;
  operating_hours: string | null;
  created_at: string;
  updated_at: string;
}

export interface DatabaseCottage {
  id: string;
  cottage_number: string;
  name: string;
  description: string | null;
  price_per_night: number;
  capacity: number;
  status: 'available' | 'reserved' | 'occupied' | 'maintenance' | 'unavailable';
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface DatabaseBooking {
  id: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  booking_type: 'room' | 'event' | 'cottage';
  room_id: string | null;
  room_number: string | null;
  cottage_id: string | null;
  cottage_number: string | null;
  check_in_date: string;
  check_out_date: string;
  status: 'pending' | 'confirmed' | 'checked-in' | 'checked-out' | 'cancelled';
  total_price: number;
  number_of_guests: number;
  payment_method: 'counter' | 'gcash' | 'maya' | null;
  payment_reference: string | null;
  payment_status: 'pending' | 'completed' | 'cancelled' | null;
  transaction_screenshot: string | null;
  checked_in_at: string | null;
  checked_out_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface DatabaseEventBooking {
  id: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  event_type: string;
  event_name: string | null;
  event_date: string;
  event_end_date: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  base_price: number;
  total_price: number;
  number_of_guests: number;
  service_ids: string[];
  selected_rooms: string[];
  payment_method: 'counter' | 'gcash' | 'maya' | null;
  payment_reference: string | null;
  payment_status: 'pending' | 'completed' | 'cancelled' | null;
  transaction_screenshot: string | null;
  created_at: string;
  updated_at: string;
}

export interface DatabaseStaffAccount {
  id: string;
  first_name: string;
  middle_initial?: string;
  last_name: string;
  email: string;
  phone: string;
  position: string;
  status: 'active' | 'inactive';
  join_date: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseCustomer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  password_hash: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseEventTypePrice {
  id: string;
  event_type: string;
  price: number;
  name: string | null;
  description: string | null;
  capacity: number | null;
  updated_at: string;
}

export interface DatabasePaymentConfig {
  id: string;
  gcash_number: string | null;
  maya_number: string | null;
  updated_at: string;
}

export interface DatabaseAppSettings {
  id: string;
  admin_password: string;
  admin_name: string | null;
  owner_name: string | null;
  fb_link: string | null;
  business_permit_url: string | null;
  contact_number: string | null;
  location: string | null;
  check_in_time: string | null;
  check_out_time: string | null;
  cancellation_policy: string | null;
  pool_operating_hours: string | null;
  function_hall_image_url: string | null;
  updated_at: string;
}

export interface DatabaseFacilityBooking {
  id: string;
  facility_type: 'swimming-pool' | 'videoke';
  facility_id: string | null;
  guest_name: string;
  guest_email: string;
  guest_phone: string | null;
  booking_date: string;
  start_time: string | null;
  end_time: string | null;
  number_of_guests: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  total_price: number;
  payment_method: string | null;
  payment_reference: string | null;
  payment_status: string | null;
  transaction_screenshot: string | null;
  created_at: string;
  updated_at: string;
}

export interface DatabaseFoodMenuItem {
  id: string;
  name: string;
  category: 'meal' | 'snack' | 'beverage' | 'dessert' | 'package';
  description: string | null;
  price: number;
  available: boolean;
  package_items: string | null;
  image_url: string | null;
  status: 'available' | 'maintenance' | 'unavailable';
  created_at: string;
  updated_at: string;
}

export interface DatabaseFoodOrder {
  id: string;
  booking_id: string | null;
  event_booking_id: string | null;
  customer_name: string;
  status: 'pending' | 'preparing' | 'served' | 'cancelled';
  total_price: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface DatabaseFoodOrderItem {
  id: string;
  food_order_id: string;
  menu_item_id: string | null;
  menu_item_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  created_at: string;
}

export interface DatabaseActivityLog {
  id: string;
  user_id: string | null;
  user_name: string | null;
  user_role: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  details: string | null;
  created_at: string;
}

export interface DatabaseMaintenanceReport {
  id: string;
  item_type: 'room' | 'facility';
  item_id: string | null;
  item_name: string;
  reported_by: string | null;
  reporter_name: string | null;
  issue_description: string;
  status: 'reported' | 'in-progress' | 'resolved';
  created_at: string;
  updated_at: string;
}
