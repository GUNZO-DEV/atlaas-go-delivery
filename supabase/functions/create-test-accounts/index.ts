import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Create merchant account
    const { data: merchantAuth, error: merchantAuthError } = await supabaseAdmin.auth.admin.createUser({
      email: 'merchant@test.com',
      password: 'merchant123',
      email_confirm: true,
      user_metadata: { full_name: 'Test Merchant' }
    });

    if (merchantAuthError) {
      console.error('Merchant auth error:', merchantAuthError);
      throw merchantAuthError;
    }

    const merchantId = merchantAuth.user.id;
    console.log('Created merchant:', merchantId);

    // Create rider account
    const { data: riderAuth, error: riderAuthError } = await supabaseAdmin.auth.admin.createUser({
      email: 'rider@test.com',
      password: 'rider123',
      email_confirm: true,
      user_metadata: { full_name: 'Test Rider' }
    });

    if (riderAuthError) {
      console.error('Rider auth error:', riderAuthError);
      throw riderAuthError;
    }

    const riderId = riderAuth.user.id;
    console.log('Created rider:', riderId);

    // Create customer account
    const { data: customerAuth, error: customerAuthError } = await supabaseAdmin.auth.admin.createUser({
      email: 'customer@test.com',
      password: 'customer123',
      email_confirm: true,
      user_metadata: { full_name: 'Test Customer' }
    });

    if (customerAuthError) {
      console.error('Customer auth error:', customerAuthError);
      throw customerAuthError;
    }

    const customerId = customerAuth.user.id;
    console.log('Created customer:', customerId);

    // Create restaurant for merchant
    const { data: restaurant, error: restaurantError } = await supabaseAdmin
      .from('restaurants')
      .insert({
        merchant_id: merchantId,
        name: 'Atlas Tajine House',
        description: 'Authentic Moroccan cuisine in the heart of Marrakech. Specializing in traditional tajines, couscous, and pastries.',
        address: '45 Rue des Banques, Médina, Marrakech',
        phone: '+212524389234',
        cuisine_type: 'Moroccan',
        latitude: 31.6295,
        longitude: -7.9811,
        image_url: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800',
        is_active: true,
        commission_rate: 10.00
      })
      .select()
      .single();

    if (restaurantError) {
      console.error('Restaurant error:', restaurantError);
      throw restaurantError;
    }

    console.log('Created restaurant:', restaurant.id);

    // Create menu items
    const menuItems = [
      {
        restaurant_id: restaurant.id,
        name: 'Chicken Tajine',
        description: 'Slow-cooked chicken with preserved lemons, olives, and aromatic spices',
        price: 85.00,
        category: 'Main Course',
        image_url: 'https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=400',
        is_available: true
      },
      {
        restaurant_id: restaurant.id,
        name: 'Lamb Couscous',
        description: 'Traditional couscous with tender lamb, vegetables, and chickpeas',
        price: 95.00,
        category: 'Main Course',
        image_url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400',
        is_available: true
      },
      {
        restaurant_id: restaurant.id,
        name: 'Beef Kefta Tajine',
        description: 'Spiced ground beef meatballs in rich tomato sauce with eggs',
        price: 75.00,
        category: 'Main Course',
        image_url: 'https://images.unsplash.com/photo-1625937286074-9ca519d5d9df?w=400',
        is_available: true
      },
      {
        restaurant_id: restaurant.id,
        name: 'Vegetable Tajine',
        description: 'Seasonal vegetables slow-cooked with olive oil and herbs',
        price: 65.00,
        category: 'Main Course',
        image_url: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400',
        is_available: true
      },
      {
        restaurant_id: restaurant.id,
        name: 'Harira Soup',
        description: 'Traditional Moroccan tomato-based soup with lentils and chickpeas',
        price: 30.00,
        category: 'Starter',
        image_url: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400',
        is_available: true
      },
      {
        restaurant_id: restaurant.id,
        name: 'Moroccan Salad',
        description: 'Fresh tomatoes, cucumbers, and peppers with olive oil',
        price: 25.00,
        category: 'Starter',
        image_url: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400',
        is_available: true
      },
      {
        restaurant_id: restaurant.id,
        name: 'Baklava',
        description: 'Sweet pastry with honey and nuts',
        price: 35.00,
        category: 'Dessert',
        image_url: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400',
        is_available: true
      },
      {
        restaurant_id: restaurant.id,
        name: 'Mint Tea',
        description: 'Traditional Moroccan mint tea',
        price: 15.00,
        category: 'Beverage',
        image_url: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400',
        is_available: true
      }
    ];

    const { error: menuError } = await supabaseAdmin
      .from('menu_items')
      .insert(menuItems);

    if (menuError) {
      console.error('Menu items error:', menuError);
      throw menuError;
    }

    console.log('Created menu items');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Test accounts created successfully',
        accounts: {
          merchant: { email: 'merchant@test.com', password: 'merchant123' },
          rider: { email: 'rider@test.com', password: 'rider123' },
          customer: { email: 'customer@test.com', password: 'customer123' }
        },
        restaurant: {
          id: restaurant.id,
          name: restaurant.name
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
