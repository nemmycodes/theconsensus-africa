GRANT INSERT ON public.manifesto_contributors TO anon, authenticated;
GRANT SELECT, DELETE ON public.manifesto_contributors TO authenticated;
GRANT ALL ON public.manifesto_contributors TO service_role;