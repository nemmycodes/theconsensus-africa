
-- Posts table
CREATE TABLE public.situation_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL,
  content text NOT NULL,
  image_url text,
  location text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.situation_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view situation posts"
  ON public.situation_posts FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create situation posts"
  ON public.situation_posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update own situation posts"
  ON public.situation_posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete own situation posts"
  ON public.situation_posts FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id);

CREATE POLICY "Admins manage situation posts"
  ON public.situation_posts FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE TRIGGER update_situation_posts_updated_at
  BEFORE UPDATE ON public.situation_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Likes table
CREATE TABLE public.situation_post_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (post_id, user_id)
);

ALTER TABLE public.situation_post_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view situation likes"
  ON public.situation_post_likes FOR SELECT
  USING (true);

CREATE POLICY "Users can like situation posts"
  ON public.situation_post_likes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike own"
  ON public.situation_post_likes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Comments table
CREATE TABLE public.situation_post_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL,
  author_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.situation_post_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view situation comments"
  ON public.situation_post_comments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create situation comments"
  ON public.situation_post_comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can delete own situation comments"
  ON public.situation_post_comments FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id);

CREATE POLICY "Admins manage situation comments"
  ON public.situation_post_comments FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.situation_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.situation_post_likes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.situation_post_comments;

-- Storage bucket for post images (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('situation-uploads', 'situation-uploads', true);

CREATE POLICY "Situation uploads publicly viewable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'situation-uploads');

CREATE POLICY "Authenticated users upload to situation uploads"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'situation-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users delete own situation uploads"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'situation-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);
