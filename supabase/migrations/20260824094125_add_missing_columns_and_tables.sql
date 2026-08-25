/*
# Add missing columns and tables to match application code

This migration brings the database schema in line with what the application
code expects. Several columns and tables were missing, causing:
- Function Hall cover image upload to fail (app_settings missing columns)
- Adding services to fail (services table missing status/image_url columns)
- Food services, facility bookings, activity logs, and maintenance reports
  to be non-functional (tables missing entirely)

## 1. Modified Tables

### app_settings
- ADD admin_name (text, nullable)
- ADD check_in_time (text, nullable)
- ADD check_out_time (text, nullable)
- ADD cancellation_policy (text, nullable)
- ADD pool_operating_hours (text, nullable)

### services
- ADD image_url (text, nullable)
- ADD status (text, nullable, default 'available')
- ADD duration_hours (integer, nullable)
- ADD operating_hours (text, nullable)

### bookings
- ADD created_by (text, nullable)
- ADD assigned_staff_id (text, nullable)

## 2. New Tables

### facility_bookings
- id (uuid, primary key)
- facility_type (text, not null)
- facility_id (text, nullable)
- guest_name (text, not null)
- guest_email (text, not null)
- guest_phone (text, nullable)
- booking_date (date, not null)
- start_time (text, nullable)
- end_time (text, nullable)
- number_of_guests (integer, not null, default 1)
- status (text, not null, default 'pending')
- total_price (numeric, not null, default 0)
- payment_method (text, nullable)
- payment_reference (text, nullable)
- payment_status (text, nullable)
- created_at, updated_at (timestamptz)

### food_menu_items
- id (uuid, primary key)
- name (text, not null)
- category (text, not null, default 'meal')
- description (text, nullable)
- price (numeric, not null, default 0)
- available (boolean, not null, default true)
- status (text, nullable, default 'available')
- package_items (text, nullable)
- image_url (text, nullable)
- created_at, updated_at (timestamptz)

### food_orders
- id (uuid, primary key)
- booking_id (text, nullable)
- event_booking_id (text, nullable)
- customer_name (text, not null)
- status (text, not null, default 'pending')
- total_price (numeric, not null, default 0)
- notes (text, nullable)
- created_at, updated_at (timestamptz)

### food_order_items
- id (uuid, primary key)
- food_order_id (uuid, not null, references food_orders)
- menu_item_id (text, nullable)
- menu_item_name (text, not null)
- quantity (integer, not null, default 1)
- unit_price (numeric, not null, default 0)
- subtotal (numeric, not null, default 0)
- created_at (timestamptz)

### activity_logs
- id (uuid, primary key)
- user_id (text, nullable)
- user_name (text, nullable)
- user_role (text, nullable)
- action (text, not null)
- entity_type (text, nullable)
- entity_id (text, nullable)
- details (text, nullable)
- created_at (timestamptz)

### maintenance_reports
- id (uuid, primary key)
- item_type (text, not null)
- item_id (text, nullable)
- item_name (text, not null)
- reported_by (text, nullable)
- reporter_name (text, nullable)
- issue_description (text, not null)
- status (text, not null, default 'reported')
- created_at, updated_at (timestamptz)

## 3. Security
- RLS enabled on all new tables.
- Policies: anon + authenticated full CRUD (single-tenant app, no sign-in).

## 4. Notes
- All statements are idempotent (IF NOT EXISTS / DO $$ blocks).
- No data is lost — only additions, no drops or type changes.
*/

-- app_settings missing columns
ALTER TABLE app_settings ADD COLUMN IF NOT EXISTS admin_name text;
ALTER TABLE app_settings ADD COLUMN IF NOT EXISTS check_in_time text;
ALTER TABLE app_settings ADD COLUMN IF NOT EXISTS check_out_time text;
ALTER TABLE app_settings ADD COLUMN IF NOT EXISTS cancellation_policy text;
ALTER TABLE app_settings ADD COLUMN IF NOT EXISTS pool_operating_hours text;

-- services missing columns
ALTER TABLE services ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE services ADD COLUMN IF NOT EXISTS status text DEFAULT 'available';
ALTER TABLE services ADD COLUMN IF NOT EXISTS duration_hours integer;
ALTER TABLE services ADD COLUMN IF NOT EXISTS operating_hours text;

