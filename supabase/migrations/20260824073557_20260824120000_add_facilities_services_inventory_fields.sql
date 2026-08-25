/*
# Complete facilities and services inventory storage

1. New Tables
- `cottages`: cottage name, description, capacity, nightly price, photo, and availability status.
- `food_menu_items`: food service name, category, description, price, photo, and availability status.

2. Modified Tables
- `services`: adds `image_url` for uploaded photos and `status` for available, maintenance, or unavailable; permits `function-hall` as a managed category.

3. Storage
- Creates the public `facility-service-images` bucket for photos uploaded from the admin device.

4. Security
- Enables RLS on the new tables.
- Adds separate read, insert, update, and delete policies for anon and authenticated roles, matching this single-tenant app's existing access model.
- Adds separate read, insert, update, and delete storage policies for the new image bucket.

5. Important Notes
- Existing service rows receive safe defaults and are not deleted.
- Existing columns and records are preserved.
*/

ALTER TABLE services DROP CONSTRAINT IF EXISTS services_category_check;
ALTER TABLE services ADD CONSTRAINT services_category_check CHECK (category IN ('swimming-pool', 'videoke', 'cottages', 'foods', 'function-hall'));
ALTER TABLE services ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE services ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'available';
ALTER TABLE services DROP CONSTRAINT IF EXISTS services_status_check;
ALTER TABLE services ADD CONSTRAINT services_status_check CHECK (status IN ('available', 'maintenance', 'unavailable'));

CREATE TABLE IF NOT EXISTS cottages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cottage_number text NOT NULL UNIQUE,
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

CREATE TABLE IF NOT EXISTS food_menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL DEFAULT 'meal' CHECK (category IN ('meal', 'snack', 'beverage', 'dessert', 'package')),
  description text,
  price numeric NOT NULL DEFAULT 0,
  available boolean NOT NULL DEFAULT true,
  image_url text,
  status text NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'maintenance', 'unavailable')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE food_menu_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_food_menu_items" ON food_menu_items;
CREATE POLICY "anon_select_food_menu_items" ON food_menu_items FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_food_menu_items" ON food_menu_items;
CREATE POLICY "anon_insert_food_menu_items" ON food_menu_items FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_food_menu_items" ON food_menu_items;
CREATE POLICY "anon_update_food_menu_items" ON food_menu_items FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_food_menu_items" ON food_menu_items;
CREATE POLICY "anon_delete_food_menu_items" ON food_menu_items FOR DELETE TO anon, authenticated USING (true);

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