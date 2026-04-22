
-- Election report status enum (3-step workflow)
DO $$ BEGIN
  CREATE TYPE public.election_report_status AS ENUM ('pending', 'flagged', 'verified', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Election type enum
DO $$ BEGIN
  CREATE TYPE public.election_type AS ENUM (
    'presidential',
    'gubernatorial',
    'senate',
    'house_of_reps',
    'house_of_assembly',
    'councillor',
    'chairman',
    'party_primary'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Main table
CREATE TABLE IF NOT EXISTS public.election_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID NOT NULL,
  election_type public.election_type NOT NULL,
  election_date DATE NOT NULL,
  state TEXT NOT NULL DEFAULT 'Plateau',
  lga TEXT NOT NULL,
  ward TEXT NOT NULL,
  polling_unit TEXT NOT NULL,
  party TEXT,
  candidate_name TEXT,
  votes_recorded INTEGER NOT NULL DEFAULT 0,
  total_votes_cast INTEGER,
  registered_voters INTEGER,
  ec8a_url TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  notes TEXT,
  status public.election_report_status NOT NULL DEFAULT 'pending',
  verified_by UUID,
  verified_at TIMESTAMPTZ,
  rejection_reason TEXT,
  flagged_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_election_reports_status ON public.election_reports(status);
CREATE INDEX IF NOT EXISTS idx_election_reports_agent ON public.election_reports(agent_id);
CREATE INDEX IF NOT EXISTS idx_election_reports_ward ON public.election_reports(state, lga, ward);
CREATE INDEX IF NOT EXISTS idx_election_reports_type_date ON public.election_reports(election_type, election_date);

-- Enable RLS
ALTER TABLE public.election_reports ENABLE ROW LEVEL SECURITY;

-- Agents: insert own reports
CREATE POLICY "Agents can submit own reports"
ON public.election_reports
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'agent'::app_role) AND auth.uid() = agent_id);

-- Agents: view own submissions
CREATE POLICY "Agents can view own reports"
ON public.election_reports
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'agent'::app_role) AND auth.uid() = agent_id);

-- Agents: update own pending reports (resubmit edits before verification)
CREATE POLICY "Agents can update own pending reports"
ON public.election_reports
FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'agent'::app_role)
  AND auth.uid() = agent_id
  AND status IN ('pending', 'flagged')
);

-- Admins: full management
CREATE POLICY "Admins manage all election reports"
ON public.election_reports
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Super admins: full management
CREATE POLICY "Super admins manage all election reports"
ON public.election_reports
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::app_role));

-- Authenticated users: view verified reports only (for Enter Room)
CREATE POLICY "Authenticated users view verified reports"
ON public.election_reports
FOR SELECT
TO authenticated
USING (status = 'verified');

-- Updated_at trigger
DROP TRIGGER IF EXISTS update_election_reports_updated_at ON public.election_reports;
CREATE TRIGGER update_election_reports_updated_at
BEFORE UPDATE ON public.election_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for EC8-A evidence (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('election-evidence', 'election-evidence', false)
ON CONFLICT (id) DO NOTHING;

-- Agents can upload their own evidence (folder = their user id)
CREATE POLICY "Agents upload own evidence"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'election-evidence'
  AND public.has_role(auth.uid(), 'agent'::app_role)
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Agents can view their own evidence
CREATE POLICY "Agents view own evidence"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'election-evidence'
  AND public.has_role(auth.uid(), 'agent'::app_role)
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Admins view all evidence
CREATE POLICY "Admins view all election evidence"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'election-evidence'
  AND public.has_role(auth.uid(), 'admin'::app_role)
);

-- Super admins manage all evidence
CREATE POLICY "Super admins manage all election evidence"
ON storage.objects
FOR ALL
TO authenticated
USING (
  bucket_id = 'election-evidence'
  AND public.has_role(auth.uid(), 'super_admin'::app_role)
)
WITH CHECK (
  bucket_id = 'election-evidence'
  AND public.has_role(auth.uid(), 'super_admin'::app_role)
);
