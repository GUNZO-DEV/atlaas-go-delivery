import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: any) => {
  console.log(`[STRIPE-WEBHOOK] ${step}${details ? ` - ${JSON.stringify(details)}` : ''}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const body = await req.text();
    const sig = req.headers.get("stripe-signature");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

    let event: Stripe.Event;

    if (webhookSecret && sig) {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
      logStep("Webhook signature verified");
    } else {
      // For development, parse without verification
      event = JSON.parse(body);
      logStep("Webhook received (unverified)", { type: event.type });
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.order_id;
        const userId = session.metadata?.user_id;

        logStep("Checkout completed", { orderId, userId, paymentStatus: session.payment_status });

        if (orderId && session.payment_status === "paid") {
          // Update order payment status
          const { error } = await supabase
            .from("orders")
            .update({
              payment_status: "paid",
              payment_method: "stripe",
              status: "confirmed",
            })
            .eq("id", orderId);

          if (error) {
            logStep("Error updating order", { error: error.message });
          } else {
            logStep("Order updated to paid", { orderId });

            // Send notification
            if (userId) {
              await supabase.from("notifications").insert({
                user_id: userId,
                title: "Payment Successful! 💳",
                message: "Your online payment has been confirmed. Your order is being prepared.",
                type: "payment_confirmed",
                related_order_id: orderId,
              });
            }
          }
        }
        break;
      }

      case "account.updated": {
        const account = event.data.object as Stripe.Account;
        logStep("Account updated", { accountId: account.id, chargesEnabled: account.charges_enabled });

        if (account.charges_enabled) {
          // Mark restaurant onboarding as complete
          const { error } = await supabase
            .from("restaurants")
            .update({ stripe_onboarding_complete: true })
            .eq("stripe_account_id", account.id);

          if (error) {
            logStep("Error updating restaurant", { error: error.message });
          } else {
            logStep("Restaurant onboarding marked complete");
          }
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const pi = event.data.object as Stripe.PaymentIntent;
        const orderId = pi.metadata?.order_id;
        logStep("Payment failed", { orderId });

        if (orderId) {
          await supabase
            .from("orders")
            .update({ payment_status: "failed" })
            .eq("id", orderId);
        }
        break;
      }

      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
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
