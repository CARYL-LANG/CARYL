/*
# Add status column to customers table

1. Changes
- Adds a `status` column to the `customers` table to support activate/deactivate functionality.
- Default value is 'active' so all existing customers remain active.
- Also adds an `admin_name` column to `app_settings` to store the admin's display name (for the Update Profile feature).

2. Security
- No changes to RLS policies. Existing policies remain in place.
*/

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
