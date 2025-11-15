-- Create audit_logs table to track admin actions
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id UUID,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Super admins can view all audit logs
CREATE POLICY "Super admins can view all audit logs"
ON public.audit_logs
FOR SELECT
USING (has_role(auth.uid(), 'super_admin'));

-- System can insert audit logs
CREATE POLICY "System can insert audit logs"
ON public.audit_logs
FOR INSERT
WITH CHECK (true);

-- Create function to log admin actions
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
BEGIN
  INSERT INTO public.audit_logs (user_id, action, target_type, target_id, details)
  VALUES (auth.uid(), p_action, p_target_type, p_target_id, p_details)
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$;

-- Update user_roles policies to allow super_admin to manage admins
CREATE POLICY "Super admins can delete admin roles"
ON public.user_roles
FOR DELETE
USING (
  has_role(auth.uid(), 'super_admin') 
  AND role IN ('admin', 'customer', 'merchant', 'rider')
);

CREATE POLICY "Super admins can insert any role"
ON public.user_roles
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'super_admin'));

-- Allow super_admins to view all users
CREATE POLICY "Super admins can view all users"
ON public.profiles
FOR SELECT
USING (has_role(auth.uid(), 'super_admin'));

-- Create trigger to log role changes
CREATE OR REPLACE FUNCTION public.log_role_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM log_admin_action(
      'role_granted',
      'user_role',
      NEW.user_id,
      jsonb_build_object('role', NEW.role, 'granted_by', auth.uid())
    );
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM log_admin_action(
      'role_revoked',
      'user_role',
      OLD.user_id,
      jsonb_build_object('role', OLD.role, 'revoked_by', auth.uid())
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER on_role_change
AFTER INSERT OR DELETE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.log_role_change();