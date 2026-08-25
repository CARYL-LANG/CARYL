/*
# Add assigned_staff_id column to bookings

1. Modified Tables
- `bookings`
  - Added `assigned_staff_id` (uuid, nullable) - references staff_accounts.id
  - Tracks which staff member is assigned to handle a reservation

2. Notes
- Nullable so existing bookings are unaffected.
- Foreign key to staff_accounts with ON DELETE SET NULL so deleting a staff
  account clears the assignment rather than failing.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'assigned_staff_id'
  ) THEN
    ALTER TABLE bookings
      ADD COLUMN assigned_staff_id uuid REFERENCES staff_accounts(id) ON DELETE SET NULL;
  END IF;
END $$;
