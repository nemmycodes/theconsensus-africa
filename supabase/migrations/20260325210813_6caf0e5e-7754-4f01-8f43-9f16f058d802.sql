
-- Add user_id column to kef_cares_registrations to link to auth accounts
ALTER TABLE public.kef_cares_registrations ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Allow kef_user to view their own registration
CREATE POLICY "Kef users can view own registration"
ON public.kef_cares_registrations FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'kef_user'::app_role) AND auth.uid() = user_id);

-- Allow kef_user to update their own registration
CREATE POLICY "Kef users can update own registration"
ON public.kef_cares_registrations FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'kef_user'::app_role) AND auth.uid() = user_id);
