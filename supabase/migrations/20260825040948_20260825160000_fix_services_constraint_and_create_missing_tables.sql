/*
# Fix services category constraint and create missing tables

1. Modified Tables
   - `services`: Drop the old category CHECK constraint that excluded 'function-hall',
     replace with one that includes it.

2. New Tables
   - `facility_bookings`: Bookings for facilities (pool, videoke, etc.)
   - `food_menu_items`: Food menu items (meals, snacks, beverages, desserts, packages)
   - `food_orders`: Food orders placed by customers
   - `food_order_items`: Individual items within a food order
   - `activity_logs`: Audit log of user actions
   - `maintenance_reports`: Maintenance issue reports

3. Security
   - RLS enabled on all new tables.
   - Anon + authenticated CRUD policies on all new tables (single-tenant app pattern).
*/

-- Fix services category constraint to include 'function-hall'
ALTER TABLE services DROP CONSTRAINT IF EXISTS services_category_check;
ALTER TABLE services DROP CONSTRAINT IF EXISTS services_category_check1;
ALTER TABLE services ADD CONSTRAINT services_category_check
  CHECK (category = ANY (ARRAY['swimming-pool'::text, 'videoke'::text, 'cottages'::text, 'foods'::text, 'function-hall'::text]));

-- Create facility_bookings table
CREATE TABLE IF NOT EXISTS facility_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_type text NOT NULL,
  facility_id text,
  guest_name text NOT NULL,
  guest_email text NOT NULL,
  guest_phone text,
  booking_date date NOT NULL,
  start_time text,
  end_time text,
  number_of_guests integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'pending',
  total_price numeric NOT NULL DEFAULT 0,
  payment_method text,
  payment_reference text,
  payment_status text,
  transaction_screenshot text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE facility_bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_facility_bookings" ON facility_bookings;
CREATE POLICY "anon_select_facility_bookings" ON facility_bookings FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_facility_bookings" ON facility_bookings;
CREATE POLICY "anon_insert_facility_bookings" ON facility_bookings FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_facility_bookings" ON facility_bookings;
CREATE POLICY "anon_update_facility_bookings" ON facility_bookings FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_facility_bookings" ON facility_bookings;
CREATE POLICY "anon_delete_facility_bookings" ON facility_bookings FOR DELETE
  TO anon, authenticated USING (true);

-- Create food_menu_items table
CREATE TABLE IF NOT EXISTS food_menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL DEFAULT 'meal',
  description text,
  price numeric NOT NULL DEFAULT 0,
  available boolean NOT NULL DEFAULT true,
  status text NOT NULL DEFAULT 'available',
  package_items text,
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE food_menu_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_food_menu_items" ON food_menu_items;
CREATE POLICY "anon_select_food_menu_items" ON food_menu_items FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_food_menu_items" ON food_menu_items;
CREATE POLICY "anon_insert_food_menu_items" ON food_menu_items FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_food_menu_items" ON food_menu_items;
CREATE POLICY "anon_update_food_menu_items" ON food_menu_items FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_food_menu_items" ON food_menu_items;
CREATE POLICY "anon_delete_food_menu_items" ON food_menu_items FOR DELETE
  TO anon, authenticated USING (true);

-- Create food_orders table
CREATE TABLE IF NOT EXISTS food_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid,
  event_booking_id uuid,
  customer_name text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  total_price numeric NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE food_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_food_orders" ON food_orders;
CREATE POLICY "anon_select_food_orders" ON food_orders FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_food_orders" ON food_orders;
CREATE POLICY "anon_insert_food_orders" ON food_orders FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_food_orders" ON food_orders;
CREATE POLICY "anon_update_food_orders" ON food_orders FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_food_orders" ON food_orders;
CREATE POLICY "anon_delete_food_orders" ON food_orders FOR DELETE
  TO anon, authenticated USING (true);

-- Create food_order_items table
CREATE TABLE IF NOT EXISTS food_order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  food_order_id uuid NOT NULL,
  menu_item_id uuid,
  menu_item_name text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric NOT NULL DEFAULT 0,
  subtotal numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE food_order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_food_order_items" ON food_order_items;
CREATE POLICY "anon_select_food_order_items" ON food_order_items FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_food_order_items" ON food_order_items;
CREATE POLICY "anon_insert_food_order_items" ON food_order_items FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_food_order_items" ON food_order_items;
CREATE POLICY "anon_update_food_order_items" ON food_order_items FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_food_order_items" ON food_order_items;
CREATE POLICY "anon_delete_food_order_items" ON food_order_items FOR DELETE
  TO anon, authenticated USING (true);

-- Create activity_logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text,
  user_name text,
  user_role text,
  action text NOT NULL,
  entity_type text,
  entity_id text,
  details text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_activity_logs" ON activity_logs;
CREATE POLICY "anon_select_activity_logs" ON activity_logs FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_activity_logs" ON activity_logs;
CREATE POLICY "anon_insert_activity_logs" ON activity_logs FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_activity_logs" ON activity_logs;
CREATE POLICY "anon_update_activity_logs" ON activity_logs FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_activity_logs" ON activity_logs;
CREATE POLICY "anon_delete_activity_logs" ON activity_logs FOR DELETE
  TO anon, authenticated USING (true);

-- Create maintenance_reports table
CREATE TABLE IF NOT EXISTS maintenance_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_type text NOT NULL,
  item_id text,
  item_name text NOT NULL,
  reported_by text,
  reporter_name text,
  issue_description text NOT NULL,
  status text NOT NULL DEFAULT 'reported',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE maintenance_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_maintenance_reports" ON maintenance_reports;
CREATE POLICY "anon_select_maintenance_reports" ON maintenance_reports FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_maintenance_reports" ON maintenance_reports;
CREATE POLICY "anon_insert_maintenance_reports" ON maintenance_reports FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_maintenance_reports" ON maintenance_reports;
CREATE POLICY "anon_update_maintenance_reports" ON maintenance_reports FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_maintenance_reports" ON maintenance_reports;
CREATE POLICY "anon_delete_maintenance_reports" ON maintenance_reports FOR DELETE
  TO anon, authenticated USING (true);