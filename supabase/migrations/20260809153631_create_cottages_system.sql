/*
# Add Cottages Booking System

This migration creates a full cottage booking system that mirrors the existing rooms system.
Cottages can be individually numbered, priced, and have reference images — just like rooms.
Customers can rent/book cottages for date ranges, and the booking flows through the existing
bookings table with a new 'cottage' booking type.

## Changes:

### 1. New Table: `cottages`
- `id` (uuid, primary key)
- `cottage_number` (text, unique) — the cottage identifier (e.g., "C1", "C2")
- `name` (text) — display name for the cottage
- `description` (text, optional) — description of the cottage
- `price_per_night` (numeric) — nightly rental rate
- `capacity` (integer) — maximum guests
- `status` (text) — 'available', 'reserved', 'occupied', 'maintenance'
- `image_url` (text, optional) — reference image URL
- `created_at`, `updated_at` (timestamps)

### 2. Modified Table: `bookings`
- Added `booking_type` CHECK constraint to include 'cottage' (was 'room' | 'event')
- Added `cottage_id` (uuid, nullable, FK to cottages, ON DELETE SET NULL)
- Added `cottage_number` (text, nullable) — denormalized for quick display
- Added index on `cottage_id`

### 3. Security
- RLS enabled on `cottages` with full anon+authenticated CRUD (shared data model, same as rooms)
- Existing bookings policies already cover anon+authenticated CRUD; the new columns
  inherit those policies automatically.

### 4. Default Data
- Inserts 2 sample cottages so the UI is not empty on first load.
*/

-- ============================================
-- COTTAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS cottages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cottage_number text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  price_per_night numeric NOT NULL DEFAULT 0,
  capacity integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'occupied', 'maintenance')),
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE cottages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_cottages" ON cottages;
CREATE POLICY "anon_select_cottages" ON cottages FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_cottages" ON cottages;
CREATE POLICY "anon_insert_cottages" ON cottages FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_cottages" ON cottages;
CREATE POLICY "anon_update_cottages" ON cottages FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_cottages" ON cottages;
CREATE POLICY "anon_delete_cottages" ON cottages FOR DELETE TO anon, authenticated USING (true);

-- ============================================
-- ADD COTTAGE COLUMNS TO BOOKINGS
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'cottage_id') THEN
    ALTER TABLE bookings ADD COLUMN cottage_id uuid REFERENCES cottages(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'cottage_number') THEN
    ALTER TABLE bookings ADD COLUMN cottage_number text;
  END IF;
END $$;

-- Update the booking_type CHECK constraint to include 'cottage'
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'bookings' AND constraint_name = 'bookings_booking_type_check'
  ) THEN
    ALTER TABLE bookings DROP CONSTRAINT bookings_booking_type_check;
  END IF;
END $$;

ALTER TABLE bookings ADD CONSTRAINT bookings_booking_type_check
  CHECK (booking_type IN ('room', 'event', 'cottage'));

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_bookings_cottage_id ON bookings(cottage_id);
CREATE INDEX IF NOT EXISTS idx_cottages_status ON cottages(status);

-- ============================================
-- TRIGGER
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_cottages_updated_at') THEN
    CREATE TRIGGER update_cottages_updated_at BEFORE UPDATE ON cottages
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- ============================================
-- DEFAULT DATA
-- ============================================
INSERT INTO cottages (cottage_number, name, description, price_per_night, capacity, status, image_url) VALUES
  ('C1', 'Cottage 1', 'Cozy private cottage near the pool', 800, 6, 'available', 'https://images.pexels.com/photos/803975/pexels-photo-803975.jpeg'),
  ('C2', 'Cottage 2', 'Spacious family cottage with garden view', 1200, 10, 'available', 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg')
ON CONFLICT (cottage_number) DO NOTHING;
