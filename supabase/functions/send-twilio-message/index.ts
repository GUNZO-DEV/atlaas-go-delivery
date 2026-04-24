import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.75.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GATEWAY_URL = "https://connector-gateway.lovable.dev/twilio";

interface MessageRequest {
  to: string;
  body: string;
  channel?: "sms" | "whatsapp";
  // For internal use - context about the message
  context?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const TWILIO_API_KEY = Deno.env.get("TWILIO_API_KEY");
    if (!TWILIO_API_KEY) {
      throw new Error("TWILIO_API_KEY is not configured");
    }

    const TWILIO_PHONE_NUMBER = Deno.env.get("TWILIO_PHONE_NUMBER");
    if (!TWILIO_PHONE_NUMBER) {
      throw new Error("TWILIO_PHONE_NUMBER is not configured");
    }

    const { to, body, channel = "sms", context } = (await req.json()) as MessageRequest;

    if (!to || !body) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: to, body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Format phone numbers for WhatsApp
    const fromNumber = channel === "whatsapp" 
      ? `whatsapp:${TWILIO_PHONE_NUMBER}` 
      : TWILIO_PHONE_NUMBER;
    const toNumber = channel === "whatsapp" 
      ? `whatsapp:${to}` 
      : to;

    console.log(`Sending ${channel} message to ${to} [context: ${context || "none"}]`);

    const response = await fetch(`${GATEWAY_URL}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": TWILIO_API_KEY,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        To: toNumber,
        From: fromNumber,
        Body: body,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`Twilio API error [${response.status}]:`, JSON.stringify(data));
      throw new Error(`Twilio API error [${response.status}]: ${JSON.stringify(data)}`);
    }

    console.log(`Message sent successfully. SID: ${data.sid}`);

    return new Response(
      JSON.stringify({ success: true, sid: data.sid }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error sending message:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
