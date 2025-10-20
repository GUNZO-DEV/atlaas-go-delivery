-- Create restaurant applications table
CREATE TABLE IF NOT EXISTS public.restaurant_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  restaurant_name TEXT NOT NULL,
  description TEXT,
  cuisine_type TEXT,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  business_license TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id)
);

-- Create rider profiles table
CREATE TABLE IF NOT EXISTS public.rider_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rider_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  vehicle_type TEXT NOT NULL CHECK (vehicle_type IN ('motorcycle', 'bicycle', 'car', 'scooter')),
  vehicle_plate_number TEXT NOT NULL,
  license_number TEXT NOT NULL,
  phone TEXT NOT NULL,
  city TEXT NOT NULL,
  is_available BOOLEAN DEFAULT true,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
  rejection_reason TEXT,
  rating NUMERIC DEFAULT 0,
  total_deliveries INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.restaurant_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rider_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for restaurant_applications
CREATE POLICY "Merchants can view their own applications"
  ON public.restaurant_applications
  FOR SELECT
  USING (auth.uid() = merchant_id);

CREATE POLICY "Merchants can create applications"
  ON public.restaurant_applications
  FOR INSERT
  WITH CHECK (auth.uid() = merchant_id);

CREATE POLICY "Admins can view all applications"
  ON public.restaurant_applications
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update applications"
  ON public.restaurant_applications
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for rider_profiles
CREATE POLICY "Riders can view their own profile"
  ON public.rider_profiles
  FOR SELECT
  USING (auth.uid() = rider_id);

CREATE POLICY "Riders can insert their own profile"
  ON public.rider_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = rider_id);

CREATE POLICY "Riders can update their own profile"
  ON public.rider_profiles
  FOR UPDATE
  USING (auth.uid() = rider_id AND status = 'pending');

CREATE POLICY "Admins can view all rider profiles"
  ON public.rider_profiles
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update rider profiles"
  ON public.rider_profiles
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

-- Function to approve restaurant application
CREATE OR REPLACE FUNCTION public.approve_restaurant_application(
  application_id UUID,
  admin_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_application RECORD;
  v_restaurant_id UUID;
BEGIN
  -- Check if user is admin
  IF NOT has_role(admin_id, 'admin') THEN
    RAISE EXCEPTION 'Only admins can approve applications';
  END IF;

  -- Get application details
  SELECT * INTO v_application
  FROM public.restaurant_applications
  WHERE id = application_id AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Application not found or already processed';
  END IF;

  -- Create restaurant
  INSERT INTO public.restaurants (
    merchant_id,
    name,
    description,
    cuisine_type,
    address,
    phone,
    is_active
  ) VALUES (
    v_application.merchant_id,
    v_application.restaurant_name,
    v_application.description,
    v_application.cuisine_type,
    v_application.address,
    v_application.phone,
    true
  ) RETURNING id INTO v_restaurant_id;

  -- Update application status
  UPDATE public.restaurant_applications
  SET 
    status = 'approved',
    reviewed_at = now(),
    reviewed_by = admin_id,
    updated_at = now()
  WHERE id = application_id;

  -- Send notification to merchant
  PERFORM create_notification(
    v_application.merchant_id,
    'Restaurant Application Approved',
    'Congratulations! Your restaurant application has been approved.',
    'application_approved'
  );

  RETURN v_restaurant_id;
END;
$$;

-- Function to reject restaurant application
CREATE OR REPLACE FUNCTION public.reject_restaurant_application(
  application_id UUID,
  admin_id UUID,
  reason TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_merchant_id UUID;
BEGIN
  -- Check if user is admin
  IF NOT has_role(admin_id, 'admin') THEN
    RAISE EXCEPTION 'Only admins can reject applications';
  END IF;

  -- Get merchant_id
  SELECT merchant_id INTO v_merchant_id
  FROM public.restaurant_applications
  WHERE id = application_id AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Application not found or already processed';
  END IF;

  -- Update application status
  UPDATE public.restaurant_applications
  SET 
    status = 'rejected',
    rejection_reason = reason,
    reviewed_at = now(),
    reviewed_by = admin_id,
    updated_at = now()
  WHERE id = application_id;

  -- Send notification to merchant
  PERFORM create_notification(
    v_merchant_id,
    'Restaurant Application Rejected',
    'Your restaurant application has been rejected: ' || reason,
    'application_rejected'
  );
END;
$$;

-- Function to approve rider application
CREATE OR REPLACE FUNCTION public.approve_rider_application(
  rider_profile_id UUID,
  admin_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_rider_id UUID;
BEGIN
  -- Check if user is admin
  IF NOT has_role(admin_id, 'admin') THEN
    RAISE EXCEPTION 'Only admins can approve applications';
  END IF;

  -- Get rider_id
  SELECT rider_id INTO v_rider_id
  FROM public.rider_profiles
  WHERE id = rider_profile_id AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Rider profile not found or already processed';
  END IF;

  -- Update rider status
  UPDATE public.rider_profiles
  SET 
    status = 'approved',
    reviewed_at = now(),
    reviewed_by = admin_id,
    updated_at = now()
  WHERE id = rider_profile_id;

  -- Send notification to rider
  PERFORM create_notification(
    v_rider_id,
    'Rider Application Approved',
    'Congratulations! Your rider application has been approved. You can now start accepting orders.',
    'application_approved'
  );
END;
$$;

-- Function to reject rider application
CREATE OR REPLACE FUNCTION public.reject_rider_application(
  rider_profile_id UUID,
  admin_id UUID,
  reason TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_rider_id UUID;
BEGIN
  -- Check if user is admin
  IF NOT has_role(admin_id, 'admin') THEN
    RAISE EXCEPTION 'Only admins can reject applications';
  END IF;

  -- Get rider_id
  SELECT rider_id INTO v_rider_id
  FROM public.rider_profiles
  WHERE id = rider_profile_id AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Rider profile not found or already processed';
  END IF;

  -- Update rider status
  UPDATE public.rider_profiles
  SET 
    status = 'rejected',
    rejection_reason = reason,
    reviewed_at = now(),
    reviewed_by = admin_id,
    updated_at = now()
  WHERE id = rider_profile_id;

  -- Send notification to rider
  PERFORM create_notification(
    v_rider_id,
    'Rider Application Rejected',
    'Your rider application has been rejected: ' || reason,
    'application_rejected'
  );
END;
$$;

-- Triggers for updated_at
CREATE TRIGGER update_restaurant_applications_updated_at
  BEFORE UPDATE ON public.restaurant_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rider_profiles_updated_at
  BEFORE UPDATE ON public.rider_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();