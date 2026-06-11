-- 1. Audit logs: explicitly remove client write privileges (defense in depth; RLS already has no INSERT policy)
REVOKE INSERT, UPDATE, DELETE ON public.audit_logs FROM anon, authenticated;

-- 2. Forum likes: hide individual user IDs from anonymous visitors
DROP POLICY IF EXISTS "Anyone can view forum likes" ON public.forum_likes;
CREATE POLICY "Authenticated users can view forum likes"
  ON public.forum_likes FOR SELECT TO authenticated USING (true);
REVOKE ALL ON public.forum_likes FROM anon;

-- 3. Situation post likes: hide individual user IDs from anonymous visitors
DROP POLICY IF EXISTS "Anyone can view situation likes" ON public.situation_post_likes;
CREATE POLICY "Authenticated users can view situation likes"
  ON public.situation_post_likes FOR SELECT TO authenticated USING (true);
REVOKE ALL ON public.situation_post_likes FROM anon;

-- 4. Aggregated like counts for the public situation feed (no user IDs exposed)
CREATE OR REPLACE FUNCTION public.get_situation_like_counts(_post_ids uuid[])
RETURNS TABLE(post_id uuid, like_count bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT post_id, count(*)::bigint
  FROM public.situation_post_likes
  WHERE post_id = ANY(_post_ids)
  GROUP BY post_id
$$;
GRANT EXECUTE ON FUNCTION public.get_situation_like_counts(uuid[]) TO anon, authenticated;