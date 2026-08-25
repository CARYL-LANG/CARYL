/*
# Add middle_initial column to staff_accounts

1. Modified Tables
- `staff_accounts`: add `middle_initial` (text, nullable) to support a middle initial field in the user edit form.
2. Security
- No RLS policy changes. Existing policies remain in effect.
*/

ALTER TABLE staff_accounts
  ADD COLUMN IF NOT EXISTS middle_initial text;
