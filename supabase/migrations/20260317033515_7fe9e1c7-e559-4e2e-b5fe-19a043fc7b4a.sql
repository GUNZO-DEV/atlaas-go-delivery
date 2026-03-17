
ALTER TABLE public.auier_orders ADD COLUMN customer_id uuid;

-- RLS policy for customers to view their own AUIER orders
CREATE POLICY "Customers can view their own auier orders"
ON public.auier_orders FOR SELECT
TO authenticated
USING (customer_id = auth.uid());

-- Allow authenticated users to insert auier orders
CREATE POLICY "Authenticated users can create auier orders"
ON public.auier_orders FOR INSERT
TO authenticated
WITH CHECK (customer_id = auth.uid() OR customer_id IS NULL);

-- Allow anonymous inserts (existing behavior)
CREATE POLICY "Anyone can create auier orders"
ON public.auier_orders FOR INSERT
TO anon
WITH CHECK (true);
