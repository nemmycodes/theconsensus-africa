DROP POLICY IF EXISTS "Admins upload cms files" ON storage.objects;
DROP POLICY IF EXISTS "Blog authors upload cms files" ON storage.objects;
DROP POLICY IF EXISTS "Public can view cms upload metadata" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can view cms upload metadata" ON storage.objects;

CREATE POLICY "Blog authors upload cms files"
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
      AND public.has_role(auth.uid(), 'agent'::public.app_role)
    )
  )
);

CREATE POLICY "Public can view cms upload metadata"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id = 'cms-uploads');