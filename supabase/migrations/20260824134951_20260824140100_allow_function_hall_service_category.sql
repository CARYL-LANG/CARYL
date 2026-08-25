/*
# Allow function-hall as a service category

The services table had a CHECK constraint that only allowed
swimming-pool, videoke, cottages, and foods. The app uses
'function-hall' as a category for Function Hall services, which
was rejected by the constraint — causing "Add service" to fail
in the Function Hall tab.
*/

ALTER TABLE services DROP CONSTRAINT IF EXISTS services_category_check;

ALTER TABLE services
  ADD CONSTRAINT services_category_check
  CHECK (category = ANY (ARRAY['swimming-pool', 'videoke', 'cottages', 'foods', 'function-hall', 'food']));