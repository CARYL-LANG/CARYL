/*
# Fix missing function_hall_image_url column and event_type_prices DELETE policy

Two remaining issues blocking the Function Hall admin tab:

1. `app_settings.function_hall_image_url` column does not exist in the live database.
   The app saves the Function Hall cover image URL to this column. Without it,
   `UPDATE app_settings SET function_hall_image_url = ...` fails with
   "column does not exist."

2. `event_type_prices` has SELECT/INSERT/UPDATE policies for anon+authenticated
   but NO DELETE policy. Deleting an event type from the admin UI silently fails
   (RLS blocks the delete).

## Security
- No new tables. RLS already enabled on `app_settings` and `event_type_prices`.
- Adds a DELETE policy on `event_type_prices` for anon + authenticated (single-tenant app pattern, matching the existing SELECT/INSERT/UPDATE policies).
*/

-- 1. Add function_hall_image_url column to app_settings
ALTER TABLE app_settings
  ADD COLUMN IF NOT EXISTS function_hall_image_url text;

-- 2. Add DELETE policy on event_type_prices
DROP POLICY IF EXISTS "anon_delete_event_type_prices" ON event_type_prices;
CREATE POLICY "anon_delete_event_type_prices"
ON event_type_prices FOR DELETE
TO anon, authenticated
USING (true);
