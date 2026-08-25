
CREATE TABLE IF NOT EXISTS food_menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL DEFAULT 'meal' CHECK (category IN ('meal', 'snack', 'beverage', 'dessert', 'package')),
  description text,
  price numeric NOT NULL DEFAULT 0,
  available boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE food_menu_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "fmi_sel" ON food_menu_items;
CREATE POLICY "fmi_sel" ON food_menu_items FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "fmi_ins" ON food_menu_items;
CREATE POLICY "fmi_ins" ON food_menu_items FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "fmi_upd" ON food_menu_items;
CREATE POLICY "fmi_upd" ON food_menu_items FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "fmi_del" ON food_menu_items;
CREATE POLICY "fmi_del" ON food_menu_items FOR DELETE TO anon, authenticated USING (true);
