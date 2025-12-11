-- Drop the existing policy
DROP POLICY IF EXISTS "Merchants can manage restaurant orders" ON public.lyn_restaurant_orders;

-- Recreate with proper WITH CHECK clause for INSERT/UPDATE
CREATE POLICY "Merchants can manage restaurant orders" 
ON public.lyn_restaurant_orders 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM restaurants 
    WHERE restaurants.id = lyn_restaurant_orders.restaurant_id 
    AND restaurants.merchant_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM restaurants 
    WHERE restaurants.id = lyn_restaurant_orders.restaurant_id 
    AND restaurants.merchant_id = auth.uid()
  )
);