-- bookings missing columns
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS created_by text;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS assigned_staff_id text;

-- facility_bookings
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
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE facility_bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "facility_bookings_select" ON facility_bookings;
CREATE POLICY "facility_bookings_select" ON facility_bookings FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "facility_bookings_insert" ON facility_bookings;
CREATE POLICY "facility_bookings_insert" ON facility_bookings FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "facility_bookings_update" ON facility_bookings;
CREATE POLICY "facility_bookings_update" ON facility_bookings FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "facility_bookings_delete" ON facility_bookings;
CREATE POLICY "facility_bookings_delete" ON facility_bookings FOR DELETE
  TO anon, authenticated USING (true);

-- food_menu_items
CREATE TABLE IF NOT EXISTS food_menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL DEFAULT 'meal',
  description text,
  price numeric NOT NULL DEFAULT 0,
  available boolean NOT NULL DEFAULT true,
  status text DEFAULT 'available',
  package_items text,
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE food_menu_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "food_menu_items_select" ON food_menu_items;
CREATE POLICY "food_menu_items_select" ON food_menu_items FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "food_menu_items_insert" ON food_menu_items;
CREATE POLICY "food_menu_items_insert" ON food_menu_items FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "food_menu_items_update" ON food_menu_items;
CREATE POLICY "food_menu_items_update" ON food_menu_items FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "food_menu_items_delete" ON food_menu_items;
CREATE POLICY "food_menu_items_delete" ON food_menu_items FOR DELETE
  TO anon, authenticated USING (true);

-- food_orders
CREATE TABLE IF NOT EXISTS food_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id text,
  event_booking_id text,
  customer_name text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  total_price numeric NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE food_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "food_orders_select" ON food_orders;
CREATE POLICY "food_orders_select" ON food_orders FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "food_orders_insert" ON food_orders;
CREATE POLICY "food_orders_insert" ON food_orders FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "food_orders_update" ON food_orders;
CREATE POLICY "food_orders_update" ON food_orders FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "food_orders_delete" ON food_orders;
CREATE POLICY "food_orders_delete" ON food_orders FOR DELETE
  TO anon, authenticated USING (true);

-- food_order_items
CREATE TABLE IF NOT EXISTS food_order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  food_order_id uuid NOT NULL REFERENCES food_orders(id) ON DELETE CASCADE,
  menu_item_id text,
  menu_item_name text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric NOT NULL DEFAULT 0,
  subtotal numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE food_order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "food_order_items_select" ON food_order_items;
CREATE POLICY "food_order_items_select" ON food_order_items FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "food_order_items_insert" ON food_order_items;
CREATE POLICY "food_order_items_insert" ON food_order_items FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "food_order_items_update" ON food_order_items;
CREATE POLICY "food_order_items_update" ON food_order_items FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "food_order_items_delete" ON food_order_items;
CREATE POLICY "food_order_items_delete" ON food_order_items FOR DELETE
  TO anon, authenticated USING (true);

-- activity_logs
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

DROP POLICY IF EXISTS "activity_logs_select" ON activity_logs;
CREATE POLICY "activity_logs_select" ON activity_logs FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "activity_logs_insert" ON activity_logs;
CREATE POLICY "activity_logs_insert" ON activity_logs FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "activity_logs_update" ON activity_logs;
CREATE POLICY "activity_logs_update" ON activity_logs FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "activity_logs_delete" ON activity_logs;
CREATE POLICY "activity_logs_delete" ON activity_logs FOR DELETE
  TO anon, authenticated USING (true);

-- maintenance_reports
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

DROP POLICY IF EXISTS "maintenance_reports_select" ON maintenance_reports;
CREATE POLICY "maintenance_reports_select" ON maintenance_reports FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "maintenance_reports_insert" ON maintenance_reports;
CREATE POLICY "maintenance_reports_insert" ON maintenance_reports FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "maintenance_reports_update" ON maintenance_reports;
CREATE POLICY "maintenance_reports_update" ON maintenance_reports FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "maintenance_reports_delete" ON maintenance_reports;
CREATE POLICY "maintenance_reports_delete" ON maintenance_reports FOR DELETE
  TO anon, authenticated USING (true);
