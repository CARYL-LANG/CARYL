/*
# PRING KUYA'S INN - Hotel Booking System Schema

This migration creates the complete database schema for a hotel booking management system.

## Tables Created:

1. **rooms** - Hotel room inventory
   - id (uuid, primary key)
   - room_number (text, unique) - Room identifier (e.g., "101", "201")
   - type (text) - Room type: 'single', 'double', 'suite'
   - price_per_night (numeric) - Nightly rate
   - capacity (integer) - Maximum guests
   - amenities (text array) - List of amenities
   - status (text) - 'available', 'reserved', 'occupied', 'maintenance'
   - image_url (text, optional) - Room image URL
   - created_at, updated_at (timestamps)

2. **services** - Add-on services (pool, videoke, cottages, catering)
   - id (uuid, primary key)
   - name (text) - Service name
   - category (text) - 'swimming-pool', 'videoke', 'cottages', 'foods'
   - description (text)
   - price (numeric)
   - capacity (integer, optional)
   - available (boolean) - Is service currently offered
   - created_at, updated_at (timestamps)

3. **bookings** - Room reservation records
   - id (uuid, primary key)
   - guest_name, guest_email, guest_phone (text) - Guest contact info
   - room_id (uuid, foreign key to rooms)
   - room_number (text) - Denormalized for quick display
   - check_in_date, check_out_date (date)
   - status (text) - 'pending', 'confirmed', 'checked-in', 'checked-out', 'cancelled'
   - total_price (numeric)
   - number_of_guests (integer)
   - payment_method (text, optional) - 'counter', 'gcash', 'maya'
   - payment_reference (text, optional)
   - payment_status (text, optional)
   - created_at, updated_at (timestamps)

4. **event_bookings** - Event reservations (weddings, birthdays, etc.)
   - id (uuid, primary key)
   - guest_name, guest_email, guest_phone (text)
   - event_type (text) - 'birthday', 'wedding', 'normal'
   - event_name (text, optional)
   - event_date, event_end_date (date)
   - status (text) - 'pending', 'confirmed', 'completed', 'cancelled'
   - base_price, total_price (numeric)
   - number_of_guests (integer)
   - service_ids (text array) - Selected add-on services
   - selected_rooms (text array) - Event venues
   - payment info (same as bookings)
   - created_at, updated_at (timestamps)

5. **staff_accounts** - Hotel staff records
   - id (uuid, primary key)
   - first_name, last_name, email, phone (text)
   - position (text) - Job title
   - status (text) - 'active', 'inactive'
   - join_date (date)
   - password_hash (text) - For demo purposes (in production use auth.users)
   - created_at, updated_at (timestamps)

6. **customers** - Customer account records
   - id (uuid, primary key)
   - first_name, last_name, email, phone (text)
   - password_hash (text) - For demo purposes
   - created_at, updated_at (timestamps)

7. **payment_config** - Global payment settings (single row)
   - id (uuid, primary key)
   - gcash_number, maya_number (text, optional) - Payment wallet numbers
   - updated_at (timestamp)

8. **event_type_prices** - Base pricing for events
   - id (uuid, primary key)
   - event_type (text) - 'birthday', 'wedding', 'normal'
   - price (numeric)
   - updated_at (timestamp)

9. **app_settings** - Global app settings (admin password, etc.)
   - id (uuid, primary key)
   - admin_password (text)
   - updated_at (timestamp)

## Security (RLS):
- All tables have RLS enabled
- Since this is a shared hotel management system (not multi-user isolation),
  policies allow anon + authenticated access for all CRUD operations
- Data is intentionally shared across all users of the system
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- ROOMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_number text UNIQUE NOT NULL,
  type text NOT NULL CHECK (type IN ('single', 'double', 'suite')),
  price_per_night numeric NOT NULL DEFAULT 0,
  capacity integer NOT NULL DEFAULT 1,
  amenities text[] DEFAULT '{}',
  status text NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'occupied', 'maintenance')),
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_rooms" ON rooms;
CREATE POLICY "anon_select_rooms" ON rooms FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_rooms" ON rooms;
CREATE POLICY "anon_insert_rooms" ON rooms FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_rooms" ON rooms;
CREATE POLICY "anon_update_rooms" ON rooms FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_rooms" ON rooms;
CREATE POLICY "anon_delete_rooms" ON rooms FOR DELETE TO anon, authenticated USING (true);

-- ============================================
-- SERVICES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL CHECK (category IN ('swimming-pool', 'videoke', 'cottages', 'foods')),
  description text,
  price numeric NOT NULL DEFAULT 0,
  capacity integer,
  available boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_services" ON services;
CREATE POLICY "anon_select_services" ON services FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_services" ON services;
CREATE POLICY "anon_insert_services" ON services FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_services" ON services;
CREATE POLICY "anon_update_services" ON services FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_services" ON services;
CREATE POLICY "anon_delete_services" ON services FOR DELETE TO anon, authenticated USING (true);

-- ============================================
-- BOOKINGS TABLE (Room Reservations)
-- ============================================
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_name text NOT NULL,
  guest_email text NOT NULL,
  guest_phone text NOT NULL,
  booking_type text NOT NULL DEFAULT 'room' CHECK (booking_type IN ('room', 'event')),
  room_id uuid REFERENCES rooms(id) ON DELETE SET NULL,
  room_number text,
  check_in_date date NOT NULL,
  check_out_date date NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'checked-in', 'checked-out', 'cancelled')),
  total_price numeric NOT NULL DEFAULT 0,
  number_of_guests integer NOT NULL DEFAULT 1,
  payment_method text CHECK (payment_method IN ('counter', 'gcash', 'maya')),
  payment_reference text,
  payment_status text CHECK (payment_status IN ('pending', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_bookings" ON bookings;
CREATE POLICY "anon_select_bookings" ON bookings FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_bookings" ON bookings;
CREATE POLICY "anon_insert_bookings" ON bookings FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_bookings" ON bookings;
CREATE POLICY "anon_update_bookings" ON bookings FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_bookings" ON bookings;
CREATE POLICY "anon_delete_bookings" ON bookings FOR DELETE TO anon, authenticated USING (true);

-- ============================================
-- EVENT_BOOKINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS event_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_name text NOT NULL,
  guest_email text NOT NULL,
  guest_phone text NOT NULL,
  event_type text NOT NULL CHECK (event_type IN ('birthday', 'wedding', 'normal')),
  event_name text,
  event_date date NOT NULL,
  event_end_date date NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  base_price numeric NOT NULL DEFAULT 0,
  total_price numeric NOT NULL DEFAULT 0,
  number_of_guests integer NOT NULL DEFAULT 1,
  service_ids text[] DEFAULT '{}',
  selected_rooms text[] DEFAULT '{}',
  payment_method text CHECK (payment_method IN ('counter', 'gcash', 'maya')),
  payment_reference text,
  payment_status text CHECK (payment_status IN ('pending', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE event_bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_event_bookings" ON event_bookings;
CREATE POLICY "anon_select_event_bookings" ON event_bookings FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_event_bookings" ON event_bookings;
CREATE POLICY "anon_insert_event_bookings" ON event_bookings FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_event_bookings" ON event_bookings;
CREATE POLICY "anon_update_event_bookings" ON event_bookings FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_event_bookings" ON event_bookings;
CREATE POLICY "anon_delete_event_bookings" ON event_bookings FOR DELETE TO anon, authenticated USING (true);

-- ============================================
-- STAFF_ACCOUNTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS staff_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text NOT NULL,
  position text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  join_date date NOT NULL,
  password_hash text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE staff_accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_staff_accounts" ON staff_accounts;
CREATE POLICY "anon_select_staff_accounts" ON staff_accounts FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_staff_accounts" ON staff_accounts;
CREATE POLICY "anon_insert_staff_accounts" ON staff_accounts FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_staff_accounts" ON staff_accounts;
CREATE POLICY "anon_update_staff_accounts" ON staff_accounts FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_staff_accounts" ON staff_accounts;
CREATE POLICY "anon_delete_staff_accounts" ON staff_accounts FOR DELETE TO anon, authenticated USING (true);

-- ============================================
-- CUSTOMERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  password_hash text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_customers" ON customers;
CREATE POLICY "anon_select_customers" ON customers FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_customers" ON customers;
CREATE POLICY "anon_insert_customers" ON customers FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_customers" ON customers;
CREATE POLICY "anon_update_customers" ON customers FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_customers" ON customers;
CREATE POLICY "anon_delete_customers" ON customers FOR DELETE TO anon, authenticated USING (true);

-- ============================================
-- EVENT_TYPE_PRICES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS event_type_prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text UNIQUE NOT NULL CHECK (event_type IN ('birthday', 'wedding', 'normal')),
  price numeric NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE event_type_prices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_event_type_prices" ON event_type_prices;
CREATE POLICY "anon_select_event_type_prices" ON event_type_prices FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_event_type_prices" ON event_type_prices;
CREATE POLICY "anon_insert_event_type_prices" ON event_type_prices FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_event_type_prices" ON event_type_prices;
CREATE POLICY "anon_update_event_type_prices" ON event_type_prices FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- ============================================
-- PAYMENT_CONFIG TABLE (Single row for app settings)
-- ============================================
CREATE TABLE IF NOT EXISTS payment_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gcash_number text,
  maya_number text,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE payment_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_payment_config" ON payment_config;
CREATE POLICY "anon_select_payment_config" ON payment_config FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_payment_config" ON payment_config;
CREATE POLICY "anon_insert_payment_config" ON payment_config FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_payment_config" ON payment_config;
CREATE POLICY "anon_update_payment_config" ON payment_config FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- ============================================
-- APP_SETTINGS TABLE (Admin password, etc.)
-- ============================================
CREATE TABLE IF NOT EXISTS app_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_password text NOT NULL DEFAULT 'admin123',
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_app_settings" ON app_settings;
CREATE POLICY "anon_select_app_settings" ON app_settings FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_app_settings" ON app_settings;
CREATE POLICY "anon_insert_app_settings" ON app_settings FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_app_settings" ON app_settings;
CREATE POLICY "anon_update_app_settings" ON app_settings FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- ============================================
-- INSERT DEFAULT DATA
-- ============================================

-- Insert default event type prices
INSERT INTO event_type_prices (event_type, price) VALUES
  ('birthday', 5000),
  ('wedding', 15000),
  ('normal', 3000)
ON CONFLICT (event_type) DO NOTHING;

-- Insert default rooms
INSERT INTO rooms (room_number, type, price_per_night, capacity, amenities, status, image_url) VALUES
  ('101', 'single', 1500, 2, ARRAY['WiFi', 'AC', 'TV'], 'available', 'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg'),
  ('102', 'double', 2500, 4, ARRAY['WiFi', 'AC', 'TV', 'Mini Bar'], 'available', 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg'),
  ('201', 'suite', 5000, 6, ARRAY['WiFi', 'AC', 'TV', 'Mini Bar', 'Jacuzzi'], 'available', 'https://images.pexels.com/photos/210244/pexels-photo-210244.jpeg'),
  ('202', 'single', 1500, 2, ARRAY['WiFi', 'AC', 'TV'], 'available', 'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg'),
  ('301', 'double', 2500, 4, ARRAY['WiFi', 'AC', 'TV', 'Mini Bar'], 'available', 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg')
ON CONFLICT (room_number) DO NOTHING;

-- Insert default services
INSERT INTO services (name, category, description, price, capacity, available) VALUES
  ('Swimming Pool', 'swimming-pool', 'Access to swimming pool', 200, 10, true),
  ('Videoke Room', 'videoke', 'Private videoke room', 500, 15, true),
  ('Cottage', 'cottages', 'Private cottage', 1000, 8, true),
  ('Catering Service', 'foods', 'Full catering service', 300, 50, true)
ON CONFLICT DO NOTHING;

-- Insert default payment config
INSERT INTO payment_config (gcash_number, maya_number) VALUES ('', '')
ON CONFLICT DO NOTHING;

-- Insert default app settings
INSERT INTO app_settings (admin_password) VALUES ('admin123')
ON CONFLICT DO NOTHING;

-- ============================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_bookings_room_id ON bookings(room_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_guest_email ON bookings(guest_email);
CREATE INDEX IF NOT EXISTS idx_bookings_check_in_date ON bookings(check_in_date);

CREATE INDEX IF NOT EXISTS idx_event_bookings_guest_email ON event_bookings(guest_email);
CREATE INDEX IF NOT EXISTS idx_event_bookings_status ON event_bookings(status);
CREATE INDEX IF NOT EXISTS idx_event_bookings_event_date ON event_bookings(event_date);

CREATE INDEX IF NOT EXISTS idx_rooms_status ON rooms(status);
CREATE INDEX IF NOT EXISTS idx_rooms_type ON rooms(type);

CREATE INDEX IF NOT EXISTS idx_staff_accounts_email ON staff_accounts(email);
CREATE INDEX IF NOT EXISTS idx_staff_accounts_status ON staff_accounts(status);

CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);

-- ============================================
-- CREATE UPDATE TRIGGERS
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to all tables with updated_at
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_rooms_updated_at') THEN
    CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON rooms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_services_updated_at') THEN
    CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_bookings_updated_at') THEN
    CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_event_bookings_updated_at') THEN
    CREATE TRIGGER update_event_bookings_updated_at BEFORE UPDATE ON event_bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_staff_accounts_updated_at') THEN
    CREATE TRIGGER update_staff_accounts_updated_at BEFORE UPDATE ON staff_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_customers_updated_at') THEN
    CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;
