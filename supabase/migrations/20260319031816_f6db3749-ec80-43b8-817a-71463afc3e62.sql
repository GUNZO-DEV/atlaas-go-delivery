
-- Enable pg_net extension for HTTP calls from database functions
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Create the send email hook function that bridges to the Resend edge function
CREATE OR REPLACE FUNCTION public.send_email_hook(event jsonb)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  supabase_url text;
  service_key text;
BEGIN
  -- Get project URL and service key
  supabase_url := current_setting('request.headers', true)::json->>'host';
  
  -- Use vault to get service role key
  SELECT decrypted_secret INTO service_key
  FROM vault.decrypted_secrets
  WHERE name = 'email_queue_service_role_key'
  LIMIT 1;

  -- If no vault secret, try the direct env approach
  IF service_key IS NULL THEN
    service_key := current_setting('supabase.service_role_key', true);
  END IF;

  -- Call the auth-email-hook edge function via pg_net
  PERFORM net.http_post(
    url := 'https://fuvwfwkipsfnvpjefemt.supabase.co/functions/v1/auth-email-hook',
    headers := jsonb_build_object(
      'Content-Type', 'application/json'
    ),
    body := event
  );

  RETURN event;
END;
$$;

-- Grant execute to supabase_auth_admin so the auth system can call it
GRANT EXECUTE ON FUNCTION public.send_email_hook TO supabase_auth_admin;

-- Revoke from regular users for security
REVOKE EXECUTE ON FUNCTION public.send_email_hook FROM authenticated, anon, public;
