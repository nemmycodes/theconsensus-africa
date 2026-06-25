DROP POLICY IF EXISTS "Content team upload own blog media" ON storage.objects;

CREATE POLICY "Content team upload cms media"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'cms-uploads'
  AND (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'super_admin'::public.app_role)
    OR (
      (storage.foldername(name))[1] = 'blog'
      AND (storage.foldername(name))[2] = auth.uid()::text
      AND public.has_role(auth.uid(), 'agent'::public.app_role)
    )
  )
);