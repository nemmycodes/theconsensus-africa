
-- 1. broadcasts: audience-scoped read for authenticated users
DROP POLICY IF EXISTS "Authed view broadcasts" ON public.broadcasts;
CREATE POLICY "Authed view broadcasts"
ON public.broadcasts FOR SELECT
TO authenticated
USING (
  active = true AND (
    audience = 'all'
    OR has_role(auth.uid(), 'super_admin'::app_role)
    OR (audience = 'admins' AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role)))
    OR (audience = 'agents' AND has_role(auth.uid(), 'agent'::app_role))
    OR (audience = 'kef' AND has_role(auth.uid(), 'kef_user'::app_role))
    OR (audience = 'users' AND has_role(auth.uid(), 'user'::app_role))
  )
);

-- 2. cms-uploads: restrict INSERT to admin/super_admin
DROP POLICY IF EXISTS "Authenticated upload cms files" ON storage.objects;
CREATE POLICY "Admins upload cms files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'cms-uploads'
  AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role))
);

-- 3. primaries_collation: remove submitter SELECT to prevent exco_phone harvesting; only admins can read
DROP POLICY IF EXISTS "Submitters view own primaries" ON public.primaries_collation;

-- 4. realtime.messages: enable RLS and restrict subscriptions to authenticated users on scoped topics
ALTER TABLE IF EXISTS realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated can receive own broadcasts" ON realtime.messages;
CREATE POLICY "Authenticated can receive own broadcasts"
ON realtime.messages FOR SELECT
TO authenticated
USING (
  (realtime.topic() LIKE 'user:' || auth.uid()::text || ':%')
  OR (realtime.topic() IN ('messages', 'forum_posts', 'situation_posts', 'situation_updates', 'broadcasts'))
);

DROP POLICY IF EXISTS "Authenticated can send to own topics" ON realtime.messages;
CREATE POLICY "Authenticated can send to own topics"
ON realtime.messages FOR INSERT
TO authenticated
WITH CHECK (
  realtime.topic() LIKE 'user:' || auth.uid()::text || ':%'
);
