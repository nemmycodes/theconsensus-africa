DROP POLICY IF EXISTS "Super admins can view agent locations" ON public.agent_locations;
CREATE POLICY "Super admins can view agent locations"
ON public.agent_locations FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'super_admin'::app_role));

DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
CREATE POLICY "Admins can insert roles"
ON public.user_roles FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) AND role <> 'super_admin'::app_role);

DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;
CREATE POLICY "Admins can delete roles"
ON public.user_roles FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) AND role <> 'super_admin'::app_role);