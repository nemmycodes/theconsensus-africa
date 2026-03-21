
CREATE TABLE public.kef_cares_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  
  -- 1. Personal Information
  full_name text NOT NULL,
  gender text NOT NULL,
  date_of_birth text,
  phone_number text NOT NULL,
  whatsapp_active boolean DEFAULT false,
  email text,
  residential_address text,
  
  -- 2. Location Information
  lga text NOT NULL,
  ward text,
  polling_unit text,
  community text,
  
  -- 3. Education Profile
  highest_qualification text,
  field_of_study text,
  education_status text,
  
  -- 4. Employment & Economic Status
  economic_status text,
  occupation text,
  primary_economic_sector text,
  
  -- 5. Income & Business
  monthly_income_range text,
  owns_business text,
  business_type text,
  
  -- 6. Skills & Talents
  artisan_skills text[],
  creative_skills text[],
  professional_skills text[],
  sports_participation boolean DEFAULT false,
  sport_type text,
  
  -- 7. Programme Interest
  interest_entrepreneurship boolean DEFAULT false,
  interest_agricultural boolean DEFAULT false,
  interest_trading boolean DEFAULT false,
  interest_skills_training boolean DEFAULT false,
  interest_economic_empowerment boolean DEFAULT false,
  interest_leadership boolean DEFAULT false,
  interest_professional_networking boolean DEFAULT false,
  
  -- 8. Volunteer
  interested_in_volunteering boolean DEFAULT false,
  volunteer_role text,
  volunteer_availability text,
  
  -- 9. Consent
  consent_given boolean NOT NULL DEFAULT false
);

ALTER TABLE public.kef_cares_registrations ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a registration
CREATE POLICY "Anyone can submit kef cares registration"
ON public.kef_cares_registrations FOR INSERT TO public
WITH CHECK (true);

-- Admins can view all registrations
CREATE POLICY "Admins can view kef cares registrations"
ON public.kef_cares_registrations FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Super admins can manage all registrations
CREATE POLICY "Super admins can manage kef cares registrations"
ON public.kef_cares_registrations FOR ALL TO authenticated
USING (has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));
