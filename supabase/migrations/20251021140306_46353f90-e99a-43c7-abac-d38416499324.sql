-- Fix redeem_reward function to prevent unauthorized redemptions
CREATE OR REPLACE FUNCTION public.redeem_reward(p_reward_id uuid, p_user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_reward RECORD;
  v_user_points INTEGER;
  v_coupon_code TEXT;
  v_expires_at TIMESTAMP WITH TIME ZONE;
BEGIN
  -- SECURITY: Verify caller owns the user_id
  IF p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized: Cannot redeem rewards for another user';
  END IF;

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
$function$;