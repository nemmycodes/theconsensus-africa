
-- Drop all restrictive policies on blog_posts and recreate as permissive
DROP POLICY IF EXISTS "Admins can manage all blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Agents can create posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Agents can delete own posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Agents can update own posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Agents can view all posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Anyone can read published blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Anyone can view published posts" ON public.blog_posts;

-- Recreate as PERMISSIVE policies
CREATE POLICY "Admins can manage all blog posts" ON public.blog_posts FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Agents can create posts" ON public.blog_posts FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'agent') AND auth.uid() = author_id);

CREATE POLICY "Agents can view all posts" ON public.blog_posts FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'agent'));

CREATE POLICY "Agents can update own posts" ON public.blog_posts FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'agent') AND auth.uid() = author_id);

CREATE POLICY "Agents can delete own posts" ON public.blog_posts FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'agent') AND auth.uid() = author_id);

CREATE POLICY "Anyone can view published posts" ON public.blog_posts FOR SELECT TO anon, authenticated
  USING (published = true);

-- Fix events policies too
DROP POLICY IF EXISTS "Admins can delete events" ON public.events;
DROP POLICY IF EXISTS "Admins can insert events" ON public.events;
DROP POLICY IF EXISTS "Admins can update events" ON public.events;
DROP POLICY IF EXISTS "Anyone can view events" ON public.events;

CREATE POLICY "Anyone can view events" ON public.events FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can insert events" ON public.events FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update events" ON public.events FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete events" ON public.events FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Fix situation_updates policies
DROP POLICY IF EXISTS "Agents can create updates" ON public.situation_updates;
DROP POLICY IF EXISTS "Agents can delete own updates" ON public.situation_updates;
DROP POLICY IF EXISTS "Agents can update own updates" ON public.situation_updates;
DROP POLICY IF EXISTS "Anyone can view updates" ON public.situation_updates;

CREATE POLICY "Anyone can view updates" ON public.situation_updates FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can manage all updates" ON public.situation_updates FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Agents can create updates" ON public.situation_updates FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'agent') AND auth.uid() = author_id);

CREATE POLICY "Agents can update own updates" ON public.situation_updates FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'agent') AND auth.uid() = author_id);

CREATE POLICY "Agents can delete own updates" ON public.situation_updates FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'agent') AND auth.uid() = author_id);

-- Fix storage policies for cms-uploads bucket
CREATE POLICY "Anyone can view cms uploads" ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'cms-uploads');

CREATE POLICY "Authenticated users can upload to cms" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'cms-uploads');

CREATE POLICY "Authenticated users can update cms uploads" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'cms-uploads');

CREATE POLICY "Authenticated users can delete cms uploads" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'cms-uploads');
