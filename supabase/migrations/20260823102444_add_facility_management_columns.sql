/*
# Add Facility and Service Management Columns

1. New Columns on `services`
- `duration_hours` (integer, nullable) — rental duration in hours for videoke units (5.2.2)
- `operating_hours` (text, nullable) — operating hours for swimming pool / facility (5.1.2 / 5.1.3)

2. New Columns on `event_type_prices`
- `capacity` (integer, nullable) — maximum guest capacity for function hall events (5.3.2)

3. New Columns on `food_menu_items`
- `package_items` (text, nullable) — JSON-encoded array of included item names for food packages (5.4.3)

4. Security
- No new tables; existing RLS policies cover the new columns (they inherit table-level policies).
*/

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'duration_hours') THEN
    ALTER TABLE services ADD COLUMN duration_hours integer;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'operating_hours') THEN
    ALTER TABLE services ADD COLUMN operating_hours text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'event_type_prices' AND column_name = 'capacity') THEN
    ALTER TABLE event_type_prices ADD COLUMN capacity integer;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'food_menu_items' AND column_name = 'package_items') THEN
    ALTER TABLE food_menu_items ADD COLUMN package_items text;
  END IF;
END $$;
