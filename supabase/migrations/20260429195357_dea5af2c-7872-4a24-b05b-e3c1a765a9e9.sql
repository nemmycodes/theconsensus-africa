
-- Extend agent_recruitment_applications with extra fields for spec alignment
ALTER TABLE public.agent_recruitment_applications
  ADD COLUMN IF NOT EXISTS agent_sub_role text,
  ADD COLUMN IF NOT EXISTS aspirant_level text,
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS date_of_birth date,
  ADD COLUMN IF NOT EXISTS place_of_birth text,
  ADD COLUMN IF NOT EXISTS state_of_origin text,
  ADD COLUMN IF NOT EXISTS highest_qualification text,
  ADD COLUMN IF NOT EXISTS institution text,
  ADD COLUMN IF NOT EXISTS qualification_year integer,
  ADD COLUMN IF NOT EXISTS party_membership_number text;

-- Create volunteer registrations table
CREATE TABLE IF NOT EXISTS public.volunteer_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  full_name text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  lga text NOT NULL,
  ward text,
  availability_areas text[] NOT NULL DEFAULT '{}',
  availability_other text,
  availability_hours_per_week integer,
  skills text[] NOT NULL DEFAULT '{}',
  skills_other text,
  motivation text,
  candidates_supporting text,
  previous_experience text,
  relevant_skills text,
  declaration_signature text NOT NULL,
  declaration_date date NOT NULL DEFAULT CURRENT_DATE,
  status text NOT NULL DEFAULT 'pending',
  review_notes text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.volunteer_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit volunteer registration"
  ON public.volunteer_registrations FOR INSERT
  TO public WITH CHECK (true);

CREATE POLICY "Authed insert own volunteer registration"
  ON public.volunteer_registrations FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users view own volunteer registration"
  ON public.volunteer_registrations FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins view volunteer registrations"
  ON public.volunteer_registrations FOR SELECT
  TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins update volunteer registrations"
  ON public.volunteer_registrations FOR UPDATE
  TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Super admins manage volunteer registrations"
  ON public.volunteer_registrations FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

CREATE TRIGGER update_volunteer_registrations_updated_at
  BEFORE UPDATE ON public.volunteer_registrations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
