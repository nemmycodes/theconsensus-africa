-- Create storage bucket for CRM uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('cms-uploads', 'cms-uploads', true);

-- Allow anyone to view files in the bucket
CREATE POLICY "Public can view cms uploads" ON storage.objects
  FOR SELECT USING (bucket_id = 'cms-uploads');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload cms files" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'cms-uploads');

-- Allow authenticated users to update their uploads
CREATE POLICY "Authenticated users can update cms files" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'cms-uploads');

-- Allow authenticated users to delete their uploads  
CREATE POLICY "Authenticated users can delete cms files" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'cms-uploads');

-- Add permissive SELECT policy for blog_posts so admins and public can read
CREATE POLICY "Anyone can read published blog posts" ON public.blog_posts
  FOR SELECT USING (published = true);

-- Allow admins full CRUD on blog posts
CREATE POLICY "Admins can manage all blog posts" ON public.blog_posts
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Add event image column
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS image_url text;