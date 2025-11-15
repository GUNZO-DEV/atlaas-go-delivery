-- Update log_admin_action to handle system operations (when auth.uid() is null)
CREATE OR REPLACE FUNCTION public.log_admin_action(
  p_action TEXT,
  p_target_type TEXT DEFAULT NULL,
  p_target_id UUID DEFAULT NULL,
  p_details JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_log_id UUID;
  v_user_id UUID;
BEGIN
  -- Use auth.uid() if available, otherwise use a system user ID (00000000-0000-0000-0000-000000000000)
  v_user_id := COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::UUID);
  
  INSERT INTO public.audit_logs (user_id, action, target_type, target_id, details)
  VALUES (v_user_id, p_action, p_target_type, p_target_id, p_details)
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$;