
-- 1. Profiles: remove public PII exposure
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- 2. user_roles: remove self-assignment escalation path
DROP POLICY IF EXISTS "Users can self-assign kef_user role" ON public.user_roles;

-- 3. audit_logs: remove client INSERT (service_role bypasses RLS)
DROP POLICY IF EXISTS "Authed insert audit logs" ON public.audit_logs;

-- 4. agent_locations: remove from realtime publication (admins still query directly)
ALTER PUBLICATION supabase_realtime DROP TABLE public.agent_locations;

-- 5. Storage: agent-recruitment-ids — restrict uploads to authenticated users under their own folder
DROP POLICY IF EXISTS "Anyone can upload recruitment ID" ON storage.objects;
CREATE POLICY "Authenticated upload own recruitment ID"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'agent-recruitment-ids'
    AND (storage.foldername(name))[1] = (auth.uid())::text
  );

-- 6. cms-uploads: restrict delete/update to admin/super_admin; drop duplicate broad policies
DROP POLICY IF EXISTS "Authenticated users can delete cms files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete cms uploads" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update cms files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update cms uploads" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload cms files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload to cms" ON storage.objects;

CREATE POLICY "Admins upload cms files"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'cms-uploads'
    AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role))
  );
CREATE POLICY "Admins update cms files"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'cms-uploads'
    AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role))
  );
CREATE POLICY "Admins delete cms files"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'cms-uploads'
    AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role))
  );

-- 7. Drop broad public SELECT/listing policies (public buckets serve files via public URL, no SELECT policy needed)
DROP POLICY IF EXISTS "Anyone can view cms uploads" ON storage.objects;
DROP POLICY IF EXISTS "Public can view cms uploads" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Public can view forum uploads" ON storage.objects;
DROP POLICY IF EXISTS "Public read kef profile photos" ON storage.objects;
DROP POLICY IF EXISTS "Situation uploads publicly viewable" ON storage.objects;
DROP POLICY IF EXISTS "Public can view report attachments" ON storage.objects;

-- 8. primaries-collation: enforce ownership path prefix on uploads
DROP POLICY IF EXISTS "Authed upload primaries forms" ON storage.objects;
CREATE POLICY "Agents upload own primaries forms"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'primaries-collation'
    AND (storage.foldername(name))[1] = (auth.uid())::text
  );

-- 9. report-attachments: scoped SELECT (owner + admins). Bucket made private separately.
CREATE POLICY "Users view own report attachments"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'report-attachments'
    AND (storage.foldername(name))[1] = (auth.uid())::text
  );
CREATE POLICY "Admins view all report attachments"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'report-attachments'
    AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role))
  );

-- 10. manifesto_contributors: replace permissive WITH CHECK (true) with basic validation
DROP POLICY IF EXISTS "Anyone can submit contributor form" ON public.manifesto_contributors;
CREATE POLICY "Anyone can submit contributor form"
  ON public.manifesto_contributors FOR INSERT TO anon, authenticated
  WITH CHECK (
    full_name IS NOT NULL AND length(trim(full_name)) BETWEEN 2 AND 200
    AND email IS NOT NULL AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' AND length(email) <= 255
  );

-- 11. Revoke EXECUTE on internal SECURITY DEFINER trigger functions (keep has_role public)
REVOKE EXECUTE ON FUNCTION public.assign_agent_code_on_role() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.generate_agent_code() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
