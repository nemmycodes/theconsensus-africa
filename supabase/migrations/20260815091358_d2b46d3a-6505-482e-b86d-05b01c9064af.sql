DROP POLICY "Anyone can submit recruitment application" ON public.agent_recruitment_applications;
CREATE POLICY "Anyone can submit recruitment application"
ON public.agent_recruitment_applications FOR INSERT TO anon, authenticated
WITH CHECK (
  (user_id IS NULL OR user_id = auth.uid())
  AND full_name IS NOT NULL AND length(btrim(full_name)) >= 2 AND length(btrim(full_name)) <= 200
  AND email IS NOT NULL AND length(email) >= 3 AND length(email) <= 255
  AND phone IS NOT NULL AND length(btrim(phone)) >= 4 AND length(btrim(phone)) <= 30
);

DROP POLICY "Anyone can submit volunteer registration" ON public.volunteer_registrations;
CREATE POLICY "Anyone can submit volunteer registration"
ON public.volunteer_registrations FOR INSERT TO anon, authenticated
WITH CHECK (
  (user_id IS NULL OR user_id = auth.uid())
  AND full_name IS NOT NULL AND length(btrim(full_name)) >= 2 AND length(btrim(full_name)) <= 200
  AND email IS NOT NULL AND length(email) >= 3 AND length(email) <= 255
);

DROP POLICY "Anyone can submit kef cares registration" ON public.kef_cares_registrations;
CREATE POLICY "Anyone can submit kef cares registration"
ON public.kef_cares_registrations FOR INSERT TO anon, authenticated
WITH CHECK (
  (user_id IS NULL OR user_id = auth.uid())
  AND full_name IS NOT NULL AND length(btrim(full_name)) >= 2 AND length(btrim(full_name)) <= 200
  AND phone_number IS NOT NULL AND length(btrim(phone_number)) >= 4 AND length(btrim(phone_number)) <= 30
);