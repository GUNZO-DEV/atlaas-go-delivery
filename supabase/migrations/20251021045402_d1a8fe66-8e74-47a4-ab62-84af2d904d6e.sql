-- Fix 1: Remove duplicate storage policies (keep only the secure ones)
DROP POLICY IF EXISTS "Anyone can view menu images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload menu images" ON storage.objects;
DROP POLICY IF EXISTS "Restaurant owners can update their menu images" ON storage.objects;
DROP POLICY IF EXISTS "Restaurant owners can delete their menu images" ON storage.objects;

-- Fix 2: Add search_path to all SECURITY DEFINER functions
ALTER FUNCTION public.approve_restaurant_application(uuid, uuid) SET search_path = public;
ALTER FUNCTION public.approve_rider_application(uuid, uuid) SET search_path = public;
ALTER FUNCTION public.assign_merchant_role(uuid) SET search_path = public;
ALTER FUNCTION public.assign_rider_role(uuid) SET search_path = public;
ALTER FUNCTION public.award_loyalty_points() SET search_path = public;
ALTER FUNCTION public.create_notification(uuid, text, text, text, uuid) SET search_path = public;
ALTER FUNCTION public.handle_new_user() SET search_path = public;
ALTER FUNCTION public.notify_order_status_change() SET search_path = public;
ALTER FUNCTION public.record_rider_earnings() SET search_path = public;
ALTER FUNCTION public.reject_restaurant_application(uuid, uuid, text) SET search_path = public;
ALTER FUNCTION public.reject_rider_application(uuid, uuid, text) SET search_path = public;
ALTER FUNCTION public.update_restaurant_rating() SET search_path = public;

-- Fix 3: Enhance orders UPDATE policy with role verification
DROP POLICY IF EXISTS "Customers and merchants can update orders" ON public.orders;
DROP POLICY IF EXISTS "Customers can update orders" ON public.orders;

CREATE POLICY "Authorized users can update orders" ON public.orders
FOR UPDATE 
USING (
  auth.uid() = customer_id 
  OR (auth.uid() = rider_id AND has_role(auth.uid(), 'rider'))
  OR (EXISTS (
    SELECT 1 FROM public.restaurants 
    WHERE restaurants.id = orders.restaurant_id 
    AND restaurants.merchant_id = auth.uid()
    AND has_role(auth.uid(), 'merchant')
  ))
);

-- Fix 4: Enhance delivery_tracking policies with role verification
DROP POLICY IF EXISTS "Riders can manage their delivery tracking" ON public.delivery_tracking;

CREATE POLICY "Riders can manage their delivery tracking" ON public.delivery_tracking
FOR ALL
USING (auth.uid() = rider_id AND has_role(auth.uid(), 'rider'));

-- Fix 5: Enhance payout_requests INSERT policy with role verification
DROP POLICY IF EXISTS "Riders can create payout requests" ON public.payout_requests;

CREATE POLICY "Riders can create payout requests" ON public.payout_requests
FOR INSERT
WITH CHECK (auth.uid() = rider_id AND has_role(auth.uid(), 'rider'));