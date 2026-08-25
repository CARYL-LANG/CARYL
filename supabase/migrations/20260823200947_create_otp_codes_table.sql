CREATE TABLE IF NOT EXISTS otp_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  code text NOT NULL,
  account_type text NOT NULL,
  expires_at timestamptz NOT NULL,
  used boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE otp_codes ENABLE ROW LEVEL SECURITY;

-- Only the service role (edge functions) should access this table.
-- Deny all access to authenticated and anon roles.
CREATE POLICY "deny_select_otp" ON otp_codes FOR SELECT
  TO authenticated USING (false);
CREATE POLICY "deny_insert_otp" ON otp_codes FOR INSERT
  TO authenticated WITH CHECK (false);
CREATE POLICY "deny_update_otp" ON otp_codes FOR UPDATE
  TO authenticated USING (false);
CREATE POLICY "deny_delete_otp" ON otp_codes FOR DELETE
  TO authenticated USING (false);

CREATE INDEX idx_otp_codes_email ON otp_codes (email);
CREATE INDEX idx_otp_codes_expires ON otp_codes (expires_at);
