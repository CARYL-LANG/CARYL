/*
# Create cottage-images storage bucket

1. Storage
- Creates a public storage bucket named `cottage-images` for uploading cottage photos.
- Public bucket so image URLs are accessible without signed URLs.

2. Security
- Public bucket: read access is open. Insert/update/delete via anon+authenticated storage policies.
*/
INSERT INTO storage.buckets (id, name, public)
VALUES ('cottage-images', 'cottage-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "anon_select_cottage_images" ON storage.objects;
CREATE POLICY "anon_select_cottage_images" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'cottage-images');

DROP POLICY IF EXISTS "anon_insert_cottage_images" ON storage.objects;
CREATE POLICY "anon_insert_cottage_images" ON storage.objects
  FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'cottage-images');

DROP POLICY IF EXISTS "anon_update_cottage_images" ON storage.objects;
CREATE POLICY "anon_update_cottage_images" ON storage.objects
  FOR UPDATE TO anon, authenticated
  USING (bucket_id = 'cottage-images') WITH CHECK (bucket_id = 'cottage-images');

DROP POLICY IF EXISTS "anon_delete_cottage_images" ON storage.objects;
CREATE POLICY "anon_delete_cottage_images" ON storage.objects
  FOR DELETE TO anon, authenticated
  USING (bucket_id = 'cottage-images');
