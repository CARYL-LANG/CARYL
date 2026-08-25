-- Fix: Add all missing columns to app_settings
ALTER TABLE app_settings ADD COLUMN IF NOT EXISTS admin_name text;
ALTER TABLE app_settings ADD COLUMN IF NOT EXISTS check_in_time text;
ALTER TABLE app_settings ADD COLUMN IF NOT EXISTS check_out_time text;
ALTER TABLE app_settings ADD COLUMN IF NOT EXISTS cancellation_policy text;
ALTER TABLE app_settings ADD COLUMN IF NOT EXISTS pool_operating_hours text;
ALTER TABLE app_settings ADD COLUMN IF NOT EXISTS function_hall_image_url text;

-- Fix: Add all missing columns to services
ALTER TABLE services ADD COLUMN IF NOT EXISTS status text DEFAULT 'available';
ALTER TABLE services ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE services ADD COLUMN IF NOT EXISTS duration_hours integer;
ALTER TABLE services ADD COLUMN IF NOT EXISTS operating_hours text;