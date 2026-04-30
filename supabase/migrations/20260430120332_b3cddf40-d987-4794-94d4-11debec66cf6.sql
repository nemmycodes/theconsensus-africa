-- Programme updates managed by admins, visible to KEF users + public
CREATE TABLE public.kef_cares_program_updates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  date_label TEXT,
  published BOOLEAN NOT NULL DEFAULT true,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.kef_cares_program_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published kef program updates"
  ON public.kef_cares_program_updates FOR SELECT
  TO anon, authenticated
  USING (published = true);

CREATE POLICY "Admins manage kef program updates"
  ON public.kef_cares_program_updates FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE TRIGGER update_kef_cares_program_updates_updated_at
  BEFORE UPDATE ON public.kef_cares_program_updates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Seed initial updates so dashboard isn't empty
INSERT INTO public.kef_cares_program_updates (title, body, date_label) VALUES
  ('KEF-CARES Central Zone Pilot Launched', 'The Central Zone pilot programme has officially commenced. Registration is now open for residents of Pankshin, Mangu, Bokkos, Kanam, and Kanke LGAs.', 'March 2026'),
  ('Skills Training Programme Coming Soon', 'KEF-CARES will be rolling out targeted skills training programmes based on registration data analysis. Stay tuned for announcements.', 'Q2 2026'),
  ('Agricultural Support Initiative', 'Partnerships with local agricultural agencies are being finalized to provide farming support and resources to registered farmers.', 'Q3 2026');