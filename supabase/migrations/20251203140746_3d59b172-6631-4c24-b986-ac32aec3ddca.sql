-- Allow riders to insert their own earnings records
CREATE POLICY "Riders can insert their own earnings"
ON public.rider_earnings
FOR INSERT
WITH CHECK (auth.uid() = rider_id AND has_role(auth.uid(), 'rider'::user_role));