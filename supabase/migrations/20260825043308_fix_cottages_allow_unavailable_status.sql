-- The cottages status CHECK constraint only allowed 'available', 'reserved', 'occupied', 'maintenance'.
-- The admin form lets users set status to 'unavailable', which was rejected by the database,
-- causing the cottage save to fail.
ALTER TABLE cottages DROP CONSTRAINT IF EXISTS cottages_status_check;
ALTER TABLE cottages ADD CONSTRAINT cottages_status_check
  CHECK (status IN ('available', 'reserved', 'occupied', 'maintenance', 'unavailable'));