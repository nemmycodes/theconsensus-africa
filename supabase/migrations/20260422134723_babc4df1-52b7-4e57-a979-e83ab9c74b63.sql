-- Create application status enum
DO $$ BEGIN
  CREATE TYPE public.recruitment_status AS ENUM ('pending', 'approved', 'rejected', 'shortlisted');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Main table
CREATE TABLE IF NOT EXISTS public.agent_recruitment_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  lga TEXT NOT NULL,
  ward TEXT NOT NULL,
  polling_unit TEXT NOT NULL,
  agent_type TEXT NOT NULL,
  available_voting_period BOOLEAN NOT NULL DEFAULT false,
  available_counting BOOLEAN NOT NULL DEFAULT false,
  has_previous_experience BOOLEAN NOT NULL DEFAULT false,
  experience_details TEXT,
  attended_inec_training BOOLEAN NOT NULL DEFAULT false,
  training_date DATE,
  id_proof_type TEXT,
  id_proof_url TEXT NOT NULL,
  declaration_signature TEXT NOT NULL,
  declaration_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status public.recruitment_status NOT NULL DEFAULT 'pending',
  review_notes TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.agent_recruitment_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit recruitment application"
  ON public.agent_recruitment_applications FOR INSERT
  TO public WITH CHECK (true);

CREATE POLICY "Admins can view recruitment applications"
  ON public.agent_recruitment_applications FOR SELECT
  TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update recruitment applications"
  ON public.agent_recruitment_applications FOR UPDATE
  TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete recruitment applications"
  ON public.agent_recruitment_applications FOR DELETE
  TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Super admins manage recruitment applications"
  ON public.agent_recruitment_applications FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

CREATE TRIGGER update_recruitment_apps_updated_at
  BEFORE UPDATE ON public.agent_recruitment_applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Private bucket for ID uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('agent-recruitment-ids', 'agent-recruitment-ids', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can upload recruitment ID"
  ON storage.objects FOR INSERT
  TO public
  WITH CHECK (bucket_id = 'agent-recruitment-ids');

CREATE POLICY "Admins can view recruitment IDs"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'agent-recruitment-ids' AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role)));

CREATE POLICY "Admins can delete recruitment IDs"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'agent-recruitment-ids' AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role)));