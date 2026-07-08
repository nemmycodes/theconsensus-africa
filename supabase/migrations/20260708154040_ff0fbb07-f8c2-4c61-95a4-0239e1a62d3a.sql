
-- analytics_events
CREATE TABLE public.analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type text NOT NULL DEFAULT 'pageview',
  path text,
  referrer text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_term text,
  utm_content text,
  device_type text,
  browser text,
  os text,
  screen_size text,
  language text,
  user_agent text,
  ip_address text,
  country text,
  country_code text,
  region text,
  city text,
  latitude double precision,
  longitude double precision,
  timezone text,
  isp text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.analytics_events TO authenticated;
GRANT INSERT ON public.analytics_events TO anon, authenticated;
GRANT ALL ON public.analytics_events TO service_role;

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can log analytics events"
  ON public.analytics_events FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Super admins can view all analytics"
  ON public.analytics_events FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'::app_role));

CREATE INDEX idx_analytics_events_created_at ON public.analytics_events(created_at DESC);
CREATE INDEX idx_analytics_events_visitor_id ON public.analytics_events(visitor_id);
CREATE INDEX idx_analytics_events_country ON public.analytics_events(country);
CREATE INDEX idx_analytics_events_path ON public.analytics_events(path);

-- failed_signups
CREATE TABLE public.failed_signups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text,
  attempted_full_name text,
  error_code text,
  error_message text,
  visitor_id text,
  ip_address text,
  user_agent text,
  device_type text,
  browser text,
  os text,
  country text,
  country_code text,
  region text,
  city text,
  latitude double precision,
  longitude double precision,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.failed_signups TO anon, authenticated;
GRANT SELECT ON public.failed_signups TO authenticated;
GRANT ALL ON public.failed_signups TO service_role;

ALTER TABLE public.failed_signups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can log failed signups"
  ON public.failed_signups FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Super admins can view failed signups"
  ON public.failed_signups FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'::app_role));

CREATE INDEX idx_failed_signups_created_at ON public.failed_signups(created_at DESC);

-- visitor_sessions
CREATE TABLE public.visitor_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id text NOT NULL UNIQUE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  first_seen_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  visit_count integer NOT NULL DEFAULT 1,
  first_referrer text,
  first_utm_source text,
  first_utm_campaign text,
  last_country text,
  last_city text,
  last_latitude double precision,
  last_longitude double precision,
  last_device_type text,
  last_browser text,
  last_os text,
  last_ip text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT, UPDATE ON public.visitor_sessions TO anon, authenticated;
GRANT SELECT ON public.visitor_sessions TO authenticated;
GRANT ALL ON public.visitor_sessions TO service_role;

ALTER TABLE public.visitor_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can upsert visitor sessions"
  ON public.visitor_sessions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update own visitor session"
  ON public.visitor_sessions FOR UPDATE
  TO anon, authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Super admins can view visitor sessions"
  ON public.visitor_sessions FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'::app_role));

CREATE INDEX idx_visitor_sessions_last_seen ON public.visitor_sessions(last_seen_at DESC);

CREATE TRIGGER trg_visitor_sessions_updated
  BEFORE UPDATE ON public.visitor_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
