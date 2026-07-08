
-- Restrict role_permissions read to admin/super_admin
DROP POLICY IF EXISTS "Authed read role permissions" ON public.role_permissions;
CREATE POLICY "Admins read role permissions" ON public.role_permissions
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Restrict system_settings read to admin/super_admin
DROP POLICY IF EXISTS "Authed read system settings" ON public.system_settings;
CREATE POLICY "Admins read system settings" ON public.system_settings
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Remove permissive UPDATE-with-USING(true) policy on visitor_sessions.
-- Visitor session upserts happen through the track-visitor edge function using the
-- service role, which bypasses RLS, so no client-side update policy is needed.
DROP POLICY IF EXISTS "Anyone can update own visitor session" ON public.visitor_sessions;
DROP POLICY IF EXISTS "Anyone can upsert visitor sessions" ON public.visitor_sessions;

-- Analytics + failed signup inserts also go through service-role edge functions.
DROP POLICY IF EXISTS "Anyone can log analytics events" ON public.analytics_events;
DROP POLICY IF EXISTS "Anyone can log failed signups" ON public.failed_signups;
