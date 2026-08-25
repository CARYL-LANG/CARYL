/*
# Fix Cottages, Function Hall image upload, and Services schema

This migration fixes three issues in the Facilities and Services admin page:

1. Cottages: The `cottages` table did not exist in the live database, so saving
   a cottage silently failed (the insert returned an error that was caught and
   logged, leaving the "Saving..." state stuck). This creates the table with
   RLS policies matching the rooms table (shared data, anon+authenticated CRUD).

2. Function Hall image upload: The `facility-service-images` storage bucket did
   not exist, so image uploads failed. This creates the public bucket with
   storage policies allowing anon+authenticated to upload/read/update/delete.

3. Function Hall "Add service" add-ons: The `services` table's category CHECK
   constraint did not allow `function-hall` (only `swimming-pool`, `videoke`,
   `cottages`, `foods`). This replaces the constraint to include `function-hall`.
   Also adds the missing `status`, `image_url`, `duration_hours`, and
   `operating_hours` columns to the `services` table.

4. Event type prices: The `event_type_prices` table was missing `name`,
   `description`, and `capacity` columns that the app inserts/updates. This
   adds those columns.

5. App settings: Adds the missing `pool_operating_hours` and
   `function_hall_image_url` columns (plus other business-info columns the app
   reads/writes) to `app_settings`.

## Tables and changes

### cottages (NEW)
- id (uuid PK)
- cottage_number (text, unique)
- name (text)
- description (text, nullable)
- price_per_night (numeric)
- capacity (integer)
- status (text: available | reserved | occupied | maintenance)
- image_url (text, nullable)
- created_at, updated_at (timestamptz)

### services (MODIFIED)
- Added status (text, default 'available')
- Added image_url (text, nullable)
- Added duration_hours (numeric, nullable)
- Added operating_hours (text, nullable)
- Replaced category CHECK to include 'function-hall'

### event_type_prices (MODIFIED)
- Added name (text, nullable)
- Added description (text, nullable)
- Added capacity (integer, nullable)

### app_settings (MODIFIED)
- Added pool_operating_hours (text, nullable)
- Added function_hall_image_url (text, nullable)
- Added admin_name, owner_name, fb_link, business_permit_url, contact_number,
  location, check_in_time, check_out_time, cancellation_policy (all text, nullable)

### storage.buckets (NEW)
- facility-service-images (public)

## Security
- RLS enabled on cottages with anon+authenticated CRUD (shared data, same as rooms).
- Storage policies on facility-service-images bucket for anon+authenticated.
*/

-- ============================================
-- 1. COTTAGES TABLE
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

-- Index for status filtering
CREATE INDEX IF NOT EXISTS idx_cottages_status ON cottages(status);

-- ============================================
-- 2. SERVICES TABLE: add missing columns + fix category constraint
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'status') THEN
    ALTER TABLE services ADD COLUMN status text NOT NULL DEFAULT 'available';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'image_url') THEN
    ALTER TABLE services ADD COLUMN image_url text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'duration_hours') THEN
    ALTER TABLE services ADD COLUMN duration_hours numeric;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'operating_hours') THEN
    ALTER TABLE services ADD COLUMN operating_hours text;
  END IF;
END $$;

-- Replace the category CHECK constraint to include 'function-hall'
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'services' AND constraint_name = 'services_category_check'
  ) THEN
    ALTER TABLE services DROP CONSTRAINT services_category_check;
  END IF;
END $$;

ALTER TABLE services ADD CONSTRAINT services_category_check
  CHECK (category IN ('swimming-pool', 'videoke', 'cottages', 'foods', 'function-hall'));

-- Backfill status from available boolean for existing rows
UPDATE services SET status = CASE WHEN available THEN 'available' ELSE 'unavailable' END WHERE status IS NULL OR status = '';

-- ============================================
-- 3. EVENT_TYPE_PRICES TABLE: add missing columns
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'event_type_prices' AND column_name = 'name') THEN
    ALTER TABLE event_type_prices ADD COLUMN name text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'event_type_prices' AND column_name = 'description') THEN
    ALTER TABLE event_type_prices ADD COLUMN description text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'event_type_prices' AND column_name = 'capacity') THEN
    ALTER TABLE event_type_prices ADD COLUMN capacity integer;
  END IF;
END $$;

-- Backfill name from event_type for existing rows
UPDATE event_type_prices SET name = event_type WHERE name IS NULL;

-- ============================================
-- 4. APP_SETTINGS TABLE: add missing columns
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'app_settings' AND column_name = 'pool_operating_hours') THEN
    ALTER TABLE app_settings ADD COLUMN pool_operating_hours text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'app_settings' AND column_name = 'function_hall_image_url') THEN
    ALTER TABLE app_settings ADD COLUMN function_hall_image_url text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'app_settings' AND column_name = 'admin_name') THEN
    ALTER TABLE app_settings ADD COLUMN admin_name text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'app_settings' AND column_name = 'owner_name') THEN
    ALTER TABLE app_settings ADD COLUMN owner_name text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'app_settings' AND column_name = 'fb_link') THEN
    ALTER TABLE app_settings ADD COLUMN fb_link text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'app_settings' AND column_name = 'business_permit_url') THEN
    ALTER TABLE app_settings ADD COLUMN business_permit_url text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'app_settings' AND column_name = 'contact_number') THEN
    ALTER TABLE app_settings ADD COLUMN contact_number text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'app_settings' AND column_name = 'location') THEN
    ALTER TABLE app_settings ADD COLUMN location text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'app_settings' AND column_name = 'check_in_time') THEN
    ALTER TABLE app_settings ADD COLUMN check_in_time text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'app_settings' AND column_name = 'check_out_time') THEN
    ALTER TABLE app_settings ADD COLUMN check_out_time text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'app_settings' AND column_name = 'cancellation_policy') THEN
    ALTER TABLE app_settings ADD COLUMN cancellation_policy text;
  END IF;
END $$;

-- ============================================
-- 5. FACILITY-SERVICE-IMAGES STORAGE BUCKET
-- ============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('facility-service-images', 'facility-service-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "facility_images_select" ON storage.objects;
CREATE POLICY "facility_images_select"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'facility-service-images');

DROP POLICY IF EXISTS "facility_images_insert" ON storage.objects;
CREATE POLICY "facility_images_insert"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'facility-service-images');

DROP POLICY IF EXISTS "facility_images_update" ON storage.objects;
CREATE POLICY "facility_images_update"
ON storage.objects FOR UPDATE
TO anon, authenticated
USING (bucket_id = 'facility-service-images')
WITH CHECK (bucket_id = 'facility-service-images');

DROP POLICY IF EXISTS "facility_images_delete" ON storage.objects;
CREATE POLICY "facility_images_delete"
ON storage.objects FOR DELETE
TO anon, authenticated
USING (bucket_id = 'facility-service-images');
