-- 1. States table with senatorial zones (JSON array of zone names)
CREATE TABLE IF NOT EXISTS public.inec_states (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  code text NOT NULL UNIQUE,
  geo_zone text NOT NULL,
  senatorial_zones text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.inec_states ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view inec states"
ON public.inec_states FOR SELECT TO public USING (true);

CREATE POLICY "Super admins manage inec states"
ON public.inec_states FOR ALL TO authenticated
USING (has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

-- 2. Add senatorial_zone + state to inec_lgas (state defaults to Plateau for existing rows)
ALTER TABLE public.inec_lgas
  ADD COLUMN IF NOT EXISTS senatorial_zone text;

-- 3. Add senatorial_zone to election_reports for filtering
ALTER TABLE public.election_reports
  ADD COLUMN IF NOT EXISTS senatorial_zone text;

-- 4. Seed all 36 states + FCT with senatorial zones
INSERT INTO public.inec_states (name, code, geo_zone, senatorial_zones) VALUES
('Abia','AB','South East', ARRAY['Abia North','Abia Central','Abia South']),
('Adamawa','AD','North East', ARRAY['Adamawa North','Adamawa Central','Adamawa South']),
('Akwa Ibom','AK','South South', ARRAY['Akwa Ibom North-East','Akwa Ibom North-West','Akwa Ibom South']),
('Anambra','AN','South East', ARRAY['Anambra North','Anambra Central','Anambra South']),
('Bauchi','BA','North East', ARRAY['Bauchi North','Bauchi Central','Bauchi South']),
('Bayelsa','BY','South South', ARRAY['Bayelsa East','Bayelsa Central','Bayelsa West']),
('Benue','BE','North Central', ARRAY['Benue North-East','Benue North-West','Benue South']),
('Borno','BO','North East', ARRAY['Borno North','Borno Central','Borno South']),
('Cross River','CR','South South', ARRAY['Cross River North','Cross River Central','Cross River South']),
('Delta','DE','South South', ARRAY['Delta North','Delta Central','Delta South']),
('Ebonyi','EB','South East', ARRAY['Ebonyi North','Ebonyi Central','Ebonyi South']),
('Edo','ED','South South', ARRAY['Edo North','Edo Central','Edo South']),
('Ekiti','EK','South West', ARRAY['Ekiti North','Ekiti Central','Ekiti South']),
('Enugu','EN','South East', ARRAY['Enugu North','Enugu East','Enugu West']),
('FCT','FC','North Central', ARRAY['FCT']),
('Gombe','GO','North East', ARRAY['Gombe North','Gombe Central','Gombe South']),
('Imo','IM','South East', ARRAY['Imo North','Imo East (Owerri Zone)','Imo West (Orlu Zone)']),
('Jigawa','JI','North West', ARRAY['Jigawa North-East','Jigawa North-West','Jigawa South-West']),
('Kaduna','KD','North West', ARRAY['Kaduna North','Kaduna Central','Kaduna South']),
('Kano','KN','North West', ARRAY['Kano North','Kano Central','Kano South']),
('Katsina','KT','North West', ARRAY['Katsina North','Katsina Central','Katsina South']),
('Kebbi','KB','North West', ARRAY['Kebbi North','Kebbi Central','Kebbi South']),
('Kogi','KO','North Central', ARRAY['Kogi East','Kogi Central','Kogi West']),
('Kwara','KW','North Central', ARRAY['Kwara North','Kwara Central','Kwara South']),
('Lagos','LA','South West', ARRAY['Lagos East','Lagos Central','Lagos West']),
('Nasarawa','NA','North Central', ARRAY['Nasarawa North','Nasarawa West','Nasarawa South']),
('Niger','NI','North Central', ARRAY['Niger North','Niger East','Niger South']),
('Ogun','OG','South West', ARRAY['Ogun East','Ogun Central','Ogun West']),
('Ondo','ON','South West', ARRAY['Ondo North','Ondo Central','Ondo South']),
('Osun','OS','South West', ARRAY['Osun East','Osun Central','Osun West']),
('Oyo','OY','South West', ARRAY['Oyo North','Oyo Central','Oyo South']),
('Plateau','PL','North Central', ARRAY['Plateau North','Plateau Central','Plateau South']),
('Rivers','RI','South South', ARRAY['Rivers East','Rivers South-East','Rivers West']),
('Sokoto','SO','North West', ARRAY['Sokoto North','Sokoto East','Sokoto South']),
('Taraba','TA','North East', ARRAY['Taraba North','Taraba Central','Taraba South']),
('Yobe','YO','North East', ARRAY['Yobe North','Yobe East','Yobe South']),
('Zamfara','ZA','North West', ARRAY['Zamfara North','Zamfara Central','Zamfara West'])
ON CONFLICT (name) DO NOTHING;

-- 5. Map Plateau's 17 LGAs to their senatorial zones
-- Plateau North: Bassa, Jos East, Jos North, Jos South
-- Plateau Central: Barkin Ladi, Bokkos, Mangu, Pankshin, Kanam, Kanke
-- Plateau South: Langtang North, Langtang South, Mikang, Qua'an Pan, Shendam, Wase, Riyom
UPDATE public.inec_lgas SET senatorial_zone = 'Plateau North'
  WHERE name IN ('Bassa','Jos East','Jos North','Jos South');
UPDATE public.inec_lgas SET senatorial_zone = 'Plateau Central'
  WHERE name IN ('Barkin Ladi','Bokkos','Mangu','Pankshin','Kanam','Kanke','Riyom');
UPDATE public.inec_lgas SET senatorial_zone = 'Plateau South'
  WHERE name IN ('Langtang North','Langtang South','Mikang','Qua''an Pan','Shendam','Wase');