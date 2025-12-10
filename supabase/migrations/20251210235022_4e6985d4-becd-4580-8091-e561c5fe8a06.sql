-- Create city waitlist table
CREATE TABLE public.city_waitlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  city TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create unique constraint to prevent duplicate signups
CREATE UNIQUE INDEX idx_city_waitlist_email_city ON public.city_waitlist (email, city);

-- Enable RLS
ALTER TABLE public.city_waitlist ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (public waitlist signup)
CREATE POLICY "Anyone can join waitlist"
ON public.city_waitlist
FOR INSERT
WITH CHECK (true);

-- Only admins can view waitlist entries
CREATE POLICY "Admins can view waitlist"
ON public.city_waitlist
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role IN ('admin', 'super_admin')
  )
);