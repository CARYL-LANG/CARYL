/*
# Add facility management columns

1. Changes to `services` table
- `duration_hours` (integer, nullable) — rental duration in hours for videoke
- `operating_hours` (text, nullable) — operating hours string for swimming pool

2. Changes to `event_type_prices` table
- `capacity` (integer, nullable) — max guest capacity for an event type

3. Changes to `food_menu_items` table
- `package_items` (text, nullable) — JSON array of item names included in a food package

4. Security
- No RLS policy changes. Existing policies remain in effect.
*/

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'duration_hours') THEN
    ALTER TABLE services ADD COLUMN duration_hours integer;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'operating_hours') THEN
    ALTER TABLE services ADD COLUMN operating_hours text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'event_type_prices' AND column_name = 'capacity') THEN
    ALTER TABLE event_type_prices ADD COLUMN capacity integer;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'food_menu_items' AND column_name = 'package_items') THEN
    ALTER TABLE food_menu_items ADD COLUMN package_items text;
  END IF;
END $$;
