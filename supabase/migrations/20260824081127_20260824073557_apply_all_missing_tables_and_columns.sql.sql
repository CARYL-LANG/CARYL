-- ============================================
-- 1. COTTAGES TABLE (from 20260809153631)
-- ============================================
CREATE TABLE IF NOT EXISTS cottages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cottage_number text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  price_per_night numeric NOT NULL DEFAULT 0,
  capacity integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'occupied', 'maintenance')),
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE cottages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_cottages" ON cottages;
CREATE POLICY "anon_select_cottages" ON cottages FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_cottages" ON cottages;
CREATE POLICY "anon_insert_cottages" ON cottages FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_cottages" ON cottages;
CREATE POLICY "anon_update_cottages" ON cottages FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_cottages" ON cottages;
CREATE POLICY "anon_delete_cottages" ON cottages FOR DELETE TO anon, authenticated USING (true);

-- Cottage columns on bookings
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'cottage_id') THEN
    ALTER TABLE bookings ADD COLUMN cottage_id uuid REFERENCES cottages(id) ON DELETE SET NULL;
  END IF;
END $$;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'cottage_number') THEN
    ALTER TABLE bookings ADD COLUMN cottage_number text;
  END IF;
END $$;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_name = 'bookings' AND constraint_name = 'bookings_booking_type_check') THEN
    ALTER TABLE bookings DROP CONSTRAINT bookings_booking_type_check;
  END IF;
END $$;
ALTER TABLE bookings ADD CONSTRAINT bookings_booking_type_check CHECK (booking_type IN ('room', 'event', 'cottage'));
CREATE INDEX IF NOT EXISTS idx_bookings_cottage_id ON bookings(cottage_id);
CREATE INDEX IF NOT EXISTS idx_cottages_status ON cottages(status);

-- ============================================
-- 2. SERVICES COLUMNS (from 20260824073557)
-- ============================================
ALTER TABLE services DROP CONSTRAINT IF EXISTS services_category_check;
ALTER TABLE services ADD CONSTRAINT services_category_check CHECK (category IN ('swimming-pool', 'videoke', 'cottages', 'foods', 'function-hall'));
ALTER TABLE services ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE services ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'available';
ALTER TABLE services DROP CONSTRAINT IF EXISTS services_status_check;
ALTER TABLE services ADD CONSTRAINT services_status_check CHECK (status IN ('available', 'maintenance', 'unavailable'));

-- Duration / operating hours columns (from 20260823102444)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'duration_hours') THEN
    ALTER TABLE services ADD COLUMN duration_hours integer;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'operating_hours') THEN
    ALTER TABLE services ADD COLUMN operating_hours text;
  END IF;
END $$;

-- ============================================
-- 3. FOOD MENU ITEMS TABLE (from 20260823102334 + 20260824073557 columns)
-- ============================================
CREATE TABLE IF NOT EXISTS food_menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL DEFAULT 'meal' CHECK (category IN ('meal', 'snack', 'beverage', 'dessert', 'package')),
  description text,
  price numeric NOT NULL DEFAULT 0,
  available boolean NOT NULL DEFAULT true,
  image_url text,
  status text NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'maintenance', 'unavailable')),
  package_items text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE food_menu_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "fmi_sel" ON food_menu_items;
CREATE POLICY "fmi_sel" ON food_menu_items FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "fmi_ins" ON food_menu_items;
CREATE POLICY "fmi_ins" ON food_menu_items FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "fmi_upd" ON food_menu_items;
CREATE POLICY "fmi_upd" ON food_menu_items FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "fmi_del" ON food_menu_items;
CREATE POLICY "fmi_del" ON food_menu_items FOR DELETE TO anon, authenticated USING (true);

-- ============================================
-- 4. FACILITY BOOKINGS TABLE (from 20260823102326)
-- ============================================
CREATE TABLE IF NOT EXISTS facility_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_type text NOT NULL CHECK (facility_type IN ('swimming-pool', 'videoke')),
  facility_id uuid REFERENCES services(id) ON DELETE SET NULL,
  guest_name text NOT NULL,
  guest_email text NOT NULL,
  guest_phone text,
  booking_date date NOT NULL,
  start_time time,
  end_time time,
  number_of_guests integer DEFAULT 1,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  total_price numeric DEFAULT 0,
  payment_method text,
  payment_reference text,
  payment_status text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE facility_bookings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "fb_sel" ON facility_bookings;
