-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Service can manage delivery metrics" ON public.delivery_metrics;

-- Admins can manage all delivery metrics
CREATE POLICY "Admins can manage delivery metrics"
ON public.delivery_metrics
FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Merchants can view metrics for their own restaurants
CREATE POLICY "Merchants can view own restaurant metrics"
ON public.delivery_metrics
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.restaurants
    WHERE restaurants.id = delivery_metrics.restaurant_id
    AND restaurants.merchant_id = auth.uid()
  )
);

-- Allow system to insert metrics (for ML/analytics system via triggers or service role)
CREATE POLICY "System can insert delivery metrics"
ON public.delivery_metrics
FOR INSERT
WITH CHECK (true);

-- Riders can view metrics for orders they delivered
CREATE POLICY "Riders can view their delivery metrics"
ON public.delivery_metrics
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = delivery_metrics.order_id
    AND orders.rider_id = auth.uid()
  )
);