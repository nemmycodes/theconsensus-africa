DROP POLICY IF EXISTS "Blog authors upload cms files" ON storage.objects;
DROP POLICY IF EXISTS "Admins or owner update cms files" ON storage.objects;
DROP POLICY IF EXISTS "Admins delete cms files" ON storage.objects;

CREATE POLICY "Content team upload own blog media"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'cms-uploads'
  AND (storage.foldername(name))[1] = 'blog'
  AND (storage.foldername(name))[2] = auth.uid()::text
  AND (
    public.has_role(auth.uid(), 'agent'::public.app_role)
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'super_admin'::public.app_role)
  )
);

CREATE POLICY "Content team update own blog media"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'cms-uploads'
  AND (
    (
      (storage.foldername(name))[1] = 'blog'
      AND (storage.foldername(name))[2] = auth.uid()::text
      AND (
        public.has_role(auth.uid(), 'agent'::public.app_role)
        OR public.has_role(auth.uid(), 'admin'::public.app_role)
        OR public.has_role(auth.uid(), 'super_admin'::public.app_role)
      )
    )
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'super_admin'::public.app_role)
  )
)
WITH CHECK (
  bucket_id = 'cms-uploads'
  AND (
    (
      (storage.foldername(name))[1] = 'blog'
      AND (storage.foldername(name))[2] = auth.uid()::text
      AND (
        public.has_role(auth.uid(), 'agent'::public.app_role)
        OR public.has_role(auth.uid(), 'admin'::public.app_role)
        OR public.has_role(auth.uid(), 'super_admin'::public.app_role)
      )
    )
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'super_admin'::public.app_role)
  )
);

CREATE POLICY "Admins delete cms media"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'cms-uploads'
  AND (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'super_admin'::public.app_role)
  )
);