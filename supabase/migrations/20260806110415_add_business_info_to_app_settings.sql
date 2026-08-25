/*
# Add business information fields to app_settings

1. Modified Tables
- `app_settings`: adds 5 new nullable text columns to store the business owner's profile information.
  - `owner_name` (text) — name of the business owner
  - `fb_link` (text) — Facebook page/profile URL
  - `business_permit_url` (text) — URL to the uploaded business permit image (stored in Supabase Storage)
  - `contact_number` (text) — contact phone number
  - `location` (text) — physical location/address of the business

2. Security
- No policy changes. `app_settings` already has anon+authenticated SELECT/INSERT/UPDATE policies with USING (true) since this is a single-tenant app without sign-in-scoped ownership.
- The new columns inherit the existing column-level privileges (all columns are updatable/insertable by anon and authenticated).

3. Notes
- All new columns are nullable so existing rows remain valid without backfill.
- The business permit image is uploaded to Supabase Storage and its public URL is stored in `business_permit_url`.
*/