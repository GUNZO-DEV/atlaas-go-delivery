-- Create a policy to allow first admin creation
-- Drop existing restrictive policy if it exists
DROP POLICY IF EXISTS "Allow first admin creation" ON public.user_roles;

-- Create policy that allows admin role insertion when no admins exist yet
CREATE POLICY "Allow first admin creation" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (
  role = 'admin' 
  AND user_id = auth.uid()
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles WHERE role = 'admin'
  )
);