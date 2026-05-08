
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view chat for their orders" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can send chat messages for their orders" ON public.chat_messages;

-- SELECT: only customer and rider
CREATE POLICY "Order customer and rider can view chat"
ON public.chat_messages FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = chat_messages.order_id
      AND (orders.customer_id = auth.uid() OR orders.rider_id = auth.uid())
  )
);

-- INSERT: only customer and rider, sender must be self
CREATE POLICY "Order customer and rider can send chat"
ON public.chat_messages FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = sender_id
  AND EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = chat_messages.order_id
      AND (orders.customer_id = auth.uid() OR orders.rider_id = auth.uid())
  )
);

-- UPDATE: allow marking messages as read (only read_at field, by the other participant)
CREATE POLICY "Participants can mark messages as read"
ON public.chat_messages FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = chat_messages.order_id
      AND (orders.customer_id = auth.uid() OR orders.rider_id = auth.uid())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = chat_messages.order_id
      AND (orders.customer_id = auth.uid() OR orders.rider_id = auth.uid())
  )
);
