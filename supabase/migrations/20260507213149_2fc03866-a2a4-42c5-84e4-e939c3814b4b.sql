-- Add read_at column for read receipts
ALTER TABLE public.chat_messages ADD COLUMN IF NOT EXISTS read_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Index for efficient unread-count queries
CREATE INDEX IF NOT EXISTS idx_chat_messages_unread ON public.chat_messages (order_id, sender_id, read_at) WHERE read_at IS NULL;