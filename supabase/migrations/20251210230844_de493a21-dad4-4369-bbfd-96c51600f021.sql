-- Create function to send push notification on order status change
CREATE OR REPLACE FUNCTION public.notify_order_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  status_message TEXT;
  notification_title TEXT;
BEGIN
  -- Only trigger on status changes
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  -- Set notification message based on status
  CASE NEW.status
    WHEN 'confirmed' THEN
      notification_title := 'Order Confirmed! 🎉';
      status_message := 'Your order has been confirmed and is being prepared.';
    WHEN 'preparing' THEN
      notification_title := 'Preparing Your Order 👨‍🍳';
      status_message := 'The restaurant is now preparing your delicious food.';
    WHEN 'ready_for_pickup' THEN
      notification_title := 'Ready for Pickup! 📦';
      status_message := 'Your order is ready and waiting for a rider.';
    WHEN 'picked_up' THEN
      notification_title := 'Order Picked Up 🛵';
      status_message := 'Your rider has picked up your order and is on the way!';
    WHEN 'picking_it_up' THEN
      notification_title := 'Rider En Route to Restaurant 🏃';
      status_message := 'Your rider is heading to pick up your order.';
    WHEN 'delivering' THEN
      notification_title := 'On the Way! 🚀';
      status_message := 'Your order is being delivered to you now.';
    WHEN 'delivered' THEN
      notification_title := 'Delivered! ✅';
      status_message := 'Your order has been delivered. Enjoy your meal!';
    WHEN 'cancelled' THEN
      notification_title := 'Order Cancelled ❌';
      status_message := 'Your order has been cancelled. Contact support if you have questions.';
    ELSE
      notification_title := 'Order Update';
      status_message := 'Your order status has been updated to: ' || NEW.status;
  END CASE;

  -- Insert notification into notifications table
  INSERT INTO public.notifications (user_id, title, message, type, related_order_id)
  VALUES (NEW.customer_id, notification_title, status_message, 'order_update', NEW.id);

  RETURN NEW;
END;
$$;

-- Create trigger for order status changes
DROP TRIGGER IF EXISTS trigger_order_status_notification ON public.orders;
CREATE TRIGGER trigger_order_status_notification
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_order_status_change();