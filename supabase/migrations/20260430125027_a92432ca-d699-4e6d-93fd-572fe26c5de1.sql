-- Add agent_code to profiles, with unique constraint and auto-generation helper
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS agent_code text UNIQUE;

-- Function to generate a unique agent code like AGT-XXXXXX
CREATE OR REPLACE FUNCTION public.generate_agent_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_code text;
  exists_count int;
BEGIN
  LOOP
    new_code := 'AGT-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6));
    SELECT count(*) INTO exists_count FROM public.profiles WHERE agent_code = new_code;
    EXIT WHEN exists_count = 0;
  END LOOP;
  RETURN new_code;
END;
$$;

-- Trigger: when a user is granted the 'agent' role, auto-assign an agent_code if missing
CREATE OR REPLACE FUNCTION public.assign_agent_code_on_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role = 'agent'::app_role THEN
    UPDATE public.profiles
       SET agent_code = public.generate_agent_code()
     WHERE user_id = NEW.user_id AND (agent_code IS NULL OR agent_code = '');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_assign_agent_code ON public.user_roles;
CREATE TRIGGER trg_assign_agent_code
AFTER INSERT ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.assign_agent_code_on_role();

-- Backfill: assign codes to existing agents missing one
UPDATE public.profiles p
   SET agent_code = public.generate_agent_code()
 WHERE agent_code IS NULL
   AND EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = p.user_id AND ur.role = 'agent');