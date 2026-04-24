import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.75.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GATEWAY_URL = "https://connector-gateway.lovable.dev/twilio";

const STATUS_MESSAGES: Record<string, { title: string; body: string }> = {
  confirmed: { title: "Order Confirmed ✅", body: "Your order has been confirmed and is being prepared!" },
  preparing: { title: "Preparing 👨‍🍳", body: "The restaurant is now preparing your food." },
  ready_for_pickup: { title: "Ready! 📦", body: "Your order is ready and waiting for a rider." },
  picking_it_up: { title: "Rider Coming 🏃", body: "A rider is heading to pick up your order." },
  picked_up: { title: "Picked Up 🛵", body: "Your rider has picked up your order!" },
  delivering: { title: "On the Way 🚀", body: "Your order is on its way to you!" },
  delivered: { title: "Delivered ✅", body: "Your order has been delivered. Enjoy!" },
  cancelled: { title: "Cancelled ❌", body: "Your order has been cancelled." },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const TWILIO_API_KEY = Deno.env.get("TWILIO_API_KEY");
    if (!TWILIO_API_KEY) throw new Error("TWILIO_API_KEY is not configured");

    const TWILIO_PHONE_NUMBER = Deno.env.get("TWILIO_PHONE_NUMBER");
    if (!TWILIO_PHONE_NUMBER) throw new Error("TWILIO_PHONE_NUMBER is not configured");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { order_id, status, customer_id } = await req.json();

    if (!order_id || !status || !customer_id) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const statusInfo = STATUS_MESSAGES[status];
    if (!statusInfo) {
      return new Response(
        JSON.stringify({ success: true, message: "No SMS for this status" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get customer phone from profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("phone, full_name")
      .eq("id", customer_id)
      .single();

    if (!profile?.phone) {
      return new Response(
        JSON.stringify({ success: true, message: "No phone number on file" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const smsBody = `AtlaasGo: ${statusInfo.title}\n${statusInfo.body}\n\nOrder #${order_id.slice(0, 8)}`;

    const response = await fetch(`${GATEWAY_URL}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": TWILIO_API_KEY,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        To: profile.phone,
        From: TWILIO_PHONE_NUMBER,
        Body: smsBody,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error(`Twilio error [${response.status}]:`, JSON.stringify(data));
      // Don't throw - order status change should succeed even if SMS fails
      return new Response(
        JSON.stringify({ success: false, error: `SMS failed: ${data.message}` }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, sid: data.sid }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Order SMS error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
