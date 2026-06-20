
-- 1. Allow super admins to view agent locations
CREATE POLICY "Super admins can view agent locations"
ON public.agent_locations
FOR SELECT
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- 2. Prevent admins from granting/removing the super_admin role (privilege escalation)
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
CREATE POLICY "Admins can insert roles"
ON public.user_roles
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  AND role <> 'super_admin'::app_role
);

DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;
CREATE POLICY "Admins can delete roles"
ON public.user_roles
FOR DELETE
USING (
  has_role(auth.uid(), 'admin'::app_role)
  AND role <> 'super_admin'::app_role
);

-- 3. Remove public exposure of verified primaries (which leaked exco_phone).
-- Admins, super admins, and submitters retain access via existing policies.
DROP POLICY IF EXISTS "Public can view verified primaries" ON public.primaries_collation;
