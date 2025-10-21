-- Drop the existing restrictive policy for riders viewing orders
DROP POLICY IF EXISTS "Riders can view their assigned orders" ON public.orders;

-- Create a new policy that allows riders to see:
-- 1. Orders assigned to them (rider_id matches)
-- 2. Orders that are ready for pickup (status = 'ready_for_pickup' and no rider assigned yet)
CREATE POLICY "Riders can view available and assigned orders"
ON public.orders
FOR SELECT
TO authenticated
USING (
  -- Allow if rider is assigned to this order
  (auth.uid() = rider_id) 
  OR 
  -- Allow if order is ready for pickup and not yet assigned to any rider
  (status = 'ready_for_pickup' AND rider_id IS NULL AND has_role(auth.uid(), 'rider'))
);

-- Also ensure riders can update orders they've accepted
DROP POLICY IF EXISTS "Authorized users can update orders" ON public.orders;

CREATE POLICY "Authorized users can update orders"
ON public.orders
FOR UPDATE
TO authenticated
USING (
  -- Customers can update their own orders
  (auth.uid() = customer_id) 
  OR 
  -- Riders can update orders assigned to them OR orders they're accepting (ready_for_pickup with no rider)
  ((auth.uid() = rider_id OR (rider_id IS NULL AND status = 'ready_for_pickup')) AND has_role(auth.uid(), 'rider'))
  OR 
  -- Merchants can update orders from their restaurants
  (EXISTS (
    SELECT 1 FROM public.restaurants
    WHERE restaurants.id = orders.restaurant_id 
    AND restaurants.merchant_id = auth.uid() 
    AND has_role(auth.uid(), 'merchant')
  ))
);