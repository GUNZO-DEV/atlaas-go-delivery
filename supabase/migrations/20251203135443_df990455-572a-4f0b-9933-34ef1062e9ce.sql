-- Create AUIER orders table for campus delivery
CREATE TABLE public.auier_orders (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  room_number text NOT NULL,
  building_name text NOT NULL,
  restaurant_name text NOT NULL,
  order_details text NOT NULL,
  delivery_type text NOT NULL, -- 'restaurant_to_dorm' or 'maingate_to_dorm'
  delivery_fee numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  rider_id uuid REFERENCES auth.users(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  completed_at timestamp with time zone
);

-- Enable RLS
ALTER TABLE public.auier_orders ENABLE ROW LEVEL SECURITY;

-- Anyone can create AUIER orders (no auth required for customers)
CREATE POLICY "Anyone can create AUIER orders"
ON public.auier_orders
FOR INSERT
WITH CHECK (true);

-- Riders can view pending orders
CREATE POLICY "Riders can view AUIER orders"
ON public.auier_orders
FOR SELECT
USING (
  (status = 'pending' AND rider_id IS NULL) OR
  (rider_id = auth.uid()) OR
  has_role(auth.uid(), 'admin'::user_role)
);

-- Riders can update orders they've accepted
CREATE POLICY "Riders can update their AUIER orders"
ON public.auier_orders
FOR UPDATE
USING (
  (rider_id = auth.uid() AND has_role(auth.uid(), 'rider'::user_role)) OR
  (status = 'pending' AND rider_id IS NULL AND has_role(auth.uid(), 'rider'::user_role)) OR
  has_role(auth.uid(), 'admin'::user_role)
);

-- Enable realtime for AUIER orders
ALTER PUBLICATION supabase_realtime ADD TABLE public.auier_orders;