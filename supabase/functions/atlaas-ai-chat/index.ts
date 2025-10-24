import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.1';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds
const RATE_LIMIT_MAX_REQUESTS = 50; // Max 50 requests per hour per IP
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Rate limiting by IP address
    const clientIP = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const now = Date.now();
    
    const clientData = rateLimitMap.get(clientIP);
    
    if (clientData) {
      // Check if rate limit window has expired
      if (now > clientData.resetTime) {
        // Reset the counter
        rateLimitMap.set(clientIP, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
      } else {
        // Check if limit exceeded
        if (clientData.count >= RATE_LIMIT_MAX_REQUESTS) {
          const retryAfter = Math.ceil((clientData.resetTime - now) / 1000);
          return new Response(
            JSON.stringify({ 
              error: "Rate limit exceeded. Please try again later.",
              retryAfter: retryAfter 
            }), 
            {
              status: 429,
              headers: { 
                ...corsHeaders, 
                "Content-Type": "application/json",
                "Retry-After": retryAfter.toString()
              },
            }
          );
        }
        // Increment counter
        clientData.count++;
      }
    } else {
      // First request from this IP
      rateLimitMap.set(clientIP, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    }

    // Clean up old entries (optional, prevents memory buildup)
    for (const [ip, data] of rateLimitMap.entries()) {
      if (now > data.resetTime + RATE_LIMIT_WINDOW) {
        rateLimitMap.delete(ip);
      }
    }

    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch restaurants from database
    const { data: restaurants, error: dbError } = await supabase
      .from('restaurants')
      .select('id, name, cuisine_type, description, address, average_rating, review_count, is_active')
      .eq('is_active', true)
      .order('average_rating', { ascending: false });

    if (dbError) {
      console.error('Database error:', dbError);
    }

    // Fetch popular menu items
    const { data: menuItems } = await supabase
      .from('menu_items')
      .select('name, category, restaurant_id, price')
      .eq('is_available', true)
      .limit(50);

    // Create restaurant context
    const restaurantContext = restaurants ? restaurants.map(r => 
      `${r.name} (${r.cuisine_type || 'Various'}) - ${r.description || 'No description'} - Rating: ${r.average_rating}/5 (${r.review_count} reviews) - Location: ${r.address}`
    ).join('\n') : 'No restaurants available';

    const popularItems = menuItems ? menuItems.slice(0, 20).map(m => 
      `${m.name} (${m.category || 'Food'}) - ${m.price} MAD`
    ).join('\n') : '';

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { 
            role: "system", 
            content: `You are ATLAAS AI, the intelligent assistant for ATLAAS GO - Morocco's premier food delivery platform. 

CRITICAL: You must ONLY recommend restaurants and menu items from the database provided below. Never mention restaurants that are not in this list.

=== AVAILABLE RESTAURANTS ===
${restaurantContext}

=== POPULAR MENU ITEMS ===
${popularItems}

Your capabilities:
- Recommend restaurants ONLY from the list above
- Suggest specific dishes from the menu items listed
- Help with order tracking and delivery questions
- Explain Moroccan cuisine and cultural food traditions
- Assist with payment methods and loyalty points

When users ask for recommendations:
- ONLY suggest restaurants from the database above
- Mention specific ratings, cuisine types, and locations from the data
- Reference actual menu items with their prices
- If a user asks about a restaurant not in the database, politely say it's not available on ATLAAS GO yet
- Be enthusiastic but ONLY about restaurants that actually exist in our system

Keep responses helpful, friendly, and concise. Use emojis occasionally.` 
          },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Service busy, please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI service temporarily unavailable." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
