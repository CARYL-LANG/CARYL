/*
# Add check-in and check-out timestamps to bookings

1. Changes
- Add `checked_in_at` (timestamptz, nullable) to `bookings` — records the actual date/time a guest was checked in by staff.
- Add `checked_out_at` (timestamptz, nullable) to `bookings` — records the actual date/time a guest was checked out by staff.
- Both columns are nullable so existing bookings are unaffected.
- No security changes (RLS already enabled, existing policies cover the new columns).
*/

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS checked_in_at timestamptz,
  ADD COLUMN IF NOT EXISTS checked_out_at timestamptz;
