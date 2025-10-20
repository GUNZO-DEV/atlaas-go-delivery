-- Create chat messages table
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  sender_type text NOT NULL CHECK (sender_type IN ('customer', 'merchant', 'rider')),
  message text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on chat_messages
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Enable realtime on chat_messages only (other tables already added)
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;

-- RLS policies for chat_messages
CREATE POLICY "Users can view chat for their orders"
ON public.chat_messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE id = order_id AND (
      customer_id = auth.uid() OR
      rider_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM public.restaurants
        WHERE id = orders.restaurant_id AND merchant_id = auth.uid()
      )
    )
  )
);

CREATE POLICY "Users can send chat messages for their orders"
ON public.chat_messages FOR INSERT
WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE id = order_id AND (
      customer_id = auth.uid() OR
      rider_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM public.restaurants
        WHERE id = orders.restaurant_id AND merchant_id = auth.uid()
      )
    )
  )
);

-- Create function to send notification on order status change
CREATE OR REPLACE FUNCTION public.notify_order_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Notify customer
  IF NEW.status != OLD.status THEN
    PERFORM create_notification(
      NEW.customer_id,
      'Order Status Updated',
      'Your order status is now: ' || NEW.status,
      'order_update',
      NEW.id
    );
    
    -- Notify rider if assigned
    IF NEW.rider_id IS NOT NULL THEN
      PERFORM create_notification(
        NEW.rider_id,
        'Order Status Updated',
        'Order status changed to: ' || NEW.status,
        'order_update',
        NEW.id
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for order status changes
DROP TRIGGER IF EXISTS order_status_change_notification ON public.orders;
CREATE TRIGGER order_status_change_notification
AFTER UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.notify_order_status_change();