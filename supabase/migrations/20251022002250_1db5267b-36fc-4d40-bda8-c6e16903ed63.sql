-- Enable realtime for chat_messages table
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;

-- Make sure delivery_tracking is also enabled for realtime
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.delivery_tracking;
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;