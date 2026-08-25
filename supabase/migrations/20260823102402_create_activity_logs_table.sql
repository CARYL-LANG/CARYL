
CREATE TABLE IF NOT EXISTS activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text,
  user_name text,
  user_role text CHECK (user_role IS NULL OR user_role IN ('admin', 'staff', 'customer')),
  action text NOT NULL,
  entity_type text,
  entity_id text,
  details text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "al_sel" ON activity_logs;
CREATE POLICY "al_sel" ON activity_logs FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "al_ins" ON activity_logs;
CREATE POLICY "al_ins" ON activity_logs FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "al_upd" ON activity_logs;
CREATE POLICY "al_upd" ON activity_logs FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "al_del" ON activity_logs;
CREATE POLICY "al_del" ON activity_logs FOR DELETE TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_al_created ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_al_user ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_al_action ON activity_logs(action);
