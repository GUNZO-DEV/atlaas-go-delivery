-- Update rider SELECT policy to also see pending orders (not just ready_for_pickup)
DROP POLICY IF EXISTS "Riders can view available and assigned orders" ON public.orders;

CREATE POLICY "Riders can view available and assigned orders"
ON public.orders
FOR SELECT
TO authenticated
USING (
  (auth.uid() = rider_id)
  OR (
    status IN ('pending', 'ready_for_pickup')
    AND rider_id IS NULL
    AND has_role(auth.uid(), 'rider'::user_role)
  )
);

-- Also update the UPDATE policy so riders can accept pending orders
DROP POLICY IF EXISTS "Authorized users can update orders" ON public.orders;

CREATE POLICY "Authorized users can update orders"
ON public.orders
FOR UPDATE
TO authenticated
USING (
  (auth.uid() = customer_id)
  OR (
    ((auth.uid() = rider_id) OR (rider_id IS NULL AND status IN ('pending', 'ready_for_pickup')))
    AND has_role(auth.uid(), 'rider'::user_role)
  )
  OR (
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = orders.restaurant_id
      AND restaurants.merchant_id = auth.uid()
      AND has_role(auth.uid(), 'merchant'::user_role)
    )
  )
);