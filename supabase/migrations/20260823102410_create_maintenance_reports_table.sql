
CREATE TABLE IF NOT EXISTS maintenance_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_type text NOT NULL CHECK (item_type IN ('room', 'facility')),
  item_id text,
  item_name text NOT NULL,
  reported_by text,
  reporter_name text,
  issue_description text NOT NULL,
  status text NOT NULL DEFAULT 'reported' CHECK (status IN ('reported', 'in-progress', 'resolved')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE maintenance_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "mr_sel" ON maintenance_reports;
CREATE POLICY "mr_sel" ON maintenance_reports FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "mr_ins" ON maintenance_reports;
CREATE POLICY "mr_ins" ON maintenance_reports FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "mr_upd" ON maintenance_reports;
CREATE POLICY "mr_upd" ON maintenance_reports FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "mr_del" ON maintenance_reports;
CREATE POLICY "mr_del" ON maintenance_reports FOR DELETE TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_mr_status ON maintenance_reports(status);
CREATE INDEX IF NOT EXISTS idx_mr_item ON maintenance_reports(item_type, item_id);
