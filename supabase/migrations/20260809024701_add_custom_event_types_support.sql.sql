/*
# Add custom event type support

1. Modified Tables
- `event_type_prices`: Added `name` (text) and `description` (text) columns to support custom event types
  beyond the original hardcoded birthday/wedding/normal trio.

2. Data Migration
- Backfills `name` and `description` for the three existing event types (birthday, wedding, normal)
  so they display properly after the column addition.

3. Security
- No policy changes needed; existing anon/authenticated CRUD policies on `event_type_prices` 
  already allow full access (single-tenant app pattern).
*/

ALTER TABLE event_type_prices
  ADD COLUMN IF NOT EXISTS name text,
  ADD COLUMN IF NOT EXISTS description text;

UPDATE event_type_prices SET name = 'Birthday Party', description = 'Celebrate with us! Perfect for your special day' WHERE event_type = 'birthday' AND name IS NULL;
UPDATE event_type_prices SET name = 'Wedding', description = 'Make your dream wedding a reality' WHERE event_type = 'wedding' AND name IS NULL;
UPDATE event_type_prices SET name = 'Normal Event', description = 'Corporate events, seminars, gatherings' WHERE event_type = 'normal' AND name IS NULL;
