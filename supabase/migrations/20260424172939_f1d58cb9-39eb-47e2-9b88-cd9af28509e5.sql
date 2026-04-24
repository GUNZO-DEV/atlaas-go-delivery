-- Saved addresses for customers
CREATE TABLE public.saved_addresses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude NUMERIC,
  longitude NUMERIC,
  is_default BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_saved_addresses_user_id ON public.saved_addresses(user_id);

ALTER TABLE public.saved_addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own saved addresses"
  ON public.saved_addresses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own saved addresses"
  ON public.saved_addresses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own saved addresses"
  ON public.saved_addresses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved addresses"
  ON public.saved_addresses FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_saved_addresses_updated_at
  BEFORE UPDATE ON public.saved_addresses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Ensure only one default per user
CREATE OR REPLACE FUNCTION public.ensure_single_default_address()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.is_default = true THEN
    UPDATE public.saved_addresses
    SET is_default = false
    WHERE user_id = NEW.user_id
      AND id <> NEW.id
      AND is_default = true;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER ensure_single_default_address_trigger
  BEFORE INSERT OR UPDATE ON public.saved_addresses
  FOR EACH ROW
  EXECUTE FUNCTION public.ensure_single_default_address();