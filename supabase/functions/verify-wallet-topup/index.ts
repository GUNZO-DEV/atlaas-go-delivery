import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) throw new Error("No authorization header");

    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: { headers: { Authorization: authHeader } },
        auth: { persistSession: false },
      }
    );

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getClaims(token);
    if (claimsError || !claimsData?.claims?.sub) throw new Error("Not authenticated");

    const userId = claimsData.claims.sub as string;
    const { sessionId, type } = await req.json();

    if (!sessionId || typeof sessionId !== "string") {
      throw new Error("Missing Stripe session ID");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.metadata?.user_id !== userId) {
      throw new Error("This payment session does not belong to the current user");
    }

    const checkoutType = type ?? session.metadata?.type;

    if (checkoutType === "wallet_topup") {
      if (session.payment_status !== "paid") {
        throw new Error("Wallet payment has not been completed yet");
      }

      const amount = Number(session.metadata?.amount ?? (session.amount_total ?? 0) / 100);
      if (!amount || amount < 10 || amount > 10000) {
        throw new Error("Invalid wallet top-up amount");
      }

      const description = `Wallet top-up (Stripe session ${session.id})`;

      const { data: existingTx, error: existingTxError } = await supabaseAdmin
        .from("wallet_transactions")
        .select("id")
        .eq("user_id", userId)
        .eq("transaction_type", "top_up")
        .eq("description", description)
        .maybeSingle();

      if (existingTxError) throw existingTxError;
      if (existingTx?.id) {
        return json({ success: true, alreadyProcessed: true, amount });
      }

      const { data: profile, error: profileError } = await supabaseAdmin
        .from("profiles")
        .select("wallet_balance")
        .eq("id", userId)
        .single();

      if (profileError) throw profileError;

      const currentBalance = Number(profile.wallet_balance ?? 0);

      const { error: updateError } = await supabaseAdmin
        .from("profiles")
        .update({ wallet_balance: currentBalance + amount })
        .eq("id", userId);

      if (updateError) throw updateError;

      const { error: txError } = await supabaseAdmin.from("wallet_transactions").insert({
        user_id: userId,
        amount,
        transaction_type: "top_up",
        description,
      });

      if (txError) throw txError;

      return json({ success: true, amount });
    }

    if (checkoutType === "prime_membership") {
      if (session.payment_status !== "paid") {
        throw new Error("Prime payment has not been completed yet");
      }

      let startedAt = new Date().toISOString();
      let expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      if (typeof session.subscription === "string") {
        const subscription = await stripe.subscriptions.retrieve(session.subscription);
        startedAt = new Date(subscription.current_period_start * 1000).toISOString();
        expiresAt = new Date(subscription.current_period_end * 1000).toISOString();
      }

      const paymentMethodRef = typeof session.subscription === "string"
        ? `stripe_subscription:${session.subscription}`
        : `stripe_checkout:${session.id}`;

      const { data: existingMembership, error: existingMembershipError } = await supabaseAdmin
        .from("prime_memberships")
        .select("id, expires_at")
        .eq("user_id", userId)
        .eq("payment_method", paymentMethodRef)
        .maybeSingle();

      if (existingMembershipError) throw existingMembershipError;

      if (!existingMembership?.id) {
        const now = new Date().toISOString();

        await supabaseAdmin
          .from("prime_memberships")
          .update({ status: "cancelled", cancelled_at: now, updated_at: now })
          .eq("user_id", userId)
          .eq("status", "active");

        const { error: membershipError } = await supabaseAdmin.from("prime_memberships").insert({
          user_id: userId,
          status: "active",
          price: 49,
          started_at: startedAt,
          expires_at: expiresAt,
          payment_method: paymentMethodRef,
          created_at: now,
          updated_at: now,
        });

        if (membershipError) throw membershipError;
      }

      const { error: profileUpdateError } = await supabaseAdmin
        .from("profiles")
        .update({ is_prime_member: true, prime_expires_at: expiresAt })
        .eq("id", userId);

      if (profileUpdateError) throw profileUpdateError;

      return json({ success: true, expiresAt });
    }

    throw new Error("Unsupported checkout type");
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return json({ error: msg }, 500);
  }
});