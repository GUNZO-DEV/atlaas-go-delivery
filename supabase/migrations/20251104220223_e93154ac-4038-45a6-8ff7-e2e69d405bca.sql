-- Add order notes field to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS order_notes TEXT;

-- Create favorites table for restaurants
CREATE TABLE IF NOT EXISTS public.favorite_restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, restaurant_id)
);

-- Create favorites table for menu items
CREATE TABLE IF NOT EXISTS public.favorite_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  menu_item_id UUID NOT NULL REFERENCES public.menu_items(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, menu_item_id)
);

-- Enable RLS on favorites tables
ALTER TABLE public.favorite_restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorite_items ENABLE ROW LEVEL SECURITY;

-- RLS policies for favorite_restaurants
CREATE POLICY "Users can view their own favorite restaurants"
ON public.favorite_restaurants FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can add their own favorite restaurants"
ON public.favorite_restaurants FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own favorite restaurants"
ON public.favorite_restaurants FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies for favorite_items
CREATE POLICY "Users can view their own favorite items"
ON public.favorite_items FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can add their own favorite items"
ON public.favorite_items FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own favorite items"
ON public.favorite_items FOR DELETE
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_favorite_restaurants_user_id ON public.favorite_restaurants(user_id);
CREATE INDEX IF NOT EXISTS idx_favorite_items_user_id ON public.favorite_items(user_id);
CREATE INDEX IF NOT EXISTS idx_restaurants_name ON public.restaurants(name);
CREATE INDEX IF NOT EXISTS idx_menu_items_name ON public.menu_items(name);