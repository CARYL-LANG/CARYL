-- Demo customer account
INSERT INTO customers (id, first_name, last_name, email, phone, password_hash)
VALUES (
  'd1e00000-0000-0000-0000-000000000001',
  'Demo',
  'Customer',
  'demo.customer@gmail.com',
  '+639170000001',
  'demo123'
)
ON CONFLICT (id) DO NOTHING;

-- Demo staff account
INSERT INTO staff_accounts (id, first_name, last_name, email, phone, position, status, join_date, password_hash)
VALUES (
  'd1e00000-0000-0000-0000-000000000002',
  'Demo',
  'Staff',
  'demo.staff@gmail.com',
  '+639170000002',
  'Receptionist',
  'active',
  '2026-01-01',
  'demo123'
)
ON CONFLICT (id) DO NOTHING;

-- Demo bookings for the demo customer (various statuses)
-- 1. Checked-in room booking (currently staying) - Room 101
INSERT INTO bookings (
  id, guest_name, guest_email, guest_phone, booking_type,
  room_id, room_number, check_in_date, check_out_date,
  status, total_price, number_of_guests,
  payment_method, payment_reference, payment_status,
  checked_in_at, created_by, created_at
) VALUES (
  'd1e00000-0000-0000-0000-000000000010',
  'Demo Customer', 'demo.customer@gmail.com', '+639170000001', 'room',
  'ef7546ef-deb7-4d68-9ba1-890c1d3756a3', '101',
  '2026-08-08', '2026-08-11',
  'checked-in', 4500, 2,
  'counter', 'DEMO-CHECKIN-001', 'completed',
  '2026-08-08T14:00:00Z', 'customer', '2026-08-01T10:00:00Z'
)
ON CONFLICT (id) DO NOTHING;

-- 2. Checked-out room booking (past stay) - Room 102
INSERT INTO bookings (
  id, guest_name, guest_email, guest_phone, booking_type,
  room_id, room_number, check_in_date, check_out_date,
  status, total_price, number_of_guests,
  payment_method, payment_reference, payment_status,
  checked_in_at, checked_out_at, created_by, created_at
) VALUES (
  'd1e00000-0000-0000-0000-000000000011',
  'Demo Customer', 'demo.customer@gmail.com', '+639170000001', 'room',
  '39455381-5660-4850-9f4d-a6db9b968e08', '102',
  '2026-07-20', '2026-07-23',
  'checked-out', 6000, 2,
  'gcash', 'DEMO-CHECKOUT-001', 'completed',
  '2026-07-20T15:00:00Z', '2026-07-23T11:00:00Z', 'customer', '2026-07-15T09:00:00Z'
)
ON CONFLICT (id) DO NOTHING;

-- 3. Confirmed cottage booking (upcoming) - Cottage C1
INSERT INTO bookings (
  id, guest_name, guest_email, guest_phone, booking_type,
  cottage_id, cottage_number, check_in_date, check_out_date,
  status, total_price, number_of_guests,
  payment_method, payment_reference, payment_status,
  created_by, created_at
) VALUES (
  'd1e00000-0000-0000-0000-000000000012',
  'Demo Customer', 'demo.customer@gmail.com', '+639170000001', 'cottage',
  'a5ef7197-f89e-4e79-b4ce-bf2d1d11295a', 'C1',
  '2026-08-15', '2026-08-17',
  'confirmed', 3000, 4,
  'counter', 'DEMO-COTTAGE-001', 'completed',
  'customer', '2026-08-05T08:00:00Z'
)
ON CONFLICT (id) DO NOTHING;

-- 4. Pending room booking (awaiting confirmation) - Room 201
INSERT INTO bookings (
  id, guest_name, guest_email, guest_phone, booking_type,
  room_id, room_number, check_in_date, check_out_date,
  status, total_price, number_of_guests,
  payment_method, payment_reference, payment_status,
  created_by, created_at
) VALUES (
  'd1e00000-0000-0000-0000-000000000013',
  'Demo Customer', 'demo.customer@gmail.com', '+639170000001', 'room',
  '3ecd70ef-b7cf-4437-ad8d-fc7361f670f9', '201',
  '2026-08-25', '2026-08-28',
  'pending', 9000, 3,
  'gcash', 'DEMO-PENDING-001', 'pending',
  'customer', '2026-08-09T12:00:00Z'
)
ON CONFLICT (id) DO NOTHING;

-- 5. Cancelled room booking - Room 202
INSERT INTO bookings (
  id, guest_name, guest_email, guest_phone, booking_type,
  room_id, room_number, check_in_date, check_out_date,
  status, total_price, number_of_guests,
  payment_method, payment_reference, payment_status,
  created_by, created_at
) VALUES (
  'd1e00000-0000-0000-0000-000000000014',
  'Demo Customer', 'demo.customer@gmail.com', '+639170000001', 'room',
  'ce7d1873-b2e8-4360-a8af-c3c5f63c8cd0', '202',
  '2026-06-10', '2026-06-12',
  'cancelled', 3000, 1,
  'counter', 'DEMO-CANCEL-001', 'cancelled',
  'customer', '2026-06-01T10:00:00Z'
)
ON CONFLICT (id) DO NOTHING;

-- Demo event booking (confirmed) for the demo customer
INSERT INTO event_bookings (
  id, guest_name, guest_email, guest_phone,
  event_type, event_name, event_date, event_end_date,
  status, base_price, total_price, number_of_guests,
  service_ids, selected_rooms,
  payment_method, payment_reference, payment_status,
  created_at
) VALUES (
  'd1e00000-0000-0000-0000-000000000020',
  'Demo Customer', 'demo.customer@gmail.com', '+639170000001',
  'birthday', 'Demo Birthday Celebration',
  '2026-08-30', '2026-08-30',
  'confirmed', 5000, 5000, 50,
  '{}', '{}',
  'counter', 'DEMO-EVENT-001', 'completed',
  '2026-08-07T10:00:00Z'
)
ON CONFLICT (id) DO NOTHING;

-- Update room statuses to reflect the checked-in and confirmed/pending bookings
UPDATE rooms SET status = 'occupied'
WHERE id = 'ef7546ef-deb7-4d68-9ba1-890c1d3756a3'; -- Room 101 (checked-in)

UPDATE rooms SET status = 'reserved'
WHERE id IN (
  'a5ef7197-f89e-4e79-b4ce-bf2d1d11295a' -- not a room, skip
);

-- Room 201 is pending so keep it available (pending doesn't reserve yet)
-- Cottage C1 is confirmed -> set to reserved
UPDATE cottages SET status = 'reserved'
WHERE id = 'a5ef7197-f89e-4e79-b4ce-bf2d1d11295a'; -- Cottage C1 (confirmed booking)
