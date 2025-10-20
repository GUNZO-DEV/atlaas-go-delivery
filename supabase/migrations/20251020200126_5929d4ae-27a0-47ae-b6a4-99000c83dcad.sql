-- Create function to assign rider role during signup
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

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.assign_rider_role(uuid) TO authenticated;