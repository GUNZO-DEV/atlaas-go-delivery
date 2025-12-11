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

    // Create or get admin account (first-time setup)
    let adminId: string;
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const adminExists = existingUsers?.users.find(u => u.email === 'admin@atlaas.com');
    
    if (adminExists) {
      adminId = adminExists.id;
      console.log('Admin already exists:', adminId);
      
      await supabaseAdmin.auth.admin.updateUserById(adminId, {
        password: 'admin123456'
      });
    } else {
      const { data: adminAuth, error: adminAuthError } = await supabaseAdmin.auth.admin.createUser({
        email: 'admin@atlaas.com',
        password: 'admin123456',
        email_confirm: true,
        user_metadata: { full_name: 'ATLAAS Admin' }
      });

      if (adminAuthError) {
        console.error('Admin auth error:', adminAuthError);
        throw adminAuthError;
      }

      adminId = adminAuth.user.id;
      console.log('Created admin:', adminId);
    }

    // Ensure admin role is assigned
    const { error: adminRoleError } = await supabaseAdmin
      .from('user_roles')
      .upsert({ user_id: adminId, role: 'admin' }, { onConflict: 'user_id,role' });

    if (adminRoleError) {
      console.error('Admin role error:', adminRoleError);
    }

    // Create or get merchant account
    let merchantId: string;
    const merchantExists = existingUsers?.users.find(u => u.email === 'merchant@test.com');
    
    if (merchantExists) {
      merchantId = merchantExists.id;
      console.log('Merchant already exists:', merchantId);
      
      // Update password
      await supabaseAdmin.auth.admin.updateUserById(merchantId, {
        password: 'merchant123'
      });
    } else {
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

      merchantId = merchantAuth.user.id;
      console.log('Created merchant:', merchantId);
    }

    // Ensure merchant role is assigned
    const { error: merchantRoleError } = await supabaseAdmin
      .from('user_roles')
      .upsert({ user_id: merchantId, role: 'merchant' }, { onConflict: 'user_id,role' });

    if (merchantRoleError) {
      console.error('Merchant role error:', merchantRoleError);
    }

    // Create or get rider account
    let riderId: string;
    const riderExists = existingUsers?.users.find(u => u.email === 'rider@test.com');
    
    if (riderExists) {
      riderId = riderExists.id;
      console.log('Rider already exists:', riderId);
      
      await supabaseAdmin.auth.admin.updateUserById(riderId, {
        password: 'rider123'
      });
    } else {
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

      riderId = riderAuth.user.id;
      console.log('Created rider:', riderId);
    }

    // Ensure rider role is assigned
    const { error: riderRoleError } = await supabaseAdmin
      .from('user_roles')
      .upsert({ user_id: riderId, role: 'rider' }, { onConflict: 'user_id,role' });

    if (riderRoleError) {
      console.error('Rider role error:', riderRoleError);
    }

    // Create or get customer account
    let customerId: string;
    const customerExists = existingUsers?.users.find(u => u.email === 'customer@test.com');
    
    if (customerExists) {
      customerId = customerExists.id;
      console.log('Customer already exists:', customerId);
      
      await supabaseAdmin.auth.admin.updateUserById(customerId, {
        password: 'customer123'
      });
    } else {
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

      customerId = customerAuth.user.id;
      console.log('Created customer:', customerId);
    }

    // Ensure customer role is assigned
    const { error: customerRoleError } = await supabaseAdmin
      .from('user_roles')
      .upsert({ user_id: customerId, role: 'customer' }, { onConflict: 'user_id,role' });

    if (customerRoleError) {
      console.error('Customer role error:', customerRoleError);
    }

    // Create or get Lyn Ifrane merchant account
    let lynIfraneId: string;
    const lynIfraneExists = existingUsers?.users.find(u => u.email === 'lynifrane@atlaas.com');
    
    if (lynIfraneExists) {
      lynIfraneId = lynIfraneExists.id;
      console.log('Lyn Ifrane already exists:', lynIfraneId);
      
      await supabaseAdmin.auth.admin.updateUserById(lynIfraneId, {
        password: 'lynifrane123'
      });
    } else {
      const { data: lynIfraneAuth, error: lynIfraneAuthError } = await supabaseAdmin.auth.admin.createUser({
        email: 'lynifrane@atlaas.com',
        password: 'lynifrane123',
        email_confirm: true,
        user_metadata: { full_name: 'Lyn Restaurant Ifrane' }
      });

      if (lynIfraneAuthError) {
        console.error('Lyn Ifrane auth error:', lynIfraneAuthError);
        throw lynIfraneAuthError;
      }

      lynIfraneId = lynIfraneAuth.user.id;
      console.log('Created Lyn Ifrane:', lynIfraneId);
    }

    // Ensure merchant role is assigned to Lyn Ifrane
    const { error: lynIfraneRoleError } = await supabaseAdmin
      .from('user_roles')
      .upsert({ user_id: lynIfraneId, role: 'merchant' }, { onConflict: 'user_id,role' });

    if (lynIfraneRoleError) {
      console.error('Lyn Ifrane role error:', lynIfraneRoleError);
    }

    // Create or get restaurant for Lyn Ifrane
    let lynRestaurant: any;
    const { data: existingLynRestaurant } = await supabaseAdmin
      .from('restaurants')
      .select('*')
      .eq('merchant_id', lynIfraneId)
      .maybeSingle();

    if (existingLynRestaurant) {
      lynRestaurant = existingLynRestaurant;
      console.log('Lyn Restaurant already exists:', lynRestaurant.id);
    } else {
      const { data: newLynRestaurant, error: lynRestaurantError } = await supabaseAdmin
        .from('restaurants')
        .insert({
          merchant_id: lynIfraneId,
          name: 'Lyn Restaurant',
          description: 'A cozy restaurant in Ifrane offering a mix of Moroccan and international cuisine.',
          address: 'Avenue de la Marche Verte, Ifrane',
          phone: '+212535566778',
          cuisine_type: 'Moroccan & International',
          latitude: 33.5333,
          longitude: -5.1111,
          image_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
          is_active: true,
          commission_rate: 10.00
        })
        .select()
        .single();

      if (lynRestaurantError) {
        console.error('Lyn Restaurant error:', lynRestaurantError);
        throw lynRestaurantError;
      }

      lynRestaurant = newLynRestaurant;
      console.log('Created Lyn Restaurant:', lynRestaurant.id);
    }

    // Create or get restaurant for merchant
    let restaurant: any;
    const { data: existingRestaurant } = await supabaseAdmin
      .from('restaurants')
      .select('*')
      .eq('merchant_id', merchantId)
      .maybeSingle();

    if (existingRestaurant) {
      restaurant = existingRestaurant;
      console.log('Restaurant already exists:', restaurant.id);
    } else {
      const { data: newRestaurant, error: restaurantError } = await supabaseAdmin
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

      restaurant = newRestaurant;
      console.log('Created restaurant:', restaurant.id);
    }

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

    // Check if menu items already exist
    const { data: existingItems } = await supabaseAdmin
      .from('menu_items')
      .select('id')
      .eq('restaurant_id', restaurant.id);

    if (!existingItems || existingItems.length === 0) {
      const { error: menuError } = await supabaseAdmin
        .from('menu_items')
        .insert(menuItems);

      if (menuError) {
        console.error('Menu items error:', menuError);
        throw menuError;
      }

      console.log('Created menu items');
    } else {
      console.log('Menu items already exist');
    }

    // Log the credentials for debugging (server-side only, not returned to client)
    console.log('Test accounts configured. Check server logs for credentials.');

    // Return success WITHOUT exposing credentials
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Test accounts created successfully. Check the TestSetup page for login credentials.',
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
