ALTER TABLE public.volunteer_registrations
ADD COLUMN IF NOT EXISTS support_group_objectives text,
ADD COLUMN IF NOT EXISTS support_group_active_members integer;