-- Add Phase 2 columns to orders table
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS scheduled_for timestamp with time zone,
ADD COLUMN IF NOT EXISTS promo_code text,
ADD COLUMN IF NOT EXISTS discount_amount numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS payment_method text DEFAULT 'cash';

-- Add special instructions to order_items
ALTER TABLE public.order_items
ADD COLUMN IF NOT EXISTS special_instructions text;

-- Create promotions table
CREATE TABLE IF NOT EXISTS public.promotions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  description text NOT NULL,
  discount_type text NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value numeric NOT NULL,
  min_order_amount numeric DEFAULT 0,
  max_discount_amount numeric,
  valid_from timestamp with time zone DEFAULT now(),
  valid_until timestamp with time zone,
  usage_limit integer,
  usage_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Create group_orders table
CREATE TABLE IF NOT EXISTS public.group_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  host_user_id uuid NOT NULL,
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id),
  session_code text UNIQUE NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'locked', 'completed')),
  delivery_address text NOT NULL,
  scheduled_for timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone DEFAULT (now() + interval '2 hours')
);

-- Create group_order_participants table
CREATE TABLE IF NOT EXISTS public.group_order_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_order_id uuid NOT NULL REFERENCES public.group_orders(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  order_id uuid REFERENCES public.orders(id),
  joined_at timestamp with time zone DEFAULT now(),
  UNIQUE(group_order_id, user_id)
);

-- Enable RLS on new tables
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_order_participants ENABLE ROW LEVEL SECURITY;

-- RLS policies for promotions (everyone can view active promotions)
CREATE POLICY "Anyone can view active promotions"
ON public.promotions FOR SELECT
USING (is_active = true AND valid_until > now());

-- RLS policies for group_orders
CREATE POLICY "Users can create group orders"
ON public.group_orders FOR INSERT
WITH CHECK (auth.uid() = host_user_id);

CREATE POLICY "Users can view group orders they're part of"
ON public.group_orders FOR SELECT
USING (
  auth.uid() = host_user_id OR
  EXISTS (
    SELECT 1 FROM public.group_order_participants
    WHERE group_order_id = id AND user_id = auth.uid()
  )
);

CREATE POLICY "Hosts can update their group orders"
ON public.group_orders FOR UPDATE
USING (auth.uid() = host_user_id);

-- RLS policies for group_order_participants
CREATE POLICY "Users can join group orders"
ON public.group_order_participants FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view group order participants"
ON public.group_order_participants FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.group_orders
    WHERE id = group_order_id AND (
      host_user_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM public.group_order_participants gop
        WHERE gop.group_order_id = group_order_id AND gop.user_id = auth.uid()
      )
    )
  )
);

-- Insert some sample promotions
INSERT INTO public.promotions (code, description, discount_type, discount_value, min_order_amount, max_discount_amount, valid_until)
VALUES 
  ('WELCOME10', '10% off your first order', 'percentage', 10, 50, 20, now() + interval '30 days'),
  ('FEAST20', '20 MAD off orders over 100 MAD', 'fixed', 20, 100, NULL, now() + interval '30 days'),
  ('BIGORDER', '15% off orders over 200 MAD', 'percentage', 15, 200, 50, now() + interval '30 days');