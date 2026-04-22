-- Status enums
DO $$ BEGIN CREATE TYPE public.primaries_status AS ENUM ('pending','verified','not_verified'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE public.contestant_status AS ENUM ('verified','not_verified'); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Primaries collation entry (one per party primary event)
CREATE TABLE IF NOT EXISTS public.primaries_collation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  political_party TEXT NOT NULL,
  position_contested TEXT NOT NULL,
  election_date DATE NOT NULL,
  venue TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'Plateau',
  lga TEXT,
  ward TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  collation_form_url TEXT,
  exco_name TEXT NOT NULL,
  exco_position TEXT NOT NULL,
  exco_phone TEXT,
  exco_date DATE,
  total_votes INTEGER NOT NULL DEFAULT 0,
  winner_name TEXT,
  runner_up_name TEXT,
  remarks TEXT,
  status public.primaries_status NOT NULL DEFAULT 'pending',
  submitted_by UUID NOT NULL,
  verified_by UUID,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.primaries_collation ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view verified primaries"
  ON public.primaries_collation FOR SELECT TO public
  USING (status = 'verified');
CREATE POLICY "Submitters view own primaries"
  ON public.primaries_collation FOR SELECT TO authenticated
  USING (submitted_by = auth.uid());
CREATE POLICY "Agents create primaries"
  ON public.primaries_collation FOR INSERT TO authenticated
  WITH CHECK ((has_role(auth.uid(),'agent'::app_role) OR has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'super_admin'::app_role)) AND submitted_by = auth.uid());
CREATE POLICY "Submitters update own pending"
  ON public.primaries_collation FOR UPDATE TO authenticated
  USING (submitted_by = auth.uid() AND status <> 'verified');
CREATE POLICY "Admins manage primaries"
  ON public.primaries_collation FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'super_admin'::app_role))
  WITH CHECK (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'super_admin'::app_role));

CREATE TRIGGER trg_primaries_updated BEFORE UPDATE ON public.primaries_collation
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Contestants per primary
CREATE TABLE IF NOT EXISTS public.primaries_contestants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  primaries_id UUID NOT NULL REFERENCES public.primaries_collation(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  sex TEXT NOT NULL,
  votes INTEGER NOT NULL DEFAULT 0,
  status public.contestant_status NOT NULL DEFAULT 'not_verified',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.primaries_contestants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public view contestants of verified primaries"
  ON public.primaries_contestants FOR SELECT TO public
  USING (EXISTS (SELECT 1 FROM public.primaries_collation p WHERE p.id = primaries_id AND p.status = 'verified'));
CREATE POLICY "Submitters view own primary contestants"
  ON public.primaries_contestants FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.primaries_collation p WHERE p.id = primaries_id AND p.submitted_by = auth.uid()));
CREATE POLICY "Submitters insert contestants"
  ON public.primaries_contestants FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.primaries_collation p WHERE p.id = primaries_id AND p.submitted_by = auth.uid()));
CREATE POLICY "Submitters update own contestants"
  ON public.primaries_contestants FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.primaries_collation p WHERE p.id = primaries_id AND p.submitted_by = auth.uid() AND p.status <> 'verified'));
CREATE POLICY "Submitters delete own contestants"
  ON public.primaries_contestants FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.primaries_collation p WHERE p.id = primaries_id AND p.submitted_by = auth.uid() AND p.status <> 'verified'));
CREATE POLICY "Admins manage contestants"
  ON public.primaries_contestants FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'super_admin'::app_role))
  WITH CHECK (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'super_admin'::app_role));

-- Storage bucket for collation forms (private)
INSERT INTO storage.buckets (id, name, public) VALUES ('primaries-collation','primaries-collation', false) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Authed upload primaries forms"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'primaries-collation');
CREATE POLICY "Admins read primaries forms"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'primaries-collation' AND (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'super_admin'::app_role) OR has_role(auth.uid(),'agent'::app_role)));
CREATE POLICY "Admins delete primaries forms"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'primaries-collation' AND (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'super_admin'::app_role)));

-- Audit logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID,
  actor_email TEXT,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Super admins view audit logs" ON public.audit_logs FOR SELECT TO authenticated USING (has_role(auth.uid(),'super_admin'::app_role));
CREATE POLICY "Authed insert audit logs" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

-- Role permissions matrix
CREATE TABLE IF NOT EXISTS public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role public.app_role NOT NULL,
  permission TEXT NOT NULL,
  allowed BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID,
  UNIQUE (role, permission)
);
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authed read role permissions" ON public.role_permissions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Super admins manage role permissions" ON public.role_permissions FOR ALL TO authenticated
  USING (has_role(auth.uid(),'super_admin'::app_role)) WITH CHECK (has_role(auth.uid(),'super_admin'::app_role));

-- Broadcasts
CREATE TABLE IF NOT EXISTS public.broadcasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  audience TEXT NOT NULL DEFAULT 'all',
  severity TEXT NOT NULL DEFAULT 'info',
  active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.broadcasts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authed view broadcasts" ON public.broadcasts FOR SELECT TO authenticated USING (active = true);
CREATE POLICY "Public view active broadcasts" ON public.broadcasts FOR SELECT TO anon USING (active = true AND audience = 'all');
CREATE POLICY "Super admins manage broadcasts" ON public.broadcasts FOR ALL TO authenticated
  USING (has_role(auth.uid(),'super_admin'::app_role)) WITH CHECK (has_role(auth.uid(),'super_admin'::app_role));

-- Feature flags
CREATE TABLE IF NOT EXISTS public.feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flag_key TEXT NOT NULL UNIQUE,
  enabled BOOLEAN NOT NULL DEFAULT false,
  description TEXT,
  audience TEXT NOT NULL DEFAULT 'all',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID
);
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read feature flags" ON public.feature_flags FOR SELECT TO public USING (true);
CREATE POLICY "Super admins manage feature flags" ON public.feature_flags FOR ALL TO authenticated
  USING (has_role(auth.uid(),'super_admin'::app_role)) WITH CHECK (has_role(auth.uid(),'super_admin'::app_role));

CREATE TRIGGER trg_flags_updated BEFORE UPDATE ON public.feature_flags FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- API Keys
CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  prefix TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  scopes TEXT[] DEFAULT '{}',
  revoked BOOLEAN NOT NULL DEFAULT false,
  created_by UUID,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Super admins manage api keys" ON public.api_keys FOR ALL TO authenticated
  USING (has_role(auth.uid(),'super_admin'::app_role)) WITH CHECK (has_role(auth.uid(),'super_admin'::app_role));