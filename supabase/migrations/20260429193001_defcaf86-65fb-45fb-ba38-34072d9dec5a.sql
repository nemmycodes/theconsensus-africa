
CREATE TABLE public.inec_lgas (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  code text NOT NULL UNIQUE,
  state text NOT NULL DEFAULT 'Plateau',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.inec_wards (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lga_id uuid NOT NULL REFERENCES public.inec_lgas(id) ON DELETE CASCADE,
  name text NOT NULL,
  code text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (lga_id, code)
);

CREATE TABLE public.inec_polling_units (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ward_id uuid NOT NULL REFERENCES public.inec_wards(id) ON DELETE CASCADE,
  name text NOT NULL,
  code text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (ward_id, code)
);

CREATE INDEX idx_inec_wards_lga ON public.inec_wards(lga_id);
CREATE INDEX idx_inec_pus_ward ON public.inec_polling_units(ward_id);

ALTER TABLE public.inec_lgas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inec_wards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inec_polling_units ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view inec lgas" ON public.inec_lgas FOR SELECT USING (true);
CREATE POLICY "Super admins manage inec lgas" ON public.inec_lgas FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Anyone can view inec wards" ON public.inec_wards FOR SELECT USING (true);
CREATE POLICY "Super admins manage inec wards" ON public.inec_wards FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Anyone can view inec polling units" ON public.inec_polling_units FOR SELECT USING (true);
CREATE POLICY "Super admins manage inec polling units" ON public.inec_polling_units FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));
