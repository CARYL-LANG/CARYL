/*
# Add Facility, Food Service, Activity Log, and Maintenance Tables

## Purpose
Support the Swimming Pool, Videoke, and Food Service facility modules,
activity logging for audit, and room maintenance reporting — all required
by the LOM but not yet present in the system.

## New Tables

1. `facility_bookings` — bookings for swimming pool and videoke facilities
   - id (uuid PK)
   - facility_type ('swimming-pool' | 'videoke')
   - facility_id (uuid, references services table)
   - guest_name, guest_email, guest_phone
   - booking_date (date)
   - start_time, end_time (time)
   - number_of_guests (int)
   - status ('pending' | 'confirmed' | 'cancelled' | 'completed')
   - total_price (numeric)
   - payment_method, payment_reference, payment_status
   - created_at, updated_at

2. `food_menu_items` — food items available for ordering
   - id (uuid PK)
   - name (text)
   - category (text: 'meal' | 'snack' | 'beverage' | 'dessert' | 'package')
   - description (text)
   - price (numeric)
   - available (boolean, default true)
   - created_at, updated_at

3. `food_orders` — food orders linked to bookings
   - id (uuid PK)
   - booking_id (uuid, nullable, references bookings)
   - event_booking_id (uuid, nullable, references event_bookings)
   - customer_name (text)
   - status ('pending' | 'preparing' | 'served' | 'cancelled')
   - total_price (numeric)
   - notes (text, nullable)
   - created_at, updated_at

4. `food_order_items` — line items in a food order
   - id (uuid PK)
   - food_order_id (uuid, references food_orders, cascade delete)
   - menu_item_id (uuid, references food_menu_items)
   - menu_item_name (text)
   - quantity (int)
   - unit_price (numeric)
   - subtotal (numeric)

5. `activity_logs` — audit trail for all user actions
   - id (uuid PK)
   - user_id (text)
   - user_name (text)
   - user_role (text: 'admin' | 'staff' | 'customer')
   - action (text)
   - entity_type (text)
   - entity_id (text, nullable)
   - details (text, nullable)
   - created_at

6. `maintenance_reports` — staff-reported room/facility maintenance issues
   - id (uuid PK)
   - item_type ('room' | 'facility')
   - item_id (text)
   - item_name (text)
   - reported_by (text)
   - reporter_name (text)
   - issue_description (text)
   - status ('reported' | 'in-progress' | 'resolved')
   - created_at, updated_at

## Security
- RLS enabled on all new tables.
- All tables use `TO anon, authenticated` with `USING (true)` because this
  app uses custom auth (customers/staff_accounts tables, not Supabase Auth),
  so the anon-key client must be able to read and write.
*/