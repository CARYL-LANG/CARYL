-- Add created_by column to bookings to track who created the reservation.
-- Values: 'staff' (manual staff reservation), 'customer' (online booking), NULL (legacy).
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS created_by text DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_bookings_created_by ON bookings(created_by);
