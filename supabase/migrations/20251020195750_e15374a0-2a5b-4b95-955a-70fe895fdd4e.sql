-- Fix search_path format for merchant role function
CREATE OR REPLACE FUNCTION public.assign_merchant_role(user_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Insert merchant role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (user_id_param, 'merchant')
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;