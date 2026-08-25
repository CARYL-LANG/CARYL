/*
# Add missing business info columns to app_settings

The live app_settings table only had id, admin_password, updated_at.
The app code writes to many more columns (admin_name, owner_name, fb_link,
business_permit_url, contact_number, location, check_in_time, check_out_time,
cancellation_policy, pool_operating_hours, function_hall_image_url) that
did not exist, so every update — including the Function Hall cover image
save — silently failed.
*/

ALTER TABLE app_settings
  ADD COLUMN IF NOT EXISTS admin_name text,
  ADD COLUMN IF NOT EXISTS owner_name text,
  ADD COLUMN IF NOT EXISTS fb_link text,
  ADD COLUMN IF NOT EXISTS business_permit_url text,
  ADD COLUMN IF NOT EXISTS contact_number text,
  ADD COLUMN IF NOT EXISTS location text,
  ADD COLUMN IF NOT EXISTS check_in_time text,
  ADD COLUMN IF NOT EXISTS check_out_time text,
  ADD COLUMN IF NOT EXISTS cancellation_policy text,
  ADD COLUMN IF NOT EXISTS pool_operating_hours text,
  ADD COLUMN IF NOT EXISTS function_hall_image_url text;