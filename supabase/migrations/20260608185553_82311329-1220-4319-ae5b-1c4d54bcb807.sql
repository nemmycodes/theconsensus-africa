
CREATE TABLE public.manifesto_contributors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  whatsapp TEXT,
  email TEXT NOT NULL,
  gender TEXT,
  age_range TEXT,
  lga TEXT,
  ward TEXT,
  current_location TEXT,
  occupation TEXT,
  organisation TEXT,
  qualification TEXT,
  areas_of_interest TEXT[] NOT NULL DEFAULT '{}',
  about TEXT,
  contribution TEXT,
  engagement_areas TEXT[] NOT NULL DEFAULT '{}',
  declaration BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.manifesto_contributors TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.manifesto_contributors TO authenticated;
GRANT ALL ON public.manifesto_contributors TO service_role;
ALTER TABLE public.manifesto_contributors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit contributor form" ON public.manifesto_contributors FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins can view contributors" ON public.manifesto_contributors FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Admins can delete contributors" ON public.manifesto_contributors FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));