CREATE POLICY "fb_sel" ON facility_bookings FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "fb_ins" ON facility_bookings;
CREATE POLICY "fb_ins" ON facility_bookings FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "fb_upd" ON facility_bookings;
CREATE POLICY "fb_upd" ON facility_bookings FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "fb_del" ON facility_bookings;
CREATE POLICY "fb_del" ON facility_bookings FOR DELETE TO anon, authenticated USING (true);
CREATE INDEX IF NOT EXISTS idx_fb_type_date ON facility_bookings(facility_type, booking_date);

-- ============================================
-- 5. FOOD ORDERS TABLES (from 20260823102353)
-- ============================================
CREATE TABLE IF NOT EXISTS food_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES bookings(id) ON DELETE SET NULL,
  event_booking_id uuid REFERENCES event_bookings(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'served', 'cancelled')),
  total_price numeric DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE food_orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "fo_sel" ON food_orders;
CREATE POLICY "fo_sel" ON food_orders FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "fo_ins" ON food_orders;
CREATE POLICY "fo_ins" ON food_orders FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "fo_upd" ON food_orders;
CREATE POLICY "fo_upd" ON food_orders FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "fo_del" ON food_orders;
CREATE POLICY "fo_del" ON food_orders FOR DELETE TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS food_order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  food_order_id uuid NOT NULL REFERENCES food_orders(id) ON DELETE CASCADE,
  menu_item_id uuid REFERENCES food_menu_items(id) ON DELETE SET NULL,
  menu_item_name text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric NOT NULL DEFAULT 0,
  subtotal numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE food_order_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "foi_sel" ON food_order_items;
CREATE POLICY "foi_sel" ON food_order_items FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "foi_ins" ON food_order_items;
CREATE POLICY "foi_ins" ON food_order_items FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "foi_upd" ON food_order_items;
CREATE POLICY "foi_upd" ON food_order_items FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "foi_del" ON food_order_items;
CREATE POLICY "foi_del" ON food_order_items FOR DELETE TO anon, authenticated USING (true);

-- ============================================
-- 6. ACTIVITY LOGS TABLE (from 20260823102402)
-- ============================================
CREATE TABLE IF NOT EXISTS activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text,
  user_name text,
  user_role text CHECK (user_role IS NULL OR user_role IN ('admin', 'staff', 'customer')),
  action text NOT NULL,
  entity_type text,
  entity_id text,
  details text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "al_sel" ON activity_logs;
CREATE POLICY "al_sel" ON activity_logs FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "al_ins" ON activity_logs;
CREATE POLICY "al_ins" ON activity_logs FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "al_upd" ON activity_logs;
CREATE POLICY "al_upd" ON activity_logs FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "al_del" ON activity_logs;
CREATE POLICY "al_del" ON activity_logs FOR DELETE TO anon, authenticated USING (true);
CREATE INDEX IF NOT EXISTS idx_al_created ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_al_user ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_al_action ON activity_logs(action);

-- ============================================
-- 7. MAINTENANCE REPORTS TABLE (from 20260823102410)
-- ============================================
CREATE TABLE IF NOT EXISTS maintenance_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_type text NOT NULL CHECK (item_type IN ('room', 'facility')),
  item_id text,
  item_name text NOT NULL,
  reported_by text,
  reporter_name text,
  issue_description text NOT NULL,
  status text NOT NULL DEFAULT 'reported' CHECK (status IN ('reported', 'in-progress', 'resolved')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE maintenance_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "mr_sel" ON maintenance_reports;
CREATE POLICY "mr_sel" ON maintenance_reports FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "mr_ins" ON maintenance_reports;
CREATE POLICY "mr_ins" ON maintenance_reports FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "mr_upd" ON maintenance_reports;
CREATE POLICY "mr_upd" ON maintenance_reports FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "mr_del" ON maintenance_reports;
CREATE POLICY "mr_del" ON maintenance_reports FOR DELETE TO anon, authenticated USING (true);
CREATE INDEX IF NOT EXISTS idx_mr_status ON maintenance_reports(status);
CREATE INDEX IF NOT EXISTS idx_mr_item ON maintenance_reports(item_type, item_id);

-- ============================================
-- 8. APP SETTINGS COLUMNS (from 20260823102423 + 20260823102432)
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'app_settings' AND column_name = 'check_in_time') THEN
    ALTER TABLE app_settings ADD COLUMN check_in_time text DEFAULT '14:00';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'app_settings' AND column_name = 'check_out_time') THEN
    ALTER TABLE app_settings ADD COLUMN check_out_time text DEFAULT '12:00';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'app_settings' AND column_name = 'cancellation_policy') THEN
    ALTER TABLE app_settings ADD COLUMN cancellation_policy text DEFAULT 'Free cancellation up to 24 hours before check-in. After that, the first night is non-refundable.';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'app_settings' AND column_name = 'pool_operating_hours') THEN
    ALTER TABLE app_settings ADD COLUMN pool_operating_hours text DEFAULT '8:00 AM - 8:00 PM';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'app_settings' AND column_name = 'admin_name') THEN
    ALTER TABLE app_settings ADD COLUMN admin_name text;
  END IF;
