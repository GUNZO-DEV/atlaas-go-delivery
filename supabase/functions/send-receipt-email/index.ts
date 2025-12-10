import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ReceiptEmailRequest {
  orderId: string;
  userEmail: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderId, userEmail }: ReceiptEmailRequest = await req.json();

    console.log(`Sending receipt email for order ${orderId} to ${userEmail}`);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(`
        id,
        status,
        total_amount,
        delivery_fee,
        delivery_address,
        created_at,
        restaurant:restaurants(name),
        order_items(
          quantity,
          price,
          menu_item:menu_items(name)
        )
      `)
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      console.error("Order fetch error:", orderError);
      return new Response(
        JSON.stringify({ error: "Order not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const items = order.order_items as any[] || [];
    const subtotal = items.reduce(
      (sum: number, item: any) => sum + (item.quantity * item.price),
      0
    ) || order.total_amount;

    const orderDate = new Date(order.created_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const itemsHtml = items.map((item: any) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.menu_item?.name || 'Item'}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${(item.quantity * item.price).toFixed(2)} MAD</td>
      </tr>
    `).join('');

    const restaurant = order.restaurant as any;
    const total = (subtotal + order.delivery_fee).toFixed(2);

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Order Receipt - Atlaas Go</title>
      </head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        <div style="background: linear-gradient(135deg, #C75B12 0%, #E88B3C 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Atlaas Go</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Order Receipt</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 20px;">
            <p style="margin: 5px 0; color: #666;"><strong>Order ID:</strong> ${order.id.slice(0, 8).toUpperCase()}</p>
            <p style="margin: 5px 0; color: #666;"><strong>Date:</strong> ${orderDate}</p>
            <p style="margin: 5px 0; color: #666;"><strong>Restaurant:</strong> ${restaurant?.name || 'Restaurant'}</p>
            <p style="margin: 5px 0; color: #666;"><strong>Delivery Address:</strong> ${order.delivery_address}</p>
          </div>
          
          <h3 style="color: #333; margin-bottom: 15px;">Order Items</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f9f9f9;">
                <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Item</th>
                <th style="padding: 10px; text-align: center; border-bottom: 2px solid #ddd;">Qty</th>
                <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          
          <div style="margin-top: 20px; padding-top: 20px; border-top: 2px solid #eee;">
            <table style="width: 100%;">
              <tr>
                <td style="color: #666;">Subtotal:</td>
                <td style="text-align: right; color: #333;">${subtotal.toFixed(2)} MAD</td>
              </tr>
              <tr>
                <td style="color: #666;">Delivery Fee:</td>
                <td style="text-align: right; color: #333;">${order.delivery_fee.toFixed(2)} MAD</td>
              </tr>
              <tr style="border-top: 2px solid #C75B12;">
                <td style="font-weight: bold; font-size: 18px; color: #333; padding-top: 15px;">Total:</td>
                <td style="text-align: right; font-weight: bold; font-size: 18px; color: #C75B12; padding-top: 15px;">${total} MAD</td>
              </tr>
            </table>
          </div>
          
          <div style="margin-top: 30px; padding: 20px; background: #f9f9f9; border-radius: 8px; text-align: center;">
            <p style="margin: 0; color: #666; font-size: 14px;">Thank you for ordering with Atlaas Go!</p>
            <p style="margin: 10px 0 0 0; color: #999; font-size: 12px;">For support, contact us at support@atlaasgo.com</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "Atlaas Go <onboarding@resend.dev>",
      to: [userEmail],
      subject: `Your Order Receipt - ${order.id.slice(0, 8).toUpperCase()}`,
      html: emailHtml,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-receipt-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
