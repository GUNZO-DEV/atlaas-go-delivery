-- Create table for restaurant tables/seating
CREATE TABLE public.lyn_tables (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
  table_number TEXT NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 4,
  position_x INTEGER DEFAULT 0,
  position_y INTEGER DEFAULT 0,
  shape TEXT DEFAULT 'square', -- square, round, rectangle
  status TEXT DEFAULT 'available', -- available, occupied, reserved, cleaning
  current_order_id UUID REFERENCES public.lyn_restaurant_orders(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add kitchen tracking columns to orders
ALTER TABLE public.lyn_restaurant_orders
ADD COLUMN IF NOT EXISTS table_id UUID REFERENCES public.lyn_tables(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS guests_count INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS kitchen_status TEXT DEFAULT 'pending', -- pending, preparing, ready, served
ADD COLUMN IF NOT EXISTS kitchen_started_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS kitchen_ready_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS served_at TIMESTAMP WITH TIME ZONE;

-- Enable RLS
ALTER TABLE public.lyn_tables ENABLE ROW LEVEL SECURITY;

-- RLS Policy for tables
CREATE POLICY "Merchants can manage tables"
ON public.lyn_tables
FOR ALL
USING (EXISTS (
  SELECT 1 FROM restaurants
  WHERE restaurants.id = lyn_tables.restaurant_id
  AND restaurants.merchant_id = auth.uid()
));

-- Enable realtime for orders
ALTER PUBLICATION supabase_realtime ADD TABLE public.lyn_restaurant_orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.lyn_tables;

-- Insert default tables for LYN Restaurant
INSERT INTO public.lyn_tables (restaurant_id, table_number, capacity, position_x, position_y, shape)
SELECT 
  '5b731ce8-f229-4304-985a-a2dd4bcc2385',
  t.table_number,
  t.capacity,
  t.pos_x,
  t.pos_y,
  t.shape
FROM (VALUES
  ('T1', 2, 50, 50, 'square'),
  ('T2', 2, 150, 50, 'square'),
  ('T3', 4, 250, 50, 'square'),
  ('T4', 4, 350, 50, 'square'),
  ('T5', 6, 50, 150, 'rectangle'),
  ('T6', 6, 200, 150, 'rectangle'),
  ('T7', 4, 350, 150, 'round'),
  ('T8', 8, 100, 250, 'rectangle'),
  ('T9', 4, 300, 250, 'round'),
  ('T10', 2, 50, 350, 'square'),
  ('T11', 2, 150, 350, 'square'),
  ('T12', 4, 250, 350, 'square')
) AS t(table_number, capacity, pos_x, pos_y, shape);