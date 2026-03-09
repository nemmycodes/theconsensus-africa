
-- Add onboarding fields to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS dob text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS interests text[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS lga text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ward text;

-- Update existing profiles with onboarding data from auth.users metadata
UPDATE public.profiles p
SET 
  phone = u.raw_user_meta_data->>'phone',
  dob = u.raw_user_meta_data->>'dob',
  lga = u.raw_user_meta_data->>'lga',
  ward = u.raw_user_meta_data->>'ward'
FROM auth.users u
WHERE p.user_id = u.id;

-- Update trigger to also store onboarding fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email, phone, dob, lga, ward, interests)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email,
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'dob',
    NEW.raw_user_meta_data->>'lga',
    NEW.raw_user_meta_data->>'ward',
    CASE 
      WHEN NEW.raw_user_meta_data->'interests' IS NOT NULL 
      THEN ARRAY(SELECT jsonb_array_elements_text(NEW.raw_user_meta_data->'interests'))
      ELSE NULL
    END
  );
  RETURN NEW;
END;
$function$;

-- Add RLS policy for admin to delete profiles
CREATE POLICY "Admins can delete profiles"
ON public.profiles
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Add RLS policy for admin to update any profile
CREATE POLICY "Admins can update all profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Add RLS policy for admin to insert profiles
CREATE POLICY "Admins can insert profiles"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));
