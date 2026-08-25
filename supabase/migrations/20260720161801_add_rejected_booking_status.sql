/*
# Add 'rejected' booking status

1. Modified Tables
- `bookings`
  - The `status` column's CHECK constraint is expanded to include 'rejected'.
  - The existing values ('pending', 'confirmed', 'checked-in', 'checked-out', 'cancelled') are preserved.
  - No data is changed or deleted; existing rows remain valid under the new constraint.

2. Security
- No RLS or policy changes. Existing policies on `bookings` are unchanged.

3. Important Notes
- The constraint is replaced (DROP + ADD) because PostgreSQL has no ALTER CONSTRAINT for CHECK constraints. This is safe: the new constraint is a strict superset of the old one, so every existing row still satisfies it.
- This migration is idempotent: re-running it drops the constraint (if present) and recreates it with the full value list.
*/

ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_check;

ALTER TABLE bookings ADD CONSTRAINT bookings_status_check
  CHECK (status IN ('pending', 'confirmed', 'checked-in', 'checked-out', 'cancelled', 'rejected'));
