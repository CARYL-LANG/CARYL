
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'status'
  ) THEN
    ALTER TABLE customers ADD COLUMN status text NOT NULL DEFAULT 'active';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'app_settings' AND column_name = 'admin_name'
  ) THEN
    ALTER TABLE app_settings ADD COLUMN admin_name text;
  END IF;
END $$;
