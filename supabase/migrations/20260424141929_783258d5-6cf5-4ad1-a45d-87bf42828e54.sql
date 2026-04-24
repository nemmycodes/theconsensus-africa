-- Allow anonymous users to read forum posts (already allowed for authenticated)
DROP POLICY IF EXISTS "Anyone authenticated can view posts" ON public.forum_posts;
CREATE POLICY "Anyone can view forum posts"
  ON public.forum_posts FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Anyone authenticated can view comments" ON public.forum_comments;
CREATE POLICY "Anyone can view forum comments"
  ON public.forum_comments FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Anyone authenticated can view likes" ON public.forum_likes;
CREATE POLICY "Anyone can view forum likes"
  ON public.forum_likes FOR SELECT
  TO anon, authenticated
  USING (true);