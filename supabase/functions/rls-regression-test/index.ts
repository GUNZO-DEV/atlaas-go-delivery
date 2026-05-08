import { createClient } from "npm:@supabase/supabase-js@2.75.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface TestResult {
  name: string;
  pass: boolean;
  expected: string;
  actual: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

  // --- Authenticate caller as admin ---
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const token = authHeader.replace("Bearer ", "");
  const anonClient = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: claimsData, error: claimsErr } =
    await anonClient.auth.getClaims(token);
  if (claimsErr || !claimsData?.claims?.sub) {
    return new Response(JSON.stringify({ error: "Invalid token" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const callerId = claimsData.claims.sub as string;
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: roleRow } = await admin
    .from("user_roles")
    .select("role")
    .eq("user_id", callerId)
    .eq("role", "admin")
    .maybeSingle();

  if (!roleRow) {
    return new Response(JSON.stringify({ error: "Admin role required" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // --- Gather test accounts ---
  const testEmails = [
    { email: "merchant@test.com", password: "merchant123", label: "customer" },
    { email: "rider@test.com", password: "rider123", label: "rider" },
    { email: "customer@test.com", password: "customer123", label: "outsider" },
  ];

  type SupaClient = ReturnType<typeof createClient>;
  const sessions: Record<string, { client: SupaClient; uid: string }> = {};

  for (const acct of testEmails) {
    const c = createClient(SUPABASE_URL, ANON_KEY);
    const { data, error } = await c.auth.signInWithPassword({
      email: acct.email,
      password: acct.password,
    });
    if (error) {
      return new Response(
        JSON.stringify({ error: `Login failed for ${acct.email}: ${error.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    sessions[acct.label] = { client: c, uid: data.user.id };
  }

  // --- Find or create a test order with both customer & rider ---
  let testOrderId: string;
  const { data: existingOrder } = await admin
    .from("orders")
    .select("id")
    .eq("customer_id", sessions.customer.uid)
    .eq("rider_id", sessions.rider.uid)
    .limit(1)
    .maybeSingle();

  if (existingOrder) {
    testOrderId = existingOrder.id;
  } else {
    const { data: anyOrder } = await admin
      .from("orders")
      .select("id")
      .eq("customer_id", sessions.customer.uid)
      .limit(1)
      .maybeSingle();

    if (anyOrder) {
      await admin
        .from("orders")
        .update({ rider_id: sessions.rider.uid, status: "delivering" })
        .eq("id", anyOrder.id);
      testOrderId = anyOrder.id;
    } else {
      const { data: restaurant } = await admin
        .from("restaurants")
        .select("id")
        .limit(1)
        .single();

      const { data: newOrder, error: orderErr } = await admin
        .from("orders")
        .insert({
          customer_id: sessions.customer.uid,
          rider_id: sessions.rider.uid,
          restaurant_id: restaurant!.id,
          status: "delivering",
          total_amount: 0,
          delivery_fee: 0,
          delivery_address: "RLS Test Order",
        })
        .select("id")
        .single();

      if (orderErr) {
        return new Response(
          JSON.stringify({ error: `Cannot create test order: ${orderErr.message}` }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      testOrderId = newOrder!.id;
    }
  }

  // --- Run tests ---
  const results: TestResult[] = [];
  const t = (name: string, pass: boolean, expected: string, actual: string) =>
    results.push({ name, pass, expected, actual });

  // 1. Customer INSERT
  const { error: e1 } = await sessions.customer.client
    .from("chat_messages")
    .insert({ order_id: testOrderId, sender_id: sessions.customer.uid, sender_type: "customer", message: "[RLS-TEST] customer insert" });
  t("Customer INSERT", !e1, "success", e1 ? e1.message : "success");

  // 2. Rider INSERT
  const { error: e2 } = await sessions.rider.client
    .from("chat_messages")
    .insert({ order_id: testOrderId, sender_id: sessions.rider.uid, sender_type: "rider", message: "[RLS-TEST] rider insert" });
  t("Rider INSERT", !e2, "success", e2 ? e2.message : "success");

  // 3. Outsider INSERT → blocked
  const { error: e3 } = await sessions.outsider.client
    .from("chat_messages")
    .insert({ order_id: testOrderId, sender_id: sessions.outsider.uid, sender_type: "customer", message: "[RLS-TEST] outsider insert" });
  t("Outsider INSERT blocked", !!e3, "RLS error", e3 ? "blocked" : "allowed!");

  // 4. Spoofed sender_id → blocked
  const { error: e4 } = await sessions.rider.client
    .from("chat_messages")
    .insert({ order_id: testOrderId, sender_id: sessions.customer.uid, sender_type: "customer", message: "[RLS-TEST] spoofed sender" });
  t("Spoofed sender_id blocked", !!e4, "RLS error", e4 ? "blocked" : "allowed!");

  // 5. Customer SELECT → sees messages
  const { data: d5 } = await sessions.customer.client
    .from("chat_messages")
    .select("id")
    .eq("order_id", testOrderId);
  t("Customer SELECT visible", (d5?.length ?? 0) > 0, ">0 rows", `${d5?.length ?? 0} rows`);

  // 6. Outsider SELECT → 0 rows
  const { data: d6 } = await sessions.outsider.client
    .from("chat_messages")
    .select("id")
    .eq("order_id", testOrderId);
  t("Outsider SELECT empty", d6?.length === 0, "0 rows", `${d6?.length ?? "?"} rows`);

  // 7. Rider UPDATE read_at → works
  const { data: d7, error: e7 } = await sessions.rider.client
    .from("chat_messages")
    .update({ read_at: new Date().toISOString() })
    .eq("order_id", testOrderId)
    .neq("sender_id", sessions.rider.uid)
    .select("id");
  t("Rider UPDATE read_at", !e7 && (d7?.length ?? 0) > 0, "rows updated", e7 ? e7.message : `${d7?.length ?? 0} rows`);

  // 8. Outsider UPDATE → 0 rows
  const { data: d8 } = await sessions.outsider.client
    .from("chat_messages")
    .update({ read_at: new Date().toISOString() })
    .eq("order_id", testOrderId)
    .select("id");
  t("Outsider UPDATE blocked", d8?.length === 0, "0 rows", `${d8?.length ?? "?"} rows`);

  // --- Clean up test messages ---
  await admin
    .from("chat_messages")
    .delete()
    .eq("order_id", testOrderId)
    .like("message", "[RLS-TEST]%");

  const passed = results.filter((r) => r.pass).length;
  const failed = results.filter((r) => !r.pass).length;

  return new Response(
    JSON.stringify({
      summary: { total: results.length, passed, failed },
      results,
      testOrderId,
      timestamp: new Date().toISOString(),
    }),
    {
      status: failed > 0 ? 422 : 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
});
