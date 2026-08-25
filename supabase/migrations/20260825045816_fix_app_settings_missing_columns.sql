/*
# Fix app_settings missing columns

The `app_settings` table is missing several columns that the app tries to update
when saving business info (including the Function Hall image). When the admin
saves the Function Hall photo, the app calls `setBusinessInfo` which issues an
UPDATE referencing `admin_name`, `check_in_time`, `check_out_time`,
`cancellation_policy`, and `pool_operating_hours`. Since those columns don't
exist in the live database, the UPDATE fails with "column does not exist" —
surfaced as "Unknown error" in the UI.

This migration adds all five missing columns as nullable text.

## Security
- No new tables. RLS already enabled on `app_settings`. No policy changes.
*/

ALTER TABLE app_settings ADD COLUMN IF NOT EXISTS admin_name text;
ALTER TABLE app_settings ADD COLUMN IF NOT EXISTS check_in_time text;
ALTER TABLE app_settings ADD COLUMN IF NOT EXISTS check_out_time text;
ALTER TABLE app_settings ADD COLUMN IF NOT EXISTS cancellation_policy text;
ALTER TABLE app_settings ADD COLUMN IF NOT EXISTS pool_operating_hours text;
