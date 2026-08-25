
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'app_settings' AND column_name = 'check_in_time'
  ) THEN
    ALTER TABLE app_settings ADD COLUMN check_in_time text DEFAULT '14:00';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'app_settings' AND column_name = 'check_out_time'
  ) THEN
    ALTER TABLE app_settings ADD COLUMN check_out_time text DEFAULT '12:00';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'app_settings' AND column_name = 'cancellation_policy'
  ) THEN
    ALTER TABLE app_settings ADD COLUMN cancellation_policy text DEFAULT 'Free cancellation up to 24 hours before check-in. After that, the first night is non-refundable.';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'app_settings' AND column_name = 'pool_operating_hours'
  ) THEN
    ALTER TABLE app_settings ADD COLUMN pool_operating_hours text DEFAULT '8:00 AM - 8:00 PM';
  END IF;
END $$;
