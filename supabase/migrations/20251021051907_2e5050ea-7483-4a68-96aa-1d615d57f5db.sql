-- Create prime_memberships table
CREATE TABLE public.prime_memberships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  price NUMERIC NOT NULL DEFAULT 49.00,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  payment_method TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add prime status to profiles
ALTER TABLE public.profiles
ADD COLUMN is_prime_member BOOLEAN DEFAULT false,
ADD COLUMN prime_expires_at TIMESTAMP WITH TIME ZONE;

-- Enable RLS
ALTER TABLE public.prime_memberships ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own prime membership"
ON public.prime_memberships FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own prime membership"
ON public.prime_memberships FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own prime membership"
ON public.prime_memberships FOR UPDATE
USING (auth.uid() = user_id);

-- Trigger to update profiles when prime membership changes
CREATE OR REPLACE FUNCTION update_prime_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'active' THEN
    UPDATE public.profiles
    SET 
      is_prime_member = true,
      prime_expires_at = NEW.expires_at
    WHERE id = NEW.user_id;
  ELSE
    UPDATE public.profiles
    SET 
      is_prime_member = false,
      prime_expires_at = NULL
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_prime_status_trigger
AFTER INSERT OR UPDATE ON public.prime_memberships
FOR EACH ROW
EXECUTE FUNCTION update_prime_status();

-- Update loyalty points trigger to give 2x for Prime members
CREATE OR REPLACE FUNCTION award_loyalty_points()
RETURNS TRIGGER AS $$
DECLARE
  points_to_award INTEGER;
  is_prime BOOLEAN;
BEGIN
  IF NEW.status = 'delivered' AND OLD.status != 'delivered' THEN
    -- Check if user is Prime member
    SELECT is_prime_member INTO is_prime
    FROM public.profiles
    WHERE id = NEW.customer_id;
    
    -- Award 1 point per 10 MAD spent (2x for Prime)
    points_to_award := FLOOR(NEW.total_amount / 10);
    IF is_prime THEN
      points_to_award := points_to_award * 2;
    END IF;
    
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
      CASE WHEN is_prime 
        THEN 'Points earned from order (Prime 2x bonus)' 
        ELSE 'Points earned from order' 
      END
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Update orders to apply free delivery for Prime members
CREATE OR REPLACE FUNCTION apply_prime_benefits()
RETURNS TRIGGER AS $$
DECLARE
  is_prime BOOLEAN;
BEGIN
  -- Check if user is Prime member
  SELECT is_prime_member INTO is_prime
  FROM public.profiles
  WHERE id = NEW.customer_id;
  
  -- Apply free delivery for Prime members
  IF is_prime THEN
    NEW.delivery_fee := 0;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER apply_prime_benefits_trigger
BEFORE INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION apply_prime_benefits();