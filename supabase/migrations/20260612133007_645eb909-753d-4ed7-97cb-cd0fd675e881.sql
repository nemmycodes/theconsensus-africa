CREATE OR REPLACE FUNCTION public.get_public_stats()
RETURNS TABLE(total_members bigint, total_agents bigint, total_events bigint)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT
    (SELECT count(*) FROM public.profiles),
    (SELECT count(*) FROM public.user_roles WHERE role = 'agent'::app_role),
    (SELECT count(*) FROM public.events)
$$;

REVOKE ALL ON FUNCTION public.get_public_stats() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_stats() TO anon, authenticated;