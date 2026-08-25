/*
# Add function hall cover image to app_settings

1. Modified Tables
- `app_settings`
  - Add `function_hall_image_url` (text, nullable) — stores the cover image URL
    for the Function Hall section of the Facilities & Services admin page.
2. Security
- No new tables. Existing RLS on `app_settings` is unchanged.
3. Notes
- The cover image is uploaded to the existing `facility-service-images` storage
  bucket and its public URL is stored in this column.
- When a cover image is set, the Function Hall tab shows it as a full-width
  banner; clicking the banner reveals the individual hall services below.
*/

ALTER TABLE app_settings
  ADD COLUMN IF NOT EXISTS function_hall_image_url text;
