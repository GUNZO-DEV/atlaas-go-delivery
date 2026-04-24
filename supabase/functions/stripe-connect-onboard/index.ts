import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.75.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: any) => {
  console.log(`[STRIPE-CONNECT-ONBOARD] ${step}${details ? ` - ${JSON.stringify(details)}` : ''}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData.user) throw new Error("Authentication failed");
    const user = userData.user;
    logStep("User authenticated", { userId: user.id });

    const { restaurant_id } = await req.json();
    if (!restaurant_id) throw new Error("restaurant_id is required");

    // Verify user owns this restaurant
    const { data: restaurant, error: restError } = await supabase
      .from("restaurants")
      .select("id, name, stripe_account_id, merchant_id")
      .eq("id", restaurant_id)
      .single();

    if (restError || !restaurant) throw new Error("Restaurant not found");
    if (restaurant.merchant_id !== user.id) throw new Error("Unauthorized");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const origin = req.headers.get("origin") || "https://atlaas-go-delivery.lovable.app";

    let accountId = restaurant.stripe_account_id;

    // Create Connect account if doesn't exist
    if (!accountId) {
      logStep("Creating new Stripe Connect account");
      const account = await stripe.accounts.create({
        type: "express",
        country: "MA", // Morocco
        email: user.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: "individual",
        business_profile: {
          name: restaurant.name,
          mcc: "5812", // Eating places, restaurants
        },
      });
      accountId = account.id;

      // Save the account ID
      await supabase
        .from("restaurants")
        .update({ stripe_account_id: accountId })
        .eq("id", restaurant_id);

      logStep("Connect account created", { accountId });
    }

    // Create onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${origin}/merchant-settings?stripe=refresh`,
      return_url: `${origin}/merchant-settings?stripe=complete`,
      type: "account_onboarding",
    });

    logStep("Onboarding link created", { url: accountLink.url });

    return new Response(JSON.stringify({ url: accountLink.url, account_id: accountId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: msg });
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
