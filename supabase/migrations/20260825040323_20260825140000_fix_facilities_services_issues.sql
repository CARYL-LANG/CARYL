-- Fix 1: Create the facility-service-images storage bucket (used for Function Hall cover images, service images, food images)
INSERT INTO storage.buckets (id, name, public)
VALUES ('facility-service-images', 'facility-service-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for facility-service-images bucket (CRUD for anon + authenticated)
CREATE POLICY "anon_select_facility_service_images"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'facility-service-images');

CREATE POLICY "anon_insert_facility_service_images"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'facility-service-images');

CREATE POLICY "anon_update_facility_service_images"
  ON storage.objects FOR UPDATE
  TO anon, authenticated
  USING (bucket_id = 'facility-service-images')
  WITH CHECK (bucket_id = 'facility-service-images');

CREATE POLICY "anon_delete_facility_service_images"
  ON storage.objects FOR DELETE
  TO anon, authenticated
  USING (bucket_id = 'facility-service-images');

-- Fix 2: Add missing capacity column to event_type_prices
ALTER TABLE event_type_prices
  ADD COLUMN IF NOT EXISTS capacity integer;

-- Fix 3: Add missing DELETE policy on event_type_prices
CREATE POLICY "anon_delete_event_type_prices"
  ON event_type_prices FOR DELETE
  TO anon, authenticated
  USING (true);