END $$;

-- ============================================
-- 9. CUSTOMER STATUS COLUMN (from 20260823102432)
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'status') THEN
    ALTER TABLE customers ADD COLUMN status text NOT NULL DEFAULT 'active';
  END IF;
END $$;

-- ============================================
-- 10. EVENT TYPE PRICES CAPACITY COLUMN (from 20260823102444)
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'event_type_prices' AND column_name = 'capacity') THEN
    ALTER TABLE event_type_prices ADD COLUMN capacity integer;
  END IF;
END $$;

-- ============================================
-- 11. OTP CODES TABLE (from 20260823200947)
-- ============================================
CREATE TABLE IF NOT EXISTS otp_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  code text NOT NULL,
  account_type text NOT NULL,
  expires_at timestamptz NOT NULL,
  used boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE otp_codes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "deny_select_otp" ON otp_codes;
CREATE POLICY "deny_select_otp" ON otp_codes FOR SELECT TO authenticated USING (false);
DROP POLICY IF EXISTS "deny_insert_otp" ON otp_codes;
CREATE POLICY "deny_insert_otp" ON otp_codes FOR INSERT TO authenticated WITH CHECK (false);
DROP POLICY IF EXISTS "deny_update_otp" ON otp_codes;
CREATE POLICY "deny_update_otp" ON otp_codes FOR UPDATE TO authenticated USING (false);
DROP POLICY IF EXISTS "deny_delete_otp" ON otp_codes;
CREATE POLICY "deny_delete_otp" ON otp_codes FOR DELETE TO authenticated USING (false);
CREATE INDEX IF NOT EXISTS idx_otp_codes_email ON otp_codes(email);
CREATE INDEX IF NOT EXISTS idx_otp_codes_expires ON otp_codes(expires_at);

-- ============================================
-- 12. STORAGE BUCKET: facility-service-images (from 20260824073557)
-- ============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('facility-service-images', 'facility-service-images', true)
ON CONFLICT (id) DO NOTHING;
DROP POLICY IF EXISTS "anon_select_facility_service_images" ON storage.objects;
CREATE POLICY "anon_select_facility_service_images" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'facility-service-images');
DROP POLICY IF EXISTS "anon_insert_facility_service_images" ON storage.objects;
CREATE POLICY "anon_insert_facility_service_images" ON storage.objects FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'facility-service-images');
DROP POLICY IF EXISTS "anon_update_facility_service_images" ON storage.objects;
CREATE POLICY "anon_update_facility_service_images" ON storage.objects FOR UPDATE TO anon, authenticated USING (bucket_id = 'facility-service-images') WITH CHECK (bucket_id = 'facility-service-images');
DROP POLICY IF EXISTS "anon_delete_facility_service_images" ON storage.objects;
CREATE POLICY "anon_delete_facility_service_images" ON storage.objects FOR DELETE TO anon, authenticated USING (bucket_id = 'facility-service-images');

-- ============================================
-- 13. DEFAULT DATA
-- ============================================
INSERT INTO cottages (cottage_number, name, description, price_per_night, capacity, status, image_url) VALUES
  ('C1', 'Cottage 1', 'Cozy private cottage near the pool', 800, 6, 'available', 'https://images.pexels.com/photos/803975/pexels-photo-803975.jpeg'),
  ('C2', 'Cottage 2', 'Spacious family cottage with garden view', 1200, 10, 'available', 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg')
ON CONFLICT (cottage_number) DO NOTHING;