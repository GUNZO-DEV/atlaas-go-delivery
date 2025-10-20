-- Create function to assign merchant role during signup
CREATE OR REPLACE FUNCTION public.assign_merchant_role(user_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert merchant role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (user_id_param, 'merchant')
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.assign_merchant_role(uuid) TO authenticated;