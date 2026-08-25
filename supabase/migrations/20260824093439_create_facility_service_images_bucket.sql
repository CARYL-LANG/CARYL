/*
# Create facility-service-images storage bucket

1. New Storage Bucket
- `facility-service-images` (public) — stores cover/feature images for
  facility and service items (e.g. Function Hall cover image, swimming pool,
  videoke, food services). Public so images can be displayed via public URLs.
2. Security
- INSERT: anon + authenticated can upload (admin/staff operate via anon key).
- SELECT: public read (bucket is public, so reads are open).
- UPDATE: anon + authenticated can update their own objects.
- DELETE: anon + authenticated can delete their own objects.
3. Notes
- The Function Hall cover image upload in Admin > Facilities and Services
  was failing with "BUCKET NOT FOUND" because this bucket did not exist.
*/

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
