/*
# Storage policies for business-permits bucket

1. Security
- SELECT (read): public — anyone can view permit images (needed to display in-app).
- INSERT: anon + authenticated can upload.
- UPDATE: anon + authenticated can replace.
- DELETE: anon + authenticated can remove.
*/
DROP POLICY IF EXISTS "anon_select_business_permits" ON storage.objects;
CREATE POLICY "anon_select_business_permits" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'business-permits');

DROP POLICY IF EXISTS "anon_insert_business_permits" ON storage.objects;
CREATE POLICY "anon_insert_business_permits" ON storage.objects
  FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'business-permits');

DROP POLICY IF EXISTS "anon_update_business_permits" ON storage.objects;
CREATE POLICY "anon_update_business_permits" ON storage.objects
  FOR UPDATE TO anon, authenticated
  USING (bucket_id = 'business-permits') WITH CHECK (bucket_id = 'business-permits');

DROP POLICY IF EXISTS "anon_delete_business_permits" ON storage.objects;
CREATE POLICY "anon_delete_business_permits" ON storage.objects
  FOR DELETE TO anon, authenticated
  USING (bucket_id = 'business-permits');