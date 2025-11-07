-- Add referral system tables and columns

-- Add referral_code to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS referral_count INTEGER DEFAULT 0;

-- Create referrals tracking table
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  discount_used BOOLEAN DEFAULT false,
  discount_amount NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(referrer_id, referred_id)
);

-- Enable RLS on referrals table
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- RLS policies for referrals
CREATE POLICY "Users can view their own referrals"
  ON public.referrals
  FOR SELECT
  USING (auth.uid() = referrer_id);

CREATE POLICY "System can insert referrals"
  ON public.referrals
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their referral usage"
  ON public.referrals
  FOR UPDATE
  USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate 8 character alphanumeric code
    new_code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE referral_code = new_code) INTO code_exists;
    
    -- Exit loop if code is unique
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  RETURN new_code;
END;
$$;

-- Function to apply referral when user signs up
CREATE OR REPLACE FUNCTION apply_referral_code(user_id UUID, ref_code TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  referrer_id UUID;
BEGIN
  -- Find the referrer
  SELECT id INTO referrer_id
  FROM public.profiles
  WHERE referral_code = ref_code AND id != user_id;
  
  IF referrer_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Update referred user's profile
  UPDATE public.profiles
  SET referred_by = referrer_id
  WHERE id = user_id;
  
  -- Increment referrer's count
  UPDATE public.profiles
  SET referral_count = referral_count + 1
  WHERE id = referrer_id;
  
  -- Create referral record
  INSERT INTO public.referrals (referrer_id, referred_id)
  VALUES (referrer_id, user_id);
  
  -- Send notification to referrer
  PERFORM create_notification(
    referrer_id,
    'New Referral!',
    'Someone used your referral code! You both get 10% off your next order.',
    'referral_success'
  );
  
  RETURN true;
END;
$$;

-- Update handle_new_user function to generate referral code
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, referral_code)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    generate_referral_code()
  );
  
  -- Assign customer role by default
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'customer');
  
  RETURN NEW;
END;
$$;

-- Generate referral codes for existing users
UPDATE public.profiles
SET referral_code = generate_referral_code()
WHERE referral_code IS NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON public.profiles(referral_code);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON public.referrals(referrer_id);
