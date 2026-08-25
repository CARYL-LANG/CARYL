
CREATE TABLE IF NOT EXISTS facility_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_type text NOT NULL CHECK (facility_type IN ('swimming-pool', 'videoke')),
  facility_id uuid REFERENCES services(id) ON DELETE SET NULL,
  guest_name text NOT NULL,
  guest_email text NOT NULL,
  guest_phone text,
  booking_date date NOT NULL,
  start_time time,
  end_time time,
  number_of_guests integer DEFAULT 1,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  total_price numeric DEFAULT 0,
  payment_method text,
  payment_reference text,
  payment_status text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE facility_bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "fb_sel" ON facility_bookings;
CREATE POLICY "fb_sel" ON facility_bookings FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "fb_ins" ON facility_bookings;
CREATE POLICY "fb_ins" ON facility_bookings FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "fb_upd" ON facility_bookings;
CREATE POLICY "fb_upd" ON facility_bookings FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "fb_del" ON facility_bookings;
CREATE POLICY "fb_del" ON facility_bookings FOR DELETE TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_fb_type_date ON facility_bookings(facility_type, booking_date);
