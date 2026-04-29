
CREATE TABLE IF NOT EXISTS public.system_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID
);

ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authed read system settings" ON public.system_settings
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins manage system settings" ON public.system_settings
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

INSERT INTO public.system_settings (key, value) VALUES
  ('election_phase', '"voting_day"'::jsonb),
  ('security', '{"two_factor": true, "session_timeout_minutes": 30, "password_policy": "strong", "ip_whitelisting": false, "audit_logging": true}'::jsonb),
  ('notifications', '{"email": true, "sms": false, "push": true, "alert_threshold": "medium"}'::jsonb)
ON CONFLICT (key) DO NOTHING;
