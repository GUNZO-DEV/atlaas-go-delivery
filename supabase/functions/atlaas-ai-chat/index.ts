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
      .select('id, name, cuisine_type, description, address, average_rating, review_count, is_active, delivery_time_min, delivery_time_max, minimum_order')
      .eq('is_active', true)
      .order('average_rating', { ascending: false });

    if (dbError) {
      console.error('Database error:', dbError);
    }

    // Fetch menu items with restaurant names
    const { data: menuItems } = await supabase
      .from('menu_items')
      .select('name, category, restaurant_id, price, description')
      .eq('is_available', true)
      .order('popularity_score', { ascending: false })
      .limit(100);

    // Fetch active promotions
    const { data: promotions } = await supabase
      .from('promotions')
      .select('code, description, discount_percentage, discount_amount, min_order_amount, expires_at')
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString());

    // Get current hour for time-aware recommendations
    const currentHour = new Date().getHours();
    const mealTime = currentHour >= 6 && currentHour < 11 ? 'breakfast' : 
                     currentHour >= 11 && currentHour < 15 ? 'lunch' :
                     currentHour >= 15 && currentHour < 18 ? 'afternoon snack' :
                     currentHour >= 18 && currentHour < 22 ? 'dinner' : 'late night';

    // Create restaurant context with delivery info
    const restaurantContext = restaurants ? restaurants.map(r => 
      `**${r.name}** (${r.cuisine_type || 'Various'}) - ${r.description || 'No description'} - ⭐ ${r.average_rating}/5 (${r.review_count} reviews) - 📍 ${r.address} - 🕐 ${r.delivery_time_min || 20}-${r.delivery_time_max || 45} min - Min order: ${r.minimum_order || 0} MAD`
    ).join('\n') : 'No restaurants available';

    // Group menu items by restaurant
    const restaurantMenuMap = new Map<string, typeof menuItems>();
    menuItems?.forEach(item => {
      const existing = restaurantMenuMap.get(item.restaurant_id) || [];
      existing.push(item);
      restaurantMenuMap.set(item.restaurant_id, existing);
    });

    // Create menu context with categories
    const menuContext = menuItems ? Array.from(new Set(menuItems.map(m => m.category))).map(category => {
      const categoryItems = menuItems.filter(m => m.category === category).slice(0, 5);
      return `**${category || 'Other'}**: ${categoryItems.map(m => `${m.name} (${m.price} MAD)`).join(', ')}`;
    }).join('\n') : '';

    // Promotions context
    const promoContext = promotions && promotions.length > 0 ? 
      promotions.map(p => `🎁 ${p.code}: ${p.description} - ${p.discount_percentage ? p.discount_percentage + '% off' : p.discount_amount + ' MAD off'}${p.min_order_amount ? ` (min ${p.min_order_amount} MAD)` : ''}`).join('\n') : 
      'No active promotions right now';

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { 
            role: "system", 
            content: `You are ATLAAS AI, the intelligent food discovery assistant for ATLAAS GO - Morocco's favorite food delivery app.

## YOUR PERSONALITY
- Friendly, enthusiastic, and genuinely helpful
- You speak casually but professionally, like a foodie friend
- Use emojis thoughtfully (1-2 per response) to add warmth
- Be concise (under 150 words) unless detailed info is requested
- Personalize recommendations based on context

## CURRENT CONTEXT
🕐 It's ${mealTime} time right now - tailor your suggestions accordingly!

## RESTAURANTS ON ATLAAS GO
${restaurantContext || 'Currently loading restaurant data...'}

## MENU HIGHLIGHTS BY CATEGORY
${menuContext || 'Currently loading menu data...'}

## ACTIVE PROMOTIONS & DEALS
${promoContext}

## SMART RESPONSE GUIDELINES

### Restaurant Recommendations
- ONLY recommend restaurants from the list above
- Always mention: **restaurant name**, cuisine type, rating, delivery time, and why it's a good choice
- Consider meal time when suggesting (breakfast spots in morning, etc.)
- If asked about unavailable options, suggest similar alternatives from our list
- Highlight promotions when relevant

### Menu Suggestions
- Reference actual menu items with accurate prices in MAD
- Group by category when showing multiple options
- Suggest pairings (e.g., "This goes great with...")

### Smart Features
- Proactively mention applicable promo codes
- Consider delivery times for urgent orders
- Suggest popular/trending items when asked for recommendations
- If user seems undecided, ask clarifying questions (budget, cuisine preference, dietary needs)

### Order & Delivery Questions
- Guide users to the Orders page for tracking
- Explain ATLAAS Prime benefits (free delivery, 2x loyalty points)
- Help with delivery estimates based on restaurant data

### Response Format
- Use **bold** for restaurant names and important info
- Use bullet points for multiple options
- Keep recommendations to 2-3 choices unless more requested
- End with a helpful follow-up question when appropriate

## LIMITATIONS (direct users appropriately)
- Real-time order tracking → Orders page
- Payments/refunds → Support
- Table reservations → LYN feature (for dine-in)

Remember: Make food discovery delightful! Help users find their perfect meal. 🍽️` 
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
