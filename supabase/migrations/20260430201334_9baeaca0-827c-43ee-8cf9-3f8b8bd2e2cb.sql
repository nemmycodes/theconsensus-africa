ALTER TABLE public.situation_updates ADD COLUMN IF NOT EXISTS attachment_url text;

INSERT INTO storage.buckets (id, name, public)
VALUES ('report-attachments', 'report-attachments', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public can view report attachments" ON storage.objects;
CREATE POLICY "Public can view report attachments" ON storage.objects
FOR SELECT USING (bucket_id = 'report-attachments');

DROP POLICY IF EXISTS "Authenticated can upload report attachments" ON storage.objects;
CREATE POLICY "Authenticated can upload report attachments" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (bucket_id = 'report-attachments' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users can update own report attachments" ON storage.objects;
CREATE POLICY "Users can update own report attachments" ON storage.objects
FOR UPDATE TO authenticated USING (bucket_id = 'report-attachments' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users can delete own report attachments" ON storage.objects;
CREATE POLICY "Users can delete own report attachments" ON storage.objects
FOR DELETE TO authenticated USING (bucket_id = 'report-attachments' AND (storage.foldername(name))[1] = auth.uid()::text);