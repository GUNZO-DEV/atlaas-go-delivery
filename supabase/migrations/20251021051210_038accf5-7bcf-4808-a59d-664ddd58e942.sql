-- Create rewards catalog table
CREATE TABLE IF NOT EXISTS public.rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  points_cost INTEGER NOT NULL,
  reward_type TEXT NOT NULL CHECK (reward_type IN ('coupon', 'free_delivery', 'discount', 'other')),
  reward_value NUMERIC NOT NULL,
  icon TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create redemptions tracking table
CREATE TABLE IF NOT EXISTS public.loyalty_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  reward_id UUID NOT NULL REFERENCES public.rewards(id),
  points_spent INTEGER NOT NULL,
  coupon_code TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  used BOOLEAN DEFAULT false,
  used_at TIMESTAMP WITH TIME ZONE,
  order_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_redemptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for rewards
CREATE POLICY "Anyone can view active rewards"
  ON public.rewards FOR SELECT
  USING (is_active = true);

-- RLS Policies for redemptions
CREATE POLICY "Users can view their own redemptions"
  ON public.loyalty_redemptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create redemptions"
  ON public.loyalty_redemptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own redemptions"
  ON public.loyalty_redemptions FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to redeem points for a reward
CREATE OR REPLACE FUNCTION public.redeem_reward(
  p_reward_id UUID,
  p_user_id UUID
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_reward RECORD;
  v_user_points INTEGER;
  v_coupon_code TEXT;
  v_expires_at TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get reward details
  SELECT * INTO v_reward
  FROM public.rewards
  WHERE id = p_reward_id AND is_active = true;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Reward not found or inactive';
  END IF;

  -- Get user's current points
  SELECT loyalty_points INTO v_user_points
  FROM public.profiles
  WHERE id = p_user_id;

  -- Check if user has enough points
  IF v_user_points < v_reward.points_cost THEN
    RAISE EXCEPTION 'Insufficient points. You have % points but need %', v_user_points, v_reward.points_cost;
  END IF;

  -- Generate coupon code for coupon rewards
  IF v_reward.reward_type = 'coupon' THEN
    v_coupon_code := 'ATLAAS-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
    v_expires_at := now() + INTERVAL '30 days';
  ELSIF v_reward.reward_type = 'free_delivery' THEN
    v_coupon_code := 'FREEDEL-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
    v_expires_at := now() + INTERVAL '7 days';
  END IF;

  -- Deduct points from user
  UPDATE public.profiles
  SET loyalty_points = loyalty_points - v_reward.points_cost
  WHERE id = p_user_id;

  -- Record the redemption
  INSERT INTO public.loyalty_redemptions (
    user_id,
    reward_id,
    points_spent,
    coupon_code,
    expires_at
  ) VALUES (
    p_user_id,
    p_reward_id,
    v_reward.points_cost,
    v_coupon_code,
    v_expires_at
  );

  -- Record loyalty transaction
  INSERT INTO public.loyalty_transactions (
    user_id,
    points,
    transaction_type,
    description
  ) VALUES (
    p_user_id,
    -v_reward.points_cost,
    'redeemed',
    'Redeemed: ' || v_reward.name
  );

  -- Send notification
  PERFORM create_notification(
    p_user_id,
    'Reward Redeemed!',
    'You redeemed ' || v_reward.name || '. Your coupon code: ' || COALESCE(v_coupon_code, 'N/A'),
    'reward_redeemed'
  );

  RETURN v_coupon_code;
END;
$$;

-- Insert initial rewards
INSERT INTO public.rewards (name, description, points_cost, reward_type, reward_value, icon) VALUES
('100 DH Coupon', 'Get 100 DH off your next order', 1000, 'coupon', 100, '💰'),
('Free Delivery', 'Free delivery on your next order', 500, 'free_delivery', 15, '🚚'),
('50 DH Coupon', 'Get 50 DH off your next order', 500, 'coupon', 50, '🎁'),
('20% Discount', 'Get 20% off your next order (max 100 DH)', 800, 'discount', 20, '🏷️');

-- Trigger for updated_at
CREATE TRIGGER update_rewards_updated_at
  BEFORE UPDATE ON public.rewards
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();