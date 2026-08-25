/*
# Add transaction_screenshot column to booking tables

1. Purpose
   The app defines a `transactionScreenshot` field on Booking and EventBooking
   TypeScript types, and the payment modals collect a screenshot for GCash/Maya
   payments. However the database tables have no column to store it, so the
   screenshot is silently dropped on save. This migration adds a nullable
   `transaction_screenshot` text column to the two existing booking tables.

2. Changes
   - `bookings.transaction_screenshot` (text, nullable) — Base64 screenshot for room/cottage bookings.
   - `event_bookings.transaction_screenshot` (text, nullable) — Base64 screenshot for event bookings.

3. Security
   - No RLS or policy changes. Existing policies continue to govern access.
   - The new column is nullable with no default, so existing rows are unaffected.

4. Notes
   - Idempotent: uses DO $$ ... IF NOT EXISTS ... END $$ so re-running is safe.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'transaction_screenshot'
  ) THEN
    ALTER TABLE bookings ADD COLUMN transaction_screenshot text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'event_bookings' AND column_name = 'transaction_screenshot'
  ) THEN
    ALTER TABLE event_bookings ADD COLUMN transaction_screenshot text;
  END IF;
END $$;
