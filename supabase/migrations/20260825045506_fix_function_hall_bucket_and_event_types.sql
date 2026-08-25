/*
# Fix Function Hall: storage bucket + services constraint + event_type_prices capacity

This migration fixes three issues blocking the Function Hall tab in Admin > Facilities and Services:

1. STORAGE BUCKET MISSING
   The `facility-service-images` storage bucket was never created in the live database.
   Uploading a Function Hall cover photo (or any facility/service image) fails with
   "BUCKET NOT FOUND." This migration creates the public bucket and the four
   storage policies (SELECT/INSERT/UPDATE/DELETE) for anon + authenticated roles.

2. SERVICES CHECK CONSTRAINT EXCLUDES 'function-hall'
   The `services` table has a CHECK constraint that only allows these categories:
     swimming-pool, videoke, cottages, foods
   The app code uses `function-hall` as a category, so inserting a function-hall
   service was rejected by the database. This migration drops the old constraint
   and adds a new one that includes `function-hall`.

3. EVENT_TYPE_PRICES MISSING `capacity` COLUMN
   The app tries to insert/update a `capacity` value on `event_type_prices`,
   but that column does not exist in the live database, causing "column does not
   exist" errors when adding or editing event types. This migration adds the
   `capacity` column (integer, nullable).

## Security
- New public storage bucket `facility-service-images` with anon+authenticated CRUD policies.
- No changes to table-level RLS. The `services` and `event_type_prices` tables
  already have RLS enabled with anon+authenticated CRUD policies.
*/

-- ============================================
-- 1. CREATE facility-service-images BUCKET
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

-- ============================================
-- 2. FIX services CATEGORY CHECK CONSTRAINT
-- ============================================
DO $$
DECLARE
  constraint_name text;
BEGIN
  SELECT con.conname
  INTO constraint_name
  FROM pg_constraint con
  JOIN pg_class rel ON rel.oid = con.conrelid
  WHERE rel.relname = 'services' AND con.contype = 'c';

  IF constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE services DROP CONSTRAINT %I', constraint_name);
  END IF;
END $$;

ALTER TABLE services
  ADD CONSTRAINT services_category_check
  CHECK (category IN ('swimming-pool', 'videoke', 'cottages', 'foods', 'function-hall'));

-- ============================================
-- 3. ADD capacity COLUMN TO event_type_prices
-- ============================================
ALTER TABLE event_type_prices
  ADD COLUMN IF NOT EXISTS capacity integer;
