
CREATE TABLE IF NOT EXISTS food_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES bookings(id) ON DELETE SET NULL,
  event_booking_id uuid REFERENCES event_bookings(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'served', 'cancelled')),
  total_price numeric DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE food_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "fo_sel" ON food_orders;
CREATE POLICY "fo_sel" ON food_orders FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "fo_ins" ON food_orders;
CREATE POLICY "fo_ins" ON food_orders FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "fo_upd" ON food_orders;
CREATE POLICY "fo_upd" ON food_orders FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "fo_del" ON food_orders;
CREATE POLICY "fo_del" ON food_orders FOR DELETE TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS food_order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  food_order_id uuid NOT NULL REFERENCES food_orders(id) ON DELETE CASCADE,
  menu_item_id uuid REFERENCES food_menu_items(id) ON DELETE SET NULL,
  menu_item_name text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric NOT NULL DEFAULT 0,
  subtotal numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE food_order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "foi_sel" ON food_order_items;
CREATE POLICY "foi_sel" ON food_order_items FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "foi_ins" ON food_order_items;
CREATE POLICY "foi_ins" ON food_order_items FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "foi_upd" ON food_order_items;
CREATE POLICY "foi_upd" ON food_order_items FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "foi_del" ON food_order_items;
CREATE POLICY "foi_del" ON food_order_items FOR DELETE TO anon, authenticated USING (true);
