-- Add loyalty points to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS loyalty_points integer DEFAULT 0;

-- Create loyalty transactions table
CREATE TABLE IF NOT EXISTS public.loyalty_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  points integer NOT NULL,
  transaction_type text NOT NULL CHECK (transaction_type IN ('earned', 'redeemed')),
  order_id uuid REFERENCES public.orders(id),
  description text,
  created_at timestamp with time zone DEFAULT now()
);

-- Create support tickets table
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  order_id uuid REFERENCES public.orders(id),
  subject text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create support ticket responses table
CREATE TABLE IF NOT EXISTS public.support_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  message text NOT NULL,
  is_staff boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Create rider earnings table
CREATE TABLE IF NOT EXISTS public.rider_earnings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rider_id uuid NOT NULL REFERENCES auth.users(id),
  order_id uuid NOT NULL REFERENCES public.orders(id),
  base_fee numeric NOT NULL,
  distance_bonus numeric DEFAULT 0,
  tip_amount numeric DEFAULT 0,
  total_earned numeric NOT NULL,
  paid_out boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rider_earnings ENABLE ROW LEVEL SECURITY;

-- RLS policies for loyalty_transactions
CREATE POLICY "Users can view their own loyalty transactions"
ON public.loyalty_transactions FOR SELECT
USING (auth.uid() = user_id);

-- RLS policies for support_tickets
CREATE POLICY "Users can create support tickets"
ON public.support_tickets FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own tickets"
ON public.support_tickets FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own tickets"
ON public.support_tickets FOR UPDATE
USING (auth.uid() = user_id);

-- RLS policies for support_responses
CREATE POLICY "Users can view responses for their tickets"
ON public.support_responses FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.support_tickets
    WHERE id = ticket_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can create responses for their tickets"
ON public.support_responses FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.support_tickets
    WHERE id = ticket_id AND user_id = auth.uid()
  )
);

-- RLS policies for rider_earnings
CREATE POLICY "Riders can view their own earnings"
ON public.rider_earnings FOR SELECT
USING (auth.uid() = rider_id);

-- Function to award loyalty points on order completion
CREATE OR REPLACE FUNCTION public.award_loyalty_points()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  points_to_award integer;
BEGIN
  IF NEW.status = 'delivered' AND OLD.status != 'delivered' THEN
    -- Award 1 point per 10 MAD spent
    points_to_award := FLOOR(NEW.total_amount / 10);
    
    -- Update user's loyalty points
    UPDATE public.profiles
    SET loyalty_points = loyalty_points + points_to_award
    WHERE id = NEW.customer_id;
    
    -- Record transaction
    INSERT INTO public.loyalty_transactions (user_id, points, transaction_type, order_id, description)
    VALUES (
      NEW.customer_id,
      points_to_award,
      'earned',
      NEW.id,
      'Points earned from order'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for loyalty points
DROP TRIGGER IF EXISTS award_loyalty_points_trigger ON public.orders;
CREATE TRIGGER award_loyalty_points_trigger
AFTER UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.award_loyalty_points();

-- Function to record rider earnings on delivery completion
CREATE OR REPLACE FUNCTION public.record_rider_earnings()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  base_fee numeric := 10.00;
  distance_bonus numeric := 0.00;
BEGIN
  IF NEW.status = 'delivered' AND OLD.status != 'delivered' AND NEW.rider_id IS NOT NULL THEN
    -- Calculate earnings (base fee + 50% of delivery fee)
    INSERT INTO public.rider_earnings (rider_id, order_id, base_fee, distance_bonus, total_earned)
    VALUES (
      NEW.rider_id,
      NEW.id,
      base_fee,
      NEW.delivery_fee * 0.5,
      base_fee + (NEW.delivery_fee * 0.5)
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for rider earnings
DROP TRIGGER IF EXISTS record_rider_earnings_trigger ON public.orders;
CREATE TRIGGER record_rider_earnings_trigger
AFTER UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.record_rider_earnings();