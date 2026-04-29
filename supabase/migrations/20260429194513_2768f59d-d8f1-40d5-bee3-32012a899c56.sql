ALTER TABLE public.agent_recruitment_applications
  ADD COLUMN IF NOT EXISTS user_id uuid,
  ADD COLUMN IF NOT EXISTS position_aspired text,
  ADD COLUMN IF NOT EXISTS party_affiliation text,
  ADD COLUMN IF NOT EXISTS manifesto_summary text,
  ADD COLUMN IF NOT EXISTS prior_office_held text;

CREATE INDEX IF NOT EXISTS idx_agent_recruitment_user_id
  ON public.agent_recruitment_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_recruitment_agent_type
  ON public.agent_recruitment_applications(agent_type);

CREATE POLICY "Users can view own applications"
ON public.agent_recruitment_applications
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated can insert own applications"
ON public.agent_recruitment_applications
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);