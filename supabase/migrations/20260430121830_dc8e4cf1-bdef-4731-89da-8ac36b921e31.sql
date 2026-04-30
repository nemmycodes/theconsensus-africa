
ALTER TABLE public.kef_cares_registrations
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS cover_url TEXT,
  ADD COLUMN IF NOT EXISTS bio TEXT;

INSERT INTO storage.buckets (id, name, public)
VALUES ('kef-profile-photos', 'kef-profile-photos', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read kef profile photos" ON storage.objects;
CREATE POLICY "Public read kef profile photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'kef-profile-photos');

DROP POLICY IF EXISTS "Users upload own kef profile photos" ON storage.objects;
CREATE POLICY "Users upload own kef profile photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'kef-profile-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users update own kef profile photos" ON storage.objects;
CREATE POLICY "Users update own kef profile photos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'kef-profile-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users delete own kef profile photos" ON storage.objects;
CREATE POLICY "Users delete own kef profile photos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'kef-profile-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
