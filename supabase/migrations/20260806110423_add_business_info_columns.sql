/*
# Add business information columns to app_settings

Adds owner_name, fb_link, business_permit_url, contact_number, location columns.
*/
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'app_settings' AND column_name = 'owner_name') THEN
    ALTER TABLE app_settings ADD COLUMN owner_name text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'app_settings' AND column_name = 'fb_link') THEN
    ALTER TABLE app_settings ADD COLUMN fb_link text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'app_settings' AND column_name = 'business_permit_url') THEN
    ALTER TABLE app_settings ADD COLUMN business_permit_url text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'app_settings' AND column_name = 'contact_number') THEN
    ALTER TABLE app_settings ADD COLUMN contact_number text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'app_settings' AND column_name = 'location') THEN
    ALTER TABLE app_settings ADD COLUMN location text;
  END IF;
END $$;