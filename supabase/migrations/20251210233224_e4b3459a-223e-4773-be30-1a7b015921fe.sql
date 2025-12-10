-- Secure the assign_merchant_role function with authorization check
CREATE OR REPLACE FUNCTION public.assign_merchant_role(user_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Authorization check: user can only assign to themselves, or caller must be admin
  IF user_id_param != auth.uid() AND NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: You can only assign this role to yourself';
  END IF;

  -- Insert merchant role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (user_id_param, 'merchant')
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;

-- Secure the assign_rider_role function with authorization check
CREATE OR REPLACE FUNCTION public.assign_rider_role(user_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Authorization check: user can only assign to themselves, or caller must be admin
  IF user_id_param != auth.uid() AND NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: You can only assign this role to yourself';
  END IF;

  -- Insert rider role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (user_id_param, 'rider')
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;