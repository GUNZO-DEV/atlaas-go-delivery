-- Create restaurant audit logs table for tracking staff actions
CREATE TABLE public.lyn_audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
  user_id UUID,
  staff_name TEXT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lyn_audit_logs ENABLE ROW LEVEL SECURITY;

-- Merchants can view their restaurant's audit logs
CREATE POLICY "Merchants can view restaurant audit logs" 
ON public.lyn_audit_logs 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM restaurants 
    WHERE restaurants.id = lyn_audit_logs.restaurant_id 
    AND restaurants.merchant_id = auth.uid()
  )
);

-- Merchants can insert audit logs for their restaurant
CREATE POLICY "Merchants can insert audit logs" 
ON public.lyn_audit_logs 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM restaurants 
    WHERE restaurants.id = lyn_audit_logs.restaurant_id 
    AND restaurants.merchant_id = auth.uid()
  )
);

-- Enable realtime for audit logs
ALTER PUBLICATION supabase_realtime ADD TABLE public.lyn_audit_logs;