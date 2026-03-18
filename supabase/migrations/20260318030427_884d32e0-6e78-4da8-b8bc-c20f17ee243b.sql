
CREATE TABLE public.phone_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number TEXT NOT NULL UNIQUE,
  otp_code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- No RLS needed - accessed only via service role in edge functions
ALTER TABLE public.phone_verifications ENABLE ROW LEVEL SECURITY;
