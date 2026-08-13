ALTER TABLE public.manifesto_contributors ADD COLUMN IF NOT EXISTS document_urls text[] NOT NULL DEFAULT '{}';

DROP POLICY IF EXISTS "Anyone can upload manifesto documents" ON storage.objects;
CREATE POLICY "Anyone can upload manifesto documents"
ON storage.objects FOR INSERT TO anon, authenticated
WITH CHECK (bucket_id = 'manifesto-docs');

DROP POLICY IF EXISTS "Admins can read manifesto documents" ON storage.objects;
CREATE POLICY "Admins can read manifesto documents"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'manifesto-docs' AND (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin')));