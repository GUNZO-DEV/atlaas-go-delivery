import { supabase } from "@/integrations/supabase/client";

/**
 * Sends an SMS notification to the customer when order status changes.
 * This is fire-and-forget - failures are logged but don't block the flow.
 */
export const sendOrderStatusSMS = async (
  orderId: string,
  status: string,
  customerId: string
) => {
  try {
    const { error } = await supabase.functions.invoke("send-order-sms", {
      body: { order_id: orderId, status, customer_id: customerId },
    });
    if (error) {
      console.error("Order SMS error:", error);
    }
  } catch (err) {
    console.error("Failed to send order SMS:", err);
  }
};
