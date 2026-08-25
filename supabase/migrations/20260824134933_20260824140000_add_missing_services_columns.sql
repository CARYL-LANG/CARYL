/*
# Add missing columns to services table

The live services table was missing status, image_url, duration_hours,
and operating_hours columns that the app writes to on insert/update.
This caused "Adding service" to fail in Admin > Facilities and Services.
*/

ALTER TABLE services
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'available',
  ADD COLUMN IF NOT EXISTS image_url text,
  ADD COLUMN IF NOT EXISTS duration_hours text,
  ADD COLUMN IF NOT EXISTS operating_hours text;