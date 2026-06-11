-- has_role: only needed by logged-in users; remove anon/PUBLIC execute
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;

-- get_situation_like_counts: remove implicit PUBLIC grant; keep explicit anon/authenticated
REVOKE EXECUTE ON FUNCTION public.get_situation_like_counts(uuid[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_situation_like_counts(uuid[]) TO anon, authenticated;