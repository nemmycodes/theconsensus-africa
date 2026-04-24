-- Allow authenticated users to self-assign ONLY the kef_user role
CREATE POLICY "Users can self-assign kef_user role"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id AND role = 'kef_user'::app_role);

-- Backfill kef_user role for existing kef_cares registrants
INSERT INTO public.user_roles (user_id, role)
SELECT DISTINCT k.user_id, 'kef_user'::app_role
FROM public.kef_cares_registrations k
WHERE k.user_id IS NOT NULL
ON CONFLICT DO NOTHING;