
CREATE TABLE public.pvc_surveys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  -- Section A
  gender text,
  age_range text,
  state_of_residence text,
  lga text,
  occupation text,
  occupation_other text,
  education text,
  -- Section B
  has_pvc text,
  pvc_status text,
  no_pvc_reasons text[],
  no_pvc_reason_other text,
  willing_to_register text,
  attempted_pvc_update text,
  pvc_challenges text[],
  pvc_challenges_other text,
  -- Section C
  voted_last_election text,
  not_vote_reason text,
  not_vote_reason_other text,
  likely_next_election text,
  encourage_participation text[],
  encourage_participation_other text,
  -- Section D
  electoral_confidence text,
  inec_rating text,
  vote_influence text,
  election_concerns text[],
  election_concerns_other text,
  reforms text[],
  reforms_other text,
  -- Section E
  preferred_party text,
  preferred_party_other text,
  preferred_president text,
  preferred_governor text,
  preferred_national_assembly text,
  candidate_qualities text[],
  candidate_qualities_other text,
  -- Section F
  nigeria_condition text,
  nigeria_challenges text[],
  nigeria_challenges_other text,
  optimism text,
  government_priority text,
  advice_leaders text,
  advice_inec text,
  other_comments text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.pvc_surveys TO authenticated;
GRANT ALL ON public.pvc_surveys TO service_role;

ALTER TABLE public.pvc_surveys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own survey"
  ON public.pvc_surveys FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own survey"
  ON public.pvc_surveys FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own survey"
  ON public.pvc_surveys FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all surveys"
  ON public.pvc_surveys FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'super_admin'::app_role));

CREATE TRIGGER update_pvc_surveys_updated_at
  BEFORE UPDATE ON public.pvc_surveys
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
