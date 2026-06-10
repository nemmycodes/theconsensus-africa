
-- contact_messages
DROP POLICY IF EXISTS "Anyone can submit contact messages" ON public.contact_messages;
CREATE POLICY "Anyone can submit contact messages"
  ON public.contact_messages FOR INSERT TO anon, authenticated
  WITH CHECK (
    name IS NOT NULL AND length(trim(name)) BETWEEN 1 AND 200
    AND email IS NOT NULL AND length(email) BETWEEN 3 AND 255
    AND message IS NOT NULL AND length(trim(message)) BETWEEN 1 AND 5000
  );

-- kef_cares_registrations
DROP POLICY IF EXISTS "Anyone can submit kef cares registration" ON public.kef_cares_registrations;
CREATE POLICY "Anyone can submit kef cares registration"
  ON public.kef_cares_registrations FOR INSERT TO anon, authenticated
  WITH CHECK (
    full_name IS NOT NULL AND length(trim(full_name)) BETWEEN 2 AND 200
    AND phone_number IS NOT NULL AND length(trim(phone_number)) BETWEEN 4 AND 30
  );

-- volunteer_registrations
DROP POLICY IF EXISTS "Anyone can submit volunteer registration" ON public.volunteer_registrations;
CREATE POLICY "Anyone can submit volunteer registration"
  ON public.volunteer_registrations FOR INSERT TO anon, authenticated
  WITH CHECK (
    full_name IS NOT NULL AND length(trim(full_name)) BETWEEN 2 AND 200
    AND email IS NOT NULL AND length(email) BETWEEN 3 AND 255
  );

-- agent_recruitment_applications
DROP POLICY IF EXISTS "Anyone can submit recruitment application" ON public.agent_recruitment_applications;
CREATE POLICY "Anyone can submit recruitment application"
  ON public.agent_recruitment_applications FOR INSERT TO anon, authenticated
  WITH CHECK (
    full_name IS NOT NULL AND length(trim(full_name)) BETWEEN 2 AND 200
    AND email IS NOT NULL AND length(email) BETWEEN 3 AND 255
    AND phone IS NOT NULL AND length(trim(phone)) BETWEEN 4 AND 30
  );
