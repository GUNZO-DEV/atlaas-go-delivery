-- Add RLS policies for admins to manage AUIER orders
CREATE POLICY "Admins can view all AUIER orders"
ON public.auier_orders
FOR SELECT
USING (has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "Admins can update AUIER orders"
ON public.auier_orders
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::user_role));