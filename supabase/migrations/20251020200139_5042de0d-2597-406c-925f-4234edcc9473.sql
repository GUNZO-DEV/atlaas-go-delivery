-- Fix search_path format for rider role function
CREATE OR REPLACE FUNCTION public.assign_rider_role(user_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Insert rider role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (user_id_param, 'rider')
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;