-- Add WhatsApp ordering mode to restaurants
ALTER TABLE public.restaurants
ADD COLUMN IF NOT EXISTS whatsapp_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS whatsapp_number text;

-- Add document fields to rider_profiles if not exists
ALTER TABLE public.rider_profiles
ADD COLUMN IF NOT EXISTS driver_license_url text,
ADD COLUMN IF NOT EXISTS id_card_url text,
ADD COLUMN IF NOT EXISTS vehicle_registration_url text;

-- Add platform settings table
CREATE TABLE IF NOT EXISTS public.platform_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value jsonb NOT NULL,
  updated_at timestamp with time zone DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can manage settings
CREATE POLICY "Admins can manage platform settings"
ON public.platform_settings
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::user_role))
WITH CHECK (has_role(auth.uid(), 'admin'::user_role));

-- Insert default platform settings
INSERT INTO public.platform_settings (setting_key, setting_value) VALUES
('delivery_fee', '{"default": 15, "currency": "MAD"}'::jsonb),
('commission_rate', '{"default": 10, "unit": "percentage"}'::jsonb),
('operating_hours', '{"start": "08:00", "end": "23:00"}'::jsonb)
ON CONFLICT (setting_key) DO NOTHING;