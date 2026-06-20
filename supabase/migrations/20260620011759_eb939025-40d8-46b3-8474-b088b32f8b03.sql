DROP POLICY IF EXISTS "Admins upload cms files" ON storage.objects;

CREATE POLICY "Authenticated upload cms files"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'cms-uploads');

DROP POLICY IF EXISTS "Admins update cms files" ON storage.objects;
CREATE POLICY "Admins or owner update cms files"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'cms-uploads'
    AND (
      owner = auth.uid()
      OR has_role(auth.uid(), 'admin'::app_role)
      OR has_role(auth.uid(), 'super_admin'::app_role)
    )
  );