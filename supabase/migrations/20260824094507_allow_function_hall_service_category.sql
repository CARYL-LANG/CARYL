/*
# Allow Function Hall services

1. Modified Table
- `services`
  - Replace the outdated `services_category_check` rule so `category` accepts
    `function-hall` in addition to the existing swimming-pool, videoke,
    cottages, and foods values.

2. Security
- No RLS policies or permissions are changed.

3. Data Safety
- No rows, columns, or tables are removed.
- Existing service categories remain valid and unchanged.
*/

ALTER TABLE services
  DROP CONSTRAINT IF EXISTS services_category_check;

ALTER TABLE services
  ADD CONSTRAINT services_category_check
  CHECK (category IN ('swimming-pool', 'videoke', 'cottages', 'foods', 'function-hall'